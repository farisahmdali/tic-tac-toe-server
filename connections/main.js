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
exports.ranking = exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoute_1 = __importDefault(require("../routes/userRoute"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const sockets_1 = __importDefault(require("../sockets/sockets"));
const model_1 = __importDefault(require("../model/model"));
let io;
const createServer = () => {
    dotenv_1.default.config();
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    io.on('connection', sockets_1.default);
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({ origin: "*" }));
    app.use((0, morgan_1.default)("dev"));
    app.use("/v4/api", userRoute_1.default);
    return server;
};
exports.createServer = createServer;
const ranking = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const users = yield model_1.default.getUsersInOrder();
    console.log(users);
    for (let i = 0; i < (users === null || users === void 0 ? void 0 : users.length); i++) {
        model_1.default.updateRank((_a = users[i]) === null || _a === void 0 ? void 0 : _a._id, i + 1);
    }
});
exports.ranking = ranking;
