import express from "express";
import dotenv from "dotenv";
import userRoute from "../routes/userRoute"
import cors from "cors"
import morgan from "morgan"

export const createServer = ()=>{
    dotenv.config()
    const app = express();
    app.use(express.json());
    app.use(cors({origin:"*"}));
    app.use(morgan("dev"));
    app.use("/v4/api",userRoute)
    return app
}
