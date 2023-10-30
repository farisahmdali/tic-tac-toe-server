import express from "express";
import dotenv from "dotenv";
import userRoute from "../routes/userRoute"
import cors from "cors"
import morgan from "morgan"
import {Server} from "socket.io"
import http from "http"
import   handleSocket  from "../sockets/sockets";
import model from "../model/model";
let io

export const createServer = ()=>{
    dotenv.config()
    const app = express();
    const server = http.createServer(app);
     io = new Server(server,{cors:{origin: "*"}});
    io.on('connection',handleSocket)
    app.use(express.json());
    app.use(cors({origin:"*"}));
    app.use(morgan("dev"));
    app.use("/v4/api",userRoute)
    return server
}

export const ranking = async() =>{
    const users:any = await model.getUsersInOrder()
    console.log(users)
    for(let i=0;i<users?.length;i++){
        model.updateRank(users[i]?._id,i+1)
    }
}

