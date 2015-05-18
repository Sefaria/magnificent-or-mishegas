var VoteButton = React.createClass({
  render: function() {
    return (
      <a {...this.props}
        href="javascript:;"
        role="button"
        className={(this.props.className || '') + ' btn'} />
    );
  }
});

var Quotes = React.createClass({
  getInitialState: function() {
    return {
      quoteText: '',
      quotes: [],
      index: -1
    };
  },

  componentDidMount: function() {
    var twitter_script = document.createElement('script');
    twitter_script.textContent = "!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');";
    document.body.appendChild(twitter_script);
    $.get("http://wfh.ninja/api/quote", function(result) {
      if (this.isMounted()) {
        var quoteIds = _.keys(result);
        quoteIds = _.sample(quoteIds, quoteIds.length);

        this.setState({
          quotes: quoteIds
        });

        this.loadNextQuote();
      }
    }.bind(this));
    window.forceQuote = this.forceQuote;
  },
  
  forceQuote: function(quoteId) {
    $.get("http://wfh.ninja/api/quote/" + quoteId, function(result) {
      if (this.isMounted()) {
        this.setState({
          quoteText: result.text,
          index: this.state.quotes.length // force invalid index to restart it again
        });
        $('.vote-button').attr('disabled', false);
      }
    }.bind(this));
  },

  loadNextQuote: function() {
    if (this.state.index >= (this.state.quotes.length - 1)) {
      quoteIds = _.sample(this.state.quotes, this.state.quotes.length);
      this.setState({
        index: -1,
        quotes: quoteIds
      });
      this.state.index = -1;
    }

    var quoteId = this.state.quotes[this.state.index + 1];

    $.get("http://wfh.ninja/api/quote/" + quoteId, function(result) {
      if (this.isMounted()) {
        this.setState({
          quoteText: result.text,
          index: this.state.index + 1
        });
        $('.vote-button').attr('disabled', false);
      }
    }.bind(this));
  },

  vote: function(value) {
    return function() {
      $('.vote-button').attr('disabled', true);
      var quoteId = this.state.quotes[this.state.index];
      if (!quoteId) {
        return this.loadNextQuote();
      }
      $.ajax({
        type: 'POST',
        url: "http://wfh.ninja/api/quote/" + quoteId + '/vote',
        data: JSON.stringify({ value: value }),
        contentType: "application/json; charset=utf-8",
        success: function(result) { this.loadNextQuote(); }.bind(this)
      });
    }.bind(this);
  },

  render: function() {
    return (
      <div className="site-wrapper-inner">
        <div className="cover-container">
          <div className="inner cover">
            <p className="lead">I'm working from home today because...</p>
            <h1>{this.state.quoteText}</h1>
            <p className="lead">
              <VoteButton onClick={this.vote(1)} className="btn btn-lg btn-success vote-button">Hell, Yeah!</VoteButton>
              <VoteButton onClick={this.vote(-1)} className="btn btn-lg btn-danger vote-button">This won't fly.</VoteButton>
            </p>
            <p className="twitter-wrapper" style={{height: '20px'}}>
              <a href="https://twitter.com/share" className="twitter-share-button" data-via="christinang89" data-dnt="true">Tweet</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
});