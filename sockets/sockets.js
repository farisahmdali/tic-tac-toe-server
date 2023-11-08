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
const handler_1 = __importDefault(require("../handler/handler"));
const localRoomUsers = new Map();
const UserToId = new Map();
const roomMembers = {};
const localRoomSwitchUser = {};
let gamePlay = {};
const setOpponent = new Map();
const idtodata = new Map();
const opponent = {};
const tournamentGroup = new Map();
const score = new Map();
const goldenGame = {};
const tournamentUserOnline = {};
const condition = {};
const emailtoid = new Map();
const randomRoom = [];
function handleSocket(socket) {
    console.log("user connected with id  " + socket.id);
    socket.on("join-local-room", ({ room, user }) => {
        var _a, _b;
        if ((((_a = roomMembers[room + ""]) === null || _a === void 0 ? void 0 : _a.length) < 3 &&
            !((_b = roomMembers[room + ""]) === null || _b === void 0 ? void 0 : _b.includes([user, socket.id]))) ||
            !roomMembers[room + ""]) {
            socket.join(room);
            socket.to(room).emit("join-local-room", { user });
            if (!roomMembers[room + ""]) {
                roomMembers[room + ""] = [[user, socket.id]];
            }
            else {
                roomMembers[room + ""].push([user, socket.id]);
            }
            localRoomUsers.set(socket.id, room);
        }
    });
    socket.on("sendEmail", ({ room, user }) => {
        socket.to(room).emit("sendEmail", { user });
    });
    socket.on("start-local-game", (data) => {
        if (localRoomUsers.get(socket.id)) {
            if (roomMembers[localRoomUsers.get(socket.id) + ""][0][1] === socket.id) {
                socket
                    .to(roomMembers[localRoomUsers.get(socket.id) + ""][1][1])
                    .emit("start-local-game", data);
            }
            else {
                socket
                    .to(roomMembers[localRoomUsers.get(socket.id) + ""][0][1])
                    .emit("start-local-game", data);
            }
        }
    });
    socket.on("play-local-game", (data) => {
        if (localRoomUsers.get(socket.id)) {
            console.log("play-local-game");
            socket.to(localRoomUsers.get(socket.id)).emit("play-local-game", data);
        }
    });
    socket.on("start-playing-local", ({ index, player }) => {
        var _a;
        try {
            if (!gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)]) {
                gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)] = {
                    currentPlayer: player === "X" ? "O" : "X",
                    play: [],
                };
                console.log(gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)]);
                gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].play[index] = player;
            }
            else if (player === ((_a = gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.currentPlayer)) {
                gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].play[index] = player;
                if (player === "X") {
                    gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer = "O";
                }
                else {
                    gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer = "X";
                }
            }
            console.log(gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer, "hello world!");
            socket.to(localRoomUsers.get(socket.id)).emit("start-playing-local", {
                gamePlay: gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].play,
                current: gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer,
            });
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("i-won-local-match", () => {
        socket
            .to(localRoomUsers.get(socket.id))
            .emit("i-won-local-match", gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].play);
    });
    socket.on("switch-player-local", () => {
        var _a, _b;
        try {
            if (!localRoomSwitchUser[localRoomUsers.get(socket.id)]) {
                console.log("hello");
                localRoomSwitchUser[localRoomUsers.get(socket.id)] = [socket.id];
            }
            else {
                localRoomSwitchUser[localRoomUsers.get(socket.id)].push(socket.id);
                if (((_a = localRoomSwitchUser[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.length) >= 2) {
                    localRoomSwitchUser[localRoomUsers.get(socket.id)] = [];
                    if (((_b = gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)]) === null || _b === void 0 ? void 0 : _b.currentPlayer) === "X") {
                        gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer = "O";
                    }
                    else {
                        gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer = "X";
                    }
                }
            }
        }
        catch (err) {
            console.log(err, "heee");
        }
    });
    socket.on("next-round-local", () => {
        var _a, _b;
        try {
            gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].play = [""];
            if (!((_a = gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.round)) {
                gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)] = {
                    play: [],
                    currentPlayer: gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].currentPlayer,
                    round: 2,
                };
            }
            else {
                gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].round =
                    gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].round + 1;
            }
            if (((_b = gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)]) === null || _b === void 0 ? void 0 : _b.round) > 3) {
                socket.to(localRoomUsers.get(socket.id)).emit("local-game-finished");
            }
            else {
                socket
                    .to(localRoomUsers.get(socket.id))
                    .emit("next-round-local", gamePlay[localRoomUsers === null || localRoomUsers === void 0 ? void 0 : localRoomUsers.get(socket.id)].round);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("draw-local", () => {
        socket.to(localRoomUsers.get(socket.id)).emit("draw-local");
    });
    socket.on("local-game-finished", () => {
        socket.to(localRoomUsers.get(socket.id)).emit("local-game-finished-end");
        try {
            if (typeof parseInt(localRoomUsers.get(socket.id)) === "number") {
                handler_1.default.removeRooms(parseInt(localRoomUsers.get(socket.id)));
            }
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("join-tournament-public", ({ user, room }, callback) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let tournament = yield model_1.default.getTournmentDetails(room);
        try {
            if ((tournament === null || tournament === void 0 ? void 0 : tournament.type) === "public" &&
                !((_a = gamePlay[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.confirm)) {
                if (((_b = tournament === null || tournament === void 0 ? void 0 : tournament.joined) === null || _b === void 0 ? void 0 : _b.length) <= 4 || !(tournament === null || tournament === void 0 ? void 0 : tournament.joined)) {
                    if (!((_c = roomMembers[room]) === null || _c === void 0 ? void 0 : _c.includes(user))) {
                        if (tournament === null || tournament === void 0 ? void 0 : tournament.joined) {
                            roomMembers[room] = [...tournament === null || tournament === void 0 ? void 0 : tournament.joined, user];
                        }
                        else {
                            roomMembers[room] = [user];
                        }
                    }
                    model_1.default.joinTournament(user, room);
                    idtodata.set(socket.id, user);
                    localRoomUsers.set(socket.id, room);
                    UserToId.set(user.email, socket.id);
                    socket.join(room);
                }
                else {
                    callback("full");
                    return;
                }
                socket.to(room).emit("updation-tournament-public", roomMembers[room]);
                callback(roomMembers[room]);
                return;
            }
            // callback("full")
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("user-exited-tournament", (data) => __awaiter(this, void 0, void 0, function* () {
        var _d;
        try {
            if (!((_d = gamePlay[localRoomUsers.get(socket.id)]) === null || _d === void 0 ? void 0 : _d.confirm)) {
                const user = idtodata.get(socket.id);
                yield model_1.default.leftTournament(user, localRoomUsers.get(socket.id));
                const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(user);
                if (index !== -1)
                    roomMembers[localRoomUsers.get(socket.id)].splice(index);
                socket
                    .to(localRoomUsers.get(socket.id))
                    .emit("updation-tournament-public", roomMembers[localRoomUsers.get(socket.id)]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("userExited", (data) => __awaiter(this, void 0, void 0, function* () {
        var _e;
        console.log("disconnect", socket.id);
        socket.to(localRoomUsers.get(socket.id)).emit("user-quit");
        UserToId.set(data, socket.id);
        emailtoid.set(socket.id, data);
        if (data) {
            model_1.default.activeUser(data);
        }
        try {
            if (typeof parseInt(localRoomUsers.get(socket.id)) === "number") {
                handler_1.default.removeRooms(parseInt(localRoomUsers.get(socket.id)));
            }
            if (!((_e = gamePlay[localRoomUsers.get(socket.id)]) === null || _e === void 0 ? void 0 : _e.confirm)) {
                const user = idtodata.get(socket.id);
                console.log(user);
                yield model_1.default.leftTournament(user, localRoomUsers.get(socket.id));
                const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(user);
                if (index !== -1) {
                    roomMembers[localRoomUsers.get(socket.id)].splice(index);
                }
                socket
                    .to(localRoomUsers.get(socket.id))
                    .emit("updation-tournament-public", roomMembers[localRoomUsers.get(socket.id)]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
        var _f;
        console.log("disconnect", socket.id);
        if (emailtoid.get(socket.id)) {
            model_1.default.deactiveUser(emailtoid.get(socket.id));
        }
        socket.to(localRoomUsers.get(socket.id)).emit("user-quit");
        try {
            if (typeof parseInt(localRoomUsers.get(socket.id)) === "number") {
                handler_1.default.removeRooms(parseInt(localRoomUsers.get(socket.id)));
            }
            if (!((_f = gamePlay[localRoomUsers.get(socket.id)]) === null || _f === void 0 ? void 0 : _f.confirm)) {
                const user = idtodata.get(socket.id);
                yield model_1.default.leftTournament(user, localRoomUsers.get(socket.id));
                const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(user);
                if (index !== -1) {
                    roomMembers[localRoomUsers.get(socket.id)].splice(index);
                }
                socket
                    .to(localRoomUsers.get(socket.id))
                    .emit("updation-tournament-public", roomMembers[localRoomUsers.get(socket.id)]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("user-online", ({}, callback) => {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            console.log((_a = tournamentUserOnline[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.online, "++++++++++++++++++++++++");
            if ((_b = tournamentUserOnline[localRoomUsers.get(socket.id)]) === null || _b === void 0 ? void 0 : _b.online) {
                if (!((_d = (_c = tournamentUserOnline[localRoomUsers.get(socket.id)]) === null || _c === void 0 ? void 0 : _c.online) === null || _d === void 0 ? void 0 : _d.includes((_e = idtodata.get(socket.id)) === null || _e === void 0 ? void 0 : _e.email))) {
                    tournamentUserOnline[localRoomUsers.get(socket.id)].online.push((_f = idtodata.get(socket.id)) === null || _f === void 0 ? void 0 : _f.email);
                }
            }
            else {
                tournamentUserOnline[localRoomUsers.get(socket.id)] = {
                    online: [(_g = idtodata.get(socket.id)) === null || _g === void 0 ? void 0 : _g.email],
                };
            }
            callback(tournamentUserOnline[localRoomUsers.get(socket.id)].online);
            socket
                .to(localRoomUsers.get(socket.id))
                .emit("user-online", tournamentUserOnline[localRoomUsers.get(socket.id)].online);
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("user-offline", () => {
        var _a;
        try {
            const data = (_a = tournamentUserOnline[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.online;
            const index = data === null || data === void 0 ? void 0 : data.indexOf(idtodata.get(socket.id).email);
            if (index !== -1) {
                data === null || data === void 0 ? void 0 : data.splice(index);
            }
            tournamentUserOnline[localRoomUsers.get(socket.id)].online = data;
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("confirm-tournament", () => {
        delete tournamentUserOnline[localRoomUsers.get(socket.id)];
        gamePlay[localRoomUsers.get(socket.id)] = {
            confirm: true,
            members: roomMembers[localRoomUsers.get(socket.id)],
            matchs: [],
            round: 1,
        };
        model_1.default.startTournament(localRoomUsers.get(socket.id), idtodata.get(socket.id).email);
        let j = 0;
        for (let i = 0; i < roomMembers[localRoomUsers.get(socket.id)].length; i += 2) {
            gamePlay[localRoomUsers.get(socket.id)].matchs[j] = [
                roomMembers[localRoomUsers.get(socket.id)][i],
                roomMembers[localRoomUsers.get(socket.id)][i + 1],
            ];
            j++;
        }
    });
    socket.on("get-matchs-tournament", ({}, callback) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        try {
            if (((_a = gamePlay[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.round) === 1) {
                callback((_b = gamePlay[localRoomUsers.get(socket.id)]) === null || _b === void 0 ? void 0 : _b.matchs);
            }
            else if (((_c = gamePlay[localRoomUsers.get(socket.id)]) === null || _c === void 0 ? void 0 : _c.round) === 2) {
                const winners = [];
                const losers = [];
                for (let i = 0; i < ((_d = roomMembers[localRoomUsers.get(socket.id)]) === null || _d === void 0 ? void 0 : _d.length); i++) {
                    let s = roomMembers[localRoomUsers.get(socket.id)][i];
                    if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 1) {
                        winners.push(s);
                    }
                    else {
                        losers.push(s);
                    }
                }
                gamePlay[localRoomUsers.get(socket.id)].matchs = [];
                for (let i = 0; i < (winners === null || winners === void 0 ? void 0 : winners.length); i += 2) {
                    (_e = gamePlay[localRoomUsers.get(socket.id)].matchs) === null || _e === void 0 ? void 0 : _e.push([
                        winners[i],
                        winners[i + 1],
                    ]);
                }
                for (let i = 0; i < (losers === null || losers === void 0 ? void 0 : losers.length); i += 2) {
                    (_f = gamePlay[localRoomUsers.get(socket.id)].matchs) === null || _f === void 0 ? void 0 : _f.push([
                        losers[i],
                        losers[i + 1],
                    ]);
                }
                callback((_g = gamePlay[localRoomUsers.get(socket.id)]) === null || _g === void 0 ? void 0 : _g.matchs);
            }
            else if (((_h = gamePlay[localRoomUsers.get(socket.id)]) === null || _h === void 0 ? void 0 : _h.round) === 3) {
                gamePlay[localRoomUsers.get(socket.id)].matchs = [[]];
                for (let i = 0; i < ((_j = roomMembers[localRoomUsers.get(socket.id)]) === null || _j === void 0 ? void 0 : _j.length); i++) {
                    let s = roomMembers[localRoomUsers.get(socket.id)][i];
                    if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 2) {
                        model_1.default.reachedFinal(s, localRoomUsers.get(socket.id));
                        if (s.email === idtodata.get(socket.id).email) {
                            callback("final");
                        }
                        gamePlay[localRoomUsers.get(socket.id)] = Object.assign(Object.assign({}, gamePlay[localRoomUsers.get(socket.id)]), { final: [s] });
                    }
                    else if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 1) {
                        model_1.default.reachedSemiFinal(s, localRoomUsers.get(socket.id));
                        (_k = gamePlay[localRoomUsers.get(socket.id)]) === null || _k === void 0 ? void 0 : _k.matchs[0].push(s);
                        if (s.email === idtodata.get(socket.id).email) {
                            callback((_l = gamePlay[localRoomUsers.get(socket.id)]) === null || _l === void 0 ? void 0 : _l.matchs);
                        }
                    }
                    else if (((_m = idtodata.get(socket.id)) === null || _m === void 0 ? void 0 : _m.email) === (s === null || s === void 0 ? void 0 : s.email)) {
                        if (s.email === idtodata.get(socket.id).email) {
                            callback("loser");
                            model_1.default.lostTournament(s, localRoomUsers.get(socket.id));
                        }
                        roomMembers[localRoomUsers.get(UserToId.get(s.email))].splice(i);
                        socket.leave(localRoomUsers.get(UserToId.get(s.email)));
                        model_1.default.leftTournament(s, localRoomUsers.get(UserToId.get(s.email)));
                        localRoomUsers.delete(UserToId.get(s.email));
                    }
                }
                callback((_o = gamePlay[localRoomUsers.get(socket.id)]) === null || _o === void 0 ? void 0 : _o.matchs);
                callback((_p = gamePlay[localRoomUsers.get(socket.id)]) === null || _p === void 0 ? void 0 : _p.matchs);
                return;
            }
            else if (((_q = gamePlay[localRoomUsers.get(socket.id)]) === null || _q === void 0 ? void 0 : _q.round) === 4) {
                gamePlay[localRoomUsers.get(socket.id)].matchs = [[]];
                for (let i = 0; i < ((_r = roomMembers[localRoomUsers.get(socket.id)]) === null || _r === void 0 ? void 0 : _r.length); i++) {
                    let s = roomMembers[localRoomUsers.get(socket.id)][i];
                    if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 2 &&
                        s.email === idtodata.get(socket.id).email) {
                        model_1.default.reachedFinal(s, localRoomUsers.get(socket.id));
                        if (!((_s = gamePlay[localRoomUsers.get(socket.id)]) === null || _s === void 0 ? void 0 : _s.final.includes(s))) {
                            gamePlay[localRoomUsers.get(socket.id)].final.push(s);
                        }
                        socket.to(localRoomUsers.get(socket.id)).emit("final");
                        gamePlay[localRoomUsers.get(socket.id)].matchs[0] = [
                            gamePlay[localRoomUsers.get(socket.id)].final[0],
                            gamePlay[localRoomUsers.get(socket.id)].final[1],
                        ];
                        callback([gamePlay[localRoomUsers.get(socket.id)].final]);
                    }
                    else if (s.email === idtodata.get(socket.id).email) {
                        callback("loser");
                        model_1.default.lostTournament(s, localRoomUsers.get(socket.id));
                        roomMembers[localRoomUsers.get(socket.id)].splice(i);
                        socket.leave(localRoomUsers.get(socket.id));
                        model_1.default.leftTournament(s, localRoomUsers.get(socket.id));
                        localRoomUsers.delete(socket.id);
                    }
                }
            }
            else if (((_t = gamePlay[localRoomUsers.get(socket.id)]) === null || _t === void 0 ? void 0 : _t.round) === 5) {
                if (((_u = roomMembers[localRoomUsers.get(socket.id)]) === null || _u === void 0 ? void 0 : _u.length) < 2) {
                    if (gamePlay[localRoomUsers.get(socket.id)][idtodata.get(socket.id).email] === 3) {
                        model_1.default.winnerFirst(idtodata.get(socket.id), localRoomUsers.get(socket.id));
                        callback("You Got First Price");
                        const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(idtodata.get(socket.id));
                        if (index !== -1) {
                            roomMembers[localRoomUsers.get(socket.id)].splice(index);
                        }
                        socket.leave(localRoomUsers.get(socket.id));
                        model_1.default.leftTournament(idtodata.get(socket.id), localRoomUsers.get(socket.id));
                        localRoomUsers.delete(socket.id);
                        return;
                    }
                    else {
                        model_1.default.winnerSecond(roomMembers[localRoomUsers.get(socket.id)][0], localRoomUsers.get(socket.id));
                        callback("You Got Second Price");
                        roomMembers[localRoomUsers.get(socket.id)].splice(0);
                        socket.leave(localRoomUsers.get(socket.id));
                        model_1.default.leftTournament(roomMembers[localRoomUsers.get(socket.id)][0], localRoomUsers.get(socket.id));
                        localRoomUsers.delete(socket.id);
                        return;
                    }
                }
                for (let i = 0; i < ((_v = roomMembers[localRoomUsers.get(socket.id)]) === null || _v === void 0 ? void 0 : _v.length); i++) {
                    let s = roomMembers[localRoomUsers.get(socket.id)][i];
                    if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 3) {
                        if (s.email === idtodata.get(socket.id).email) {
                            model_1.default.winnerFirst(s, localRoomUsers.get(socket.id));
                            callback("You Got First Price");
                            roomMembers[localRoomUsers.get(socket.id)].splice(i);
                            socket.leave(localRoomUsers.get(socket.id));
                            model_1.default.leftTournament(s, localRoomUsers.get(socket.id));
                            localRoomUsers.delete(socket.id);
                            return;
                        }
                    }
                    else {
                        if (s.email === idtodata.get(socket.id).email) {
                            model_1.default.winnerSecond(s, localRoomUsers.get(socket.id));
                            callback("You Got Second Price");
                            roomMembers[localRoomUsers.get(socket.id)].splice(i);
                            socket.leave(localRoomUsers.get(socket.id));
                            model_1.default.leftTournament(s, localRoomUsers.get(socket.id));
                            localRoomUsers.delete(socket.id);
                            return;
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("start-tournament", () => {
        var _a, _b, _c, _d, _e;
        try {
            const data = (_a = gamePlay[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.matchs;
            let room = localRoomUsers.get(socket.id);
            for (let i = 0; i < (data === null || data === void 0 ? void 0 : data.length); i++) {
                if (((_b = data[i][0]) === null || _b === void 0 ? void 0 : _b.email) === ((_c = idtodata.get(socket.id)) === null || _c === void 0 ? void 0 : _c.email) ||
                    ((_d = data[i][1]) === null || _d === void 0 ? void 0 : _d.email) === ((_e = idtodata.get(socket.id)) === null || _e === void 0 ? void 0 : _e.email)) {
                    room = room + "group" + i;
                }
            }
            socket.join(room);
            tournamentGroup.set(socket.id, room);
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("make-tournament-condition-false", () => {
        try {
            condition[localRoomUsers.get(socket.id)] = false;
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("start-game", ({}, callback) => {
        var _a, _b, _c;
        try {
            const data = (_a = gamePlay[localRoomUsers.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.matchs;
            let type = "";
            for (let i = 0; i < (data === null || data === void 0 ? void 0 : data.length); i++) {
                if (((_b = data[i][0]) === null || _b === void 0 ? void 0 : _b.email) === idtodata.get(socket.id).email) {
                    type = "X";
                }
                else if (((_c = data[i][1]) === null || _c === void 0 ? void 0 : _c.email) === idtodata.get(socket.id).email) {
                    type = "O";
                }
            }
            callback(type);
            socket
                .to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id))
                .emit("start-game", idtodata.get(socket.id));
            gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)] = Object.assign(Object.assign({}, gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)]), { currentPlayer: "X", play: [] });
            delete gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].round;
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("start-game-2", () => {
        try {
            socket
                .to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id))
                .emit("start-game-2", idtodata.get(socket.id));
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("playing", ({ index, player }) => {
        var _a;
        try {
            if (!gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)]) {
                gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)] = {
                    currentPlayer: player === "X" ? "O" : "X",
                    play: [],
                };
                gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].play[index] = player;
            }
            else if (player === ((_a = gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.currentPlayer)) {
                gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].play[index] = player;
                if (player === "X") {
                    gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer = "O";
                }
                else {
                    gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer = "X";
                }
            }
            socket.to(tournamentGroup.get(socket.id)).emit("playing", {
                gamePlay: gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].play,
                current: gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer,
            });
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("i-won", (data) => {
        try {
            socket.to(tournamentGroup.get(socket.id)).emit("i-won", {
                gamePlay: gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].play,
                current: gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer,
            });
            gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].play = [];
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("switch-player", () => {
        var _a, _b;
        try {
            if (!localRoomSwitchUser[tournamentGroup.get(socket.id)]) {
                console.log("hello");
                localRoomSwitchUser[tournamentGroup.get(socket.id)] = [socket.id];
            }
            else {
                localRoomSwitchUser[tournamentGroup.get(socket.id)].push(socket.id);
                if (((_a = localRoomSwitchUser[tournamentGroup.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.length) >= 2) {
                    localRoomSwitchUser[tournamentGroup.get(socket.id)] = [];
                    if (((_b = gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)]) === null || _b === void 0 ? void 0 : _b.currentPlayer) === "X") {
                        gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer = "O";
                    }
                    else {
                        gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer = "X";
                    }
                }
            }
        }
        catch (err) {
            console.log(err, "heee");
        }
    });
    socket.on("round-finished", (data) => {
        if (data === null || data === void 0 ? void 0 : data.email) {
            data = idtodata.get(UserToId.get(data.email));
            gamePlay[localRoomUsers.get(socket.id)][data.email] = gamePlay[localRoomUsers.get(socket.id)][data.email]
                ? gamePlay[localRoomUsers.get(socket.id)][data.email] + 1
                : 1;
            socket.to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)).emit("gameFinished");
            if (!condition[localRoomUsers.get(socket.id)]) {
                gamePlay[localRoomUsers.get(socket.id)].round =
                    gamePlay[localRoomUsers.get(socket.id)].round + 1;
                condition[localRoomUsers.get(socket.id)] = true;
            }
            model_1.default.saveScore(localRoomUsers.get(socket.id), data === null || data === void 0 ? void 0 : data._id);
        }
        else {
            socket.to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)).emit("golden-game");
            goldenGame[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)] = true;
        }
    });
    socket.on("next-round", () => {
        var _a, _b;
        try {
            gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)] = {
                play: [],
                currentPlayer: gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].currentPlayer,
                round: ((_a = gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)]) === null || _a === void 0 ? void 0 : _a.round)
                    ? gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)].round + 1
                    : 1,
            };
            if (((_b = gamePlay[tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)]) === null || _b === void 0 ? void 0 : _b.round) > 2) {
                socket.to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)).emit("round-finished");
            }
            else {
                socket.to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)).emit("next-round");
            }
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("draw", () => {
        try {
            socket.to(tournamentGroup === null || tournamentGroup === void 0 ? void 0 : tournamentGroup.get(socket.id)).emit("draw");
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("leave-tournament-group", () => {
        socket.leave(tournamentGroup.get(socket.id));
    });
    socket.on("join-tournament-private", ({ user, room, pass }, callback) => __awaiter(this, void 0, void 0, function* () {
        var _g, _h;
        let tournament = yield model_1.default.getTournmentDetails(room);
        try {
            if (((tournament === null || tournament === void 0 ? void 0 : tournament.type) === "private" &&
                (tournament === null || tournament === void 0 ? void 0 : tournament.pass) === pass &&
                !((_g = gamePlay[localRoomUsers.get(socket.id)]) === null || _g === void 0 ? void 0 : _g.confirm)) ||
                user._id === tournament.admin + "") {
                if (((_h = tournament === null || tournament === void 0 ? void 0 : tournament.joined) === null || _h === void 0 ? void 0 : _h.length) < 4 || !(tournament === null || tournament === void 0 ? void 0 : tournament.joined)) {
                    yield model_1.default.joinTournament(user, room);
                    idtodata.set(socket.id, user);
                    localRoomUsers.set(socket.id, room);
                    UserToId.set(user.email, socket.id);
                    socket.join(room);
                }
                else {
                    callback(false);
                    return;
                }
                if (tournament === null || tournament === void 0 ? void 0 : tournament.joined) {
                    roomMembers[room] = [...tournament === null || tournament === void 0 ? void 0 : tournament.joined, user];
                }
                else {
                    roomMembers[room] = [user];
                }
                socket.to(room).emit("updation-tournament-public", roomMembers[room]);
                callback(roomMembers[room]);
            }
            else {
                callback(false);
            }
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("golden-game-done", () => {
        socket.to(tournamentGroup.get(socket.id)).emit("golden-game-done");
    });
    socket.on("challenge", ({ user, link, sender, }) => {
        try {
            socket.to(UserToId.get(user)).emit("challenge", { link, user: sender });
            model_1.default.sendNotification(user, "Your Challenged", "Your Challenged by " + sender, "hello", link);
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("random", ({}, callback) => __awaiter(this, void 0, void 0, function* () {
        if (randomRoom[0] && randomRoom[0].id !== socket.id) {
            console.log("woring", randomRoom);
            const a = randomRoom.pop();
            callback(a.res);
            socket.to(a.id).emit("random", a.res);
        }
        else {
            const res = handler_1.default.getRoomId();
            if (!randomRoom.includes({ id: socket.id })) {
                console.log("working", randomRoom);
                randomRoom.push({ res, id: socket.id });
            }
            console.log("woring1", randomRoom);
        }
    }));
}
exports.default = handleSocket;
