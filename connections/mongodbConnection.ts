import {MongoClient,Db} from "mongodb"
import * as dotenv from "dotenv"

dotenv.config()

let db:Db|null = null
export const connectDb=async()=>{
    try{
        const url = process.env.DB_CONNECTION
        const client = await MongoClient.connect(url+"")
        console.log('db conected');
        db = client.db('tic-tac-toe')
    }catch(err){
        console.log(err)
    }
    
}

export function getDb(){
    if(!db){
        console.log("database not connected")
    }

    return db;
}

  
    