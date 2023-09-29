import {createServer }from "./connections/main"
import { connectDb } from "./connections/mongodbConnection"


const startServer = () =>{


  connectDb()
  const app = createServer()
  app.listen(8080,()=>{
    console.log("server started in port 8080");
    
  })
}

startServer()