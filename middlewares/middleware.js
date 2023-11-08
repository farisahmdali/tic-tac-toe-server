"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class Middleware {
    verifyToken(req, res, next) {
        try {
            if (req.headers.authorization) {
                const { _id } = jsonwebtoken_1.default.verify(req.headers.authorization, process.env.KEY + "");
                console.log(_id, "auth");
                req._id = _id;
                next();
            }
            else {
                console.log("not authenticated");
                res.sendStatus(403);
            }
        }
        catch (err) {
            console.log(err);
            res.sendStatus(403);
        }
    }
    verifyWithdraw(req, res, next) {
        try {
            if (req.query.token) {
                const { username } = jsonwebtoken_1.default.verify(req.query.token, process.env.WITHDRAWSECRET + "");
                console.log(username, "auth");
                req.username = username;
                next();
            }
            else if (req.body.token) {
                const { username } = jsonwebtoken_1.default.verify(req.body.token, process.env.WITHDRAWSECRET + "");
                console.log(username, "auth");
                req.username = username;
                next();
            }
            else {
                console.log("not authenticated");
                res.sendStatus(403);
            }
        }
        catch (err) {
            console.log(err);
            res.sendStatus(403);
        }
    }
}
exports.default = new Middleware();
