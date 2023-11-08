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
const handler_1 = __importDefault(require("../handler/handler"));
class Controller {
    constructor() { }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let token = yield handler_1.default.signup(req.body);
                if (token) {
                    res.status(200).send({ token });
                }
                else {
                    res.status(403).send("OTP is incorrect");
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    otp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let a = yield handler_1.default.otp(req.body.email);
                if (a) {
                    res.sendStatus(200);
                }
                else {
                    res.status(403).send("User Already exist");
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield handler_1.default.getUser(req._id);
                res.status(200).send({ user });
            }
            catch (err) {
                console.log(err, "hello");
                res.sendStatus(500);
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.query);
                let token = yield handler_1.default.login(req.query.email + "", req.query.password + "");
                if (token) {
                    res.status(200).send({ token });
                }
                else {
                    res.sendStatus(403);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    resetPasswordOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let val = yield handler_1.default.resetPasswordOtp(req.body.email);
                if (val) {
                    res.sendStatus(200);
                }
                else {
                    res.sendStatus(403);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let val = yield handler_1.default.resetPassword(req.body.email, req.body.password, req.body.otp);
                if (val) {
                    res.sendStatus(200);
                }
                else {
                    res.sendStatus(403);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    searchUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield handler_1.default.searchUser(req.query.word + "", req._id);
                res.status(200).send({ user });
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    hostTournament(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const valid = yield handler_1.default.hostTournament(Object.assign({ id: req._id }, req.body));
                if (valid) {
                    res.status(200).send(valid);
                }
                else {
                    console.log("error");
                    res.sendStatus(403);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    searchTournament(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const valid = yield handler_1.default.searchTournament(req._id, req.query.elem);
                if (valid) {
                    res.status(200).send(valid);
                }
                else {
                    console.log("error");
                    res.sendStatus(403);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    addfrnd(req, res) {
        try {
            handler_1.default.addfrnd(req._id, req.body.id);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    removefrnd(req, res) {
        try {
            handler_1.default.removefrnd(req._id, req.body.id);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    getFrndsDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const frnds = yield handler_1.default.getFrndsDetails(req.query.ids);
                res.status(200).send(frnds);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    getRoomId(req, res) {
        try {
            let roomId = handler_1.default.getRoomId();
            if (roomId) {
                res.status(200).send({ roomId });
            }
            else {
                res.sendStatus(500);
            }
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    getTournaments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tournaments = yield handler_1.default.getTournament(req._id, req.query.limit);
                if (tournaments) {
                    res.status(200).send({ tournaments });
                }
                else {
                    res.sendStatus(500);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    getOpponentDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield handler_1.default.getOpponentDetails(req.query.email + "");
                res.status(200).send({ user });
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    getMyTournament(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let user = yield handler_1.default.getMyTournaments(req._id);
                res.status(200).send({ user });
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    saveTournament(req, res) {
        try {
            handler_1.default.saveTournaments(req._id, req.body.tournamentId);
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    getTournamentDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield handler_1.default.getTournamentDetails(req._id, req.query.tournamentId);
                res.status(200).send(data);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    getRankSorted(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield handler_1.default.RankSorted();
                res.status(200).send(data);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    addNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                handler_1.default.addNotication(req._id, req.body.nId);
                res.sendStatus(200);
            }
            catch (err) {
                res.sendStatus(500);
            }
        });
    }
    updateName(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                handler_1.default.updateName(req === null || req === void 0 ? void 0 : req._id, (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.name);
                res.sendStatus(200);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    orderPayment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const order = yield handler_1.default.orderPayment(req.query.amount, req._id);
                res.status(200).send({ order });
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    addCredits(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                handler_1.default.addCredits(req.body.order, req._id);
                res.sendStatus(200);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    withdraw(req, res) {
        try {
            handler_1.default.withdraw(req._id, req.body.amount, req.body.upiId);
            res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    withdrawLogin(req, res) {
        try {
            const token = handler_1.default.withdrawLogin(req.query.username, req.query.password);
            if (token) {
                res.status(200).send({ token });
            }
            else {
                res.sendStatus(403);
            }
        }
        catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
    getWithdrawdata(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield handler_1.default.getWithdrawdata();
                if (data) {
                    res.status(200).send({ data });
                }
                else {
                    res.sendStatus(403);
                }
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
    withdrawDone(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                handler_1.default.withdrawDone(req.body.id);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
}
exports.default = new Controller();
