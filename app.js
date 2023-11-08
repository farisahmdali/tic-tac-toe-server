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
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./connections/main");
const mongodbConnection_1 = require("./connections/mongodbConnection");
let intervalsElapsed = 1440;
const intervalsPerDay = 1440;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongodbConnection_1.connectDb)();
    const app = (0, main_1.createServer)();
    app.listen(8080, () => {
        console.log("server started in port 8080");
    });
    setInterval(() => {
        intervalsElapsed++;
        if (intervalsElapsed >= intervalsPerDay) {
            (0, main_1.ranking)();
            intervalsElapsed = 0;
        }
    }, 60000);
});
startServer();
