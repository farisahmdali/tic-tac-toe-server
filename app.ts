import {createServer, ranking }from "./connections/main"
import { connectDb } from "./connections/mongodbConnection"

let intervalsElapsed = 1440;
const intervalsPerDay = 1440;

const startServer = async() =>{

  await connectDb()
  const app = createServer()
  app.listen(8080,()=>{
    console.log("server started in port 8080");
    
  })
  setInterval(()=>{
    intervalsElapsed++;
    if(intervalsElapsed>=intervalsPerDay){
      ranking()
      intervalsElapsed = 0
    }
    },60000)
 
}

startServer()