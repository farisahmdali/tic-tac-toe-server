"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const mongodbConnection_1 = require("../connections/mongodbConnection");
const nodemailer_1 = __importDefault(require("nodemailer"));
const razorpay_1 = __importDefault(require("razorpay"));
const paymentOrder = new Map();
const instance = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID + "",
    key_secret: process.env.RAZORPAY_KEY_SECRET + "",
});
class Model {
    getUser(email) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").findOne({ email }));
        });
    }
    save(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").insertOne(Object.assign(Object.assign({}, data), { score: 0, wins: 0 })));
            return (res === null || res === void 0 ? void 0 : res.insertedId) + "";
        });
    }
    getUserById(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").aggregate([
                { $match: { _id: new mongodb_1.ObjectId(id) } },
                {
                    $lookup: {
                        from: "users",
                        localField: "frnd",
                        foreignField: "_id",
                        as: "frnds",
                    },
                },
                {
                    $project: {
                        "frnds.password": 0,
                        "frnds.invitedTournament": 0,
                        "frnds.frnd": 0,
                        password: 0,
                    },
                },
            ]).toArray());
            return res[0];
        });
    }
    saveNotifictionId(email, nId) {
        var _a;
        try {
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("notification").updateOne({ email }, { $set: { nId } }, { upsert: true });
        }
        catch (_b) {
            throw Error();
        }
    }
    sendMail(message, email, subject) {
        console.log(process.env.USERN, process.env.PASS);
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USERN,
                pass: process.env.PASS,
            },
        });
        transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: message,
        }, (error, info) => {
            if (error) {
                console.log("Error:", error);
            }
            else {
                console.log("Email sent:", info.response);
            }
        });
    }
    resetPassword(email, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ email }, { $set: { password } }));
        });
    }
    getTournamentStartsWith(_id, word) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            _id = new mongodb_1.ObjectId(_id);
            let pattern = new RegExp(`^${word}`, `i`);
            return yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").aggregate([
                {
                    $match: {
                        head: { $regex: pattern },
                        admin: { $ne: _id },
                    },
                },
            ]).toArray().catch((err) => console.log(err)));
        });
    }
    addfrnd(_id, frndId) {
        var _a;
        try {
            _id = new mongodb_1.ObjectId(_id);
            frndId = new mongodb_1.ObjectId(frndId);
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ _id }, { $addToSet: { frnd: frndId } });
        }
        catch (err) {
            console.log(err);
        }
    }
    removefrnd(_id, frndId) {
        var _a;
        try {
            _id = new mongodb_1.ObjectId(_id);
            frndId = new mongodb_1.ObjectId(frndId);
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ _id }, { $pull: { frnd: frndId } });
        }
        catch (err) {
            console.log(err);
        }
    }
    getEmailStartsWith(word, _id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let pattern = new RegExp(`^${word}`, `i`);
            _id = new mongodb_1.ObjectId(_id);
            let res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").aggregate([
                {
                    $match: {
                        email: { $regex: pattern },
                        _id: { $ne: _id },
                    },
                },
                {
                    $project: {
                        password: 0,
                    },
                },
            ]).toArray().catch((err) => console.log(err)));
            return res;
        });
    }
    hostTournament(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            data.admin = new mongodb_1.ObjectId(data.admin);
            let res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").insertOne(data));
            return res === null || res === void 0 ? void 0 : res.insertedId;
        });
    }
    addNotificationTournamentInvitation(email, hostId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ email }, { $addToSet: { invitedTournamet: hostId } });
        });
    }
    getTournaments(id, limit = 0) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            id = new mongodb_1.ObjectId(id);
            let res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").find({
                Started: { $ne: true },
                $where: function () {
                    return this.joined.length < this.limit;
                },
            }).limit(parseInt(limit + "") + 50).toArray());
            return res;
        });
    }
    updateRank(id, rank) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            id = new mongodb_1.ObjectId(id);
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ _id: id }, { $set: { rank } });
        });
    }
    getUsersInOrder() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").find({}).sort({ score: -1 }).toArray());
        });
    }
    getUsersByRank() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").find({}).sort({ rank: 1 }).limit(10).toArray());
        });
    }
    updateName(id, name) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                id = new mongodb_1.ObjectId(id);
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ _id: id }, { $set: { fullName: name } });
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    createOrder(amount, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let orderG;
                yield instance.orders.create({ amount, currency: "INR" }, (err, order) => {
                    if (err) {
                        throw Error();
                    }
                    else {
                        orderG = order;
                        console.log(orderG, order, "helo");
                        paymentOrder.set(id, order);
                        return order;
                    }
                });
                return orderG;
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    addCredits(order, id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (paymentOrder.get(id).id === (order === null || order === void 0 ? void 0 : order.id) &&
                    paymentOrder.get(id).amount === (order === null || order === void 0 ? void 0 : order.amount)) {
                    (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ _id: new mongodb_1.ObjectId(id) }, { $inc: { credit: order.amount } });
                }
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    withdraw(data, id, amount) {
        var _a, _b;
        try {
            id = new mongodb_1.ObjectId(id);
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ _id: id }, { $inc: { credit: -amount } });
            (_b = (0, mongodbConnection_1.getDb)()) === null || _b === void 0 ? void 0 : _b.collection("withdraws").insertOne(data);
        }
        catch (err) {
            console.log(err);
            throw Error();
        }
    }
    getMyTournamentsAndJoinedTournaments(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                id = new mongodb_1.ObjectId(id);
                let res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").find({ $or: [{ admin: id }, { save: id }] }).toArray());
                return res;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    getTournmentDetails(tournamentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                return yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").findOne({ _id: tournamentId }));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    joinTournament(user, tournamentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user._id = new mongodb_1.ObjectId(user._id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $addToSet: { joined: user } });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    saveTournament(id, tournamentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                id = new mongodb_1.ObjectId(id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $addToSet: { save: id } });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    leftTournament(user, tournamentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user._id = new mongodb_1.ObjectId(user._id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $pull: { joined: user } });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    RequestJoinTournament(id, tournamentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                id = new mongodb_1.ObjectId(id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $addToSet: { req: id } });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    reachedFinal(user, tournamentId) {
        var _a;
        try {
            user._id = new mongodb_1.ObjectId(user._id);
            tournamentId = new mongodb_1.ObjectId(tournamentId);
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $addToSet: { final: user } });
        }
        catch (err) {
            console.log(err);
        }
    }
    winnerFirst(user, tournamentId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user._id = new mongodb_1.ObjectId(user._id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                const date = new Date();
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $set: { first: user } });
                const res = yield ((_b = (0, mongodbConnection_1.getDb)()) === null || _b === void 0 ? void 0 : _b.collection("hostedTournaments").findOne({ _id: tournamentId }));
                (_c = (0, mongodbConnection_1.getDb)()) === null || _c === void 0 ? void 0 : _c.collection("users").updateOne({ _id: user._id }, {
                    $inc: {
                        score: 2,
                        wins: 1,
                        credit: (((res === null || res === void 0 ? void 0 : res.totalPrice) * 100) / 4) * 3,
                    },
                    $push: {
                        history: {
                            tName: res === null || res === void 0 ? void 0 : res.head,
                            prize: 1,
                            tId: tournamentId,
                            date: date.getDate() +
                                "/" +
                                date.getMonth() +
                                "/" +
                                date.getFullYear(),
                            time: date.getHours() + ":" + date.getMinutes(),
                        },
                    },
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    activeUser(email) {
        var _a;
        try {
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ email }, { $set: { active: true } });
        }
        catch (err) {
            console.log(err);
        }
    }
    deactiveUser(email) {
        var _a;
        try {
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("users").updateOne({ email }, { $set: { active: false } });
        }
        catch (err) {
            console.log(err);
        }
    }
    winnerSecond(user, tournamentId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user._id = new mongodb_1.ObjectId(user._id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                const date = new Date();
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $set: { second: user } });
                const res = yield ((_b = (0, mongodbConnection_1.getDb)()) === null || _b === void 0 ? void 0 : _b.collection("hostedTournaments").findOne({ _id: tournamentId }));
                (_c = (0, mongodbConnection_1.getDb)()) === null || _c === void 0 ? void 0 : _c.collection("users").updateOne({ _id: user._id }, {
                    $inc: {
                        score: 1,
                        wins: 1,
                        credit: (((res === null || res === void 0 ? void 0 : res.totalPrice) * 100) / 4) * 1,
                    },
                    $push: {
                        history: {
                            tName: res === null || res === void 0 ? void 0 : res.head,
                            prize: 2,
                            tId: tournamentId,
                            date: date.getDate() +
                                "/" +
                                date.getMonth() +
                                "/" +
                                date.getFullYear(),
                            time: date.getHours() + ":" + date.getMinutes(),
                        },
                    },
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    lostTournament(user, tournamentId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                user._id = new mongodb_1.ObjectId(user._id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                const date = new Date();
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $set: { second: user } });
                const res = yield ((_b = (0, mongodbConnection_1.getDb)()) === null || _b === void 0 ? void 0 : _b.collection("hostedTournaments").findOne({ _id: tournamentId }));
                (_c = (0, mongodbConnection_1.getDb)()) === null || _c === void 0 ? void 0 : _c.collection("users").updateOne({ _id: user._id }, {
                    $inc: { score: -1 },
                    $push: {
                        history: {
                            tName: res === null || res === void 0 ? void 0 : res.head,
                            prize: 3,
                            tId: tournamentId,
                            date: date.getDate() +
                                "/" +
                                date.getMonth() +
                                "/" +
                                date.getFullYear(),
                            time: date.getHours() + ":" + date.getMinutes(),
                        },
                    },
                });
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    reachedSemiFinal(user, tournamentId) {
        var _a;
        try {
            user._id = new mongodb_1.ObjectId(user._id);
            tournamentId = new mongodb_1.ObjectId(tournamentId);
            (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: tournamentId }, { $addToSet: { semiFinal: user } });
        }
        catch (err) {
            console.log(err);
        }
    }
    getTournmentDetailsWithUsers(id, tournamentId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                id = new mongodb_1.ObjectId(id);
                tournamentId = new mongodb_1.ObjectId(tournamentId);
                let res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").findOne({ admin: id, _id: tournamentId }));
                return res;
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    startTournament(id, email) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            id = new mongodb_1.ObjectId(id);
            const tournament = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").findOne({ _id: id }));
            (_b = (0, mongodbConnection_1.getDb)()) === null || _b === void 0 ? void 0 : _b.collection("hostedTournaments").updateOne({ _id: id }, { $set: { Started: true, totalPrice: (tournament === null || tournament === void 0 ? void 0 : tournament.amount) * 4 } });
            (_c = (0, mongodbConnection_1.getDb)()) === null || _c === void 0 ? void 0 : _c.collection("users").updateOne({ email }, { $inc: { played: 1, credit: -(tournament === null || tournament === void 0 ? void 0 : tournament.amount) * 100 } });
        });
    }
    saveScore(id, userId) {
        var _a;
        id = new mongodb_1.ObjectId(id);
        userId = new mongodb_1.ObjectId(userId);
        (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("hostedTournaments").updateOne({ _id: id, "joined._id": userId }, { $inc: { "joined.$.score": 1 } }).catch((x) => {
            console.log(x);
        });
    }
    sendNotification(email, title, body, subtitle, link) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("notification").findOne({ email }));
            fetch("https://fcm.googleapis.com/fcm/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "key=" + process.env.GKEY,
                },
                body: JSON.stringify({
                    to: res.nId,
                    notification: {
                        body,
                        title,
                        subtitle,
                        click_action: "http://localhost:3000/" + link,
                    },
                    data: {
                        route: "/",
                    },
                }),
            });
        });
    }
    getWithdrawadata() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield ((_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("withdraws").find({}).toArray());
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    withdrawDone(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (_a = (0, mongodbConnection_1.getDb)()) === null || _a === void 0 ? void 0 : _a.collection("withdraws").deleteOne({ _id: new mongodb_1.ObjectId(id) });
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
}
exports.default = new Model();
