import * as db from "../models/index.js";
import {IUser} from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const getUserToken = (email: string, password:string) => {
    return new Promise((resolve, reject) => {
        db.User.findOne({
        email: email
    }).populate("roles", "-__v")
        .exec()
        .then((user: IUser | null) => {
            if (user) {
                let validPassword = bcrypt.compareSync(
                    password,
                    user.password
                );
                if (!validPassword) {
                    return reject({message: "Invalid password"})
                }
                let token = jwt.sign({id: user._id}, process.env.SECRET, {
                    expiresIn: 86400
                });
                let authorities = [];
                for (let i = 0; i < user.roles.length; i++) {
                    authorities.push("ROLE_" + user.roles[i].name.toUpperCase())
                }
                resolve({   id: user._id,
                    email: user.email,
                    roles: authorities,
                    accessToken: token})
            } else {
                reject({message: "User not found"})
            }
        })
        .catch((err: any) => {
            reject({message: "Unknown error"})
        })
    })
}

export {getUserToken}
