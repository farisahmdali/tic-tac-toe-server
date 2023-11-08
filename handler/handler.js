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
const model_1 = __importDefault(require("../model/model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const map = new Map();
const reset = new Map();
const rooms = [];
class Handler {
    signup({ fullName, email, password, otp }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUser = yield model_1.default.getUser(email);
            if (isUser && otp !== map.get(email)) {
                return false;
            }
            else {
                console.log(password);
                password = yield bcrypt_1.default.hash(password, 2);
                let user = yield model_1.default.save({ fullName, email, password });
                console.log(process.env.KEY);
                return jsonwebtoken_1.default.sign({ _id: user }, process.env.KEY + "");
            }
        });
    }
    otp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUser = yield model_1.default.getUser(email);
            if (isUser) {
                return false;
            }
            else {
                const otpCode = Math.floor(100000 + Math.random() * 900000);
                console.log(otpCode);
                map.set(email, otpCode);
                const message = `The OTP for the Tic-Tac-Toe Game : ${otpCode}`;
                model_1.default.sendMail(message, email, "OTP");
                return true;
            }
        });
    }
    getUser(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(_id);
            const user = yield model_1.default.getUserById(_id);
            // delete user.password;
            return user;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield model_1.default.getUser(email);
                console.log(user, password);
                const auth = yield bcrypt_1.default.compare(password, user.password);
                console.log(auth);
                if (auth) {
                    const token = jsonwebtoken_1.default.sign({ _id: user._id + "" }, process.env.KEY + "");
                    return token;
                }
                else {
                    return false;
                }
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    resetPasswordOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otpCode = Math.floor(100000 + Math.random() * 900000);
                console.log(otpCode);
                reset.set(email, otpCode);
                const message = `The OTP for the Tic-Tac-Toe Game to reset password : ${otpCode}`;
                model_1.default.sendMail(message, email, "OTP");
                return true;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    resetPassword(email, password, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isUser = yield model_1.default.getUser(email);
                if (otp === reset.get(email) && isUser) {
                    console.log(email, password, otp);
                    password = yield bcrypt_1.default.hash(password, 2);
                    model_1.default.resetPassword(email, password);
                    return true;
                }
                else {
                    return false;
                }
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    searchUser(word, _id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let users = yield model_1.default.getEmailStartsWith(word, _id);
                return users;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    searchTournament(id, elem) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield model_1.default.getTournamentStartsWith(id, elem);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    addfrnd(id, frndId) {
        try {
            model_1.default.addfrnd(id, frndId);
        }
        catch (err) {
            console.log(err);
        }
    }
    removefrnd(id, frndId) {
        try {
            model_1.default.removefrnd(id, frndId);
        }
        catch (err) {
            console.log(err);
        }
    }
    getFrndsDetails(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const frnds = [];
                for (let i = 0; i < (ids === null || ids === void 0 ? void 0 : ids.length); i++) {
                    let res = yield model_1.default.getUserById(ids[i]);
                    res === null || res === void 0 ? true : delete res.password;
                    frnds.push(res);
                }
                return frnds;
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    hostTournament(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield model_1.default.getUserById(data.id);
                let hostId;
                const invite = data === null || data === void 0 ? void 0 : data.invite;
                let Code;
                if (data.type === "private") {
                    Code = Math.floor(100000 + Math.random() * 900000);
                }
                data === null || data === void 0 ? true : delete data.invite;
                if (data.instant) {
                    hostId = yield model_1.default.hostTournament({
                        admin: data.id,
                        head: data.head,
                        description: data === null || data === void 0 ? void 0 : data.description,
                        limit: data.limit,
                        pass: Code,
                        type: data.type,
                        viewers: 0,
                        instant: data.instant,
                        view: (data === null || data === void 0 ? void 0 : data.view) || false,
                        amount: data === null || data === void 0 ? void 0 : data.amount,
                        Started: false
                    });
                }
                else {
                    const date = new Date(data === null || data === void 0 ? void 0 : data.date);
                    const currentTime = new Date();
                    const inputTime = data === null || data === void 0 ? void 0 : data.time;
                    const [inputHours, inputMinutes] = inputTime.split(":").map(Number);
                    if (date.getDate() > currentTime.getDate() &&
                        date.getMonth() >= currentTime.getMonth() &&
                        date.getFullYear() >= currentTime.getFullYear()) {
                        hostId = yield model_1.default.hostTournament({
                            admin: data.id,
                            head: data.head,
                            description: data === null || data === void 0 ? void 0 : data.description,
                            instant: data.instant,
                            limit: data.limit,
                            type: data.type,
                            date: data.date,
                            time: data.time,
                        });
                    }
                    else {
                        if (inputHours >= currentTime.getHours() &&
                            inputMinutes > currentTime.getMinutes()) {
                            hostId = yield model_1.default.hostTournament({
                                admin: data.id,
                                head: data.head,
                                description: data === null || data === void 0 ? void 0 : data.description,
                                instant: data.instant,
                                limit: data.limit,
                                type: data.type,
                                date: data.date,
                                time: data.time,
                            });
                        }
                        else {
                            return false;
                        }
                    }
                }
                invite.map((x) => {
                    const message = `You have a notification from ${user.email}.Your invited to the Tournament ${data.head}.${data.description}`;
                    model_1.default.sendMail(message, x, "Tic-Tac-Toe");
                    model_1.default.addNotificationTournamentInvitation(x, hostId);
                });
                return { hostId, Code };
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    getRoomId() {
        try {
            while (true) {
                const roomId = Math.floor(10000000 + Math.random() * 900000000);
                if (!rooms.includes(roomId)) {
                    rooms.push(roomId);
                    return roomId;
                }
            }
        }
        catch (err) {
            return false;
        }
    }
    removeRooms(room) {
        const index = rooms.indexOf(room);
        if (index !== -1) {
            rooms.splice(index);
        }
    }
    getTournament(id, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield model_1.default.getTournaments(id, limit);
                return data;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    getOpponentDetails(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield model_1.default.getUser(email);
                delete user.password;
                return user;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    getMyTournaments(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield model_1.default.getMyTournamentsAndJoinedTournaments(id);
                delete user.password;
                return user;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    saveTournaments(id, tournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield model_1.default.getTournmentDetails(tournamentId);
                if ((res === null || res === void 0 ? void 0 : res.type) === "public") {
                    model_1.default.saveTournament(id, tournamentId);
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    getTournamentDetails(id, tournamentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield model_1.default.getTournmentDetails(tournamentId);
                if (id + "" !== res.admin + "" && (res === null || res === void 0 ? void 0 : res.pass)) {
                    delete res.pass;
                }
                return res;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
    RankSorted() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield model_1.default.getUsersByRank();
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    updateName(id, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield model_1.default.updateName(id, name);
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    orderPayment(amount, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield model_1.default.createOrder(amount, id);
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    addCredits(order, id) {
        try {
            model_1.default.addCredits(order, id);
        }
        catch (err) {
            console.log(err);
            throw Error();
        }
    }
    withdraw(id, amount, upiId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield model_1.default.getUserById(id);
                model_1.default.withdraw({ email: user === null || user === void 0 ? void 0 : user.email, amount, upiId, fullName: user === null || user === void 0 ? void 0 : user.fullName }, id, amount);
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    withdrawLogin(username, password) {
        try {
            console.log(process.env.USERNAMEW, process.env.PASS);
            if (username === process.env.USERNAMEW && password === process.env.PASSWORD) {
                return jsonwebtoken_1.default.sign({ username }, process.env.WITHDRAWSECRET + "");
            }
            else {
                return false;
            }
        }
        catch (err) {
            console.log(err);
            throw Error();
        }
    }
    getWithdrawdata() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield model_1.default.getWithdrawadata();
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    withdrawDone(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                model_1.default.withdrawDone(id);
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
    addNotication(_id, nId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield model_1.default.getUserById(_id);
                model_1.default.saveNotifictionId(res.email, nId);
            }
            catch (err) {
                console.log(err);
                throw Error();
            }
        });
    }
}
exports.default = new Handler();
