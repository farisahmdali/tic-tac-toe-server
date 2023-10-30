import model from "../model/model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const map = new Map();
const reset = new Map();
const rooms:number[] = []

interface signup {
  fullName: string;
  email: string;
  password: string;
  otp: number;
}

class Handler {
  async signup({ fullName, email, password, otp }: signup) {
    const isUser = await model.getUser(email);

    if (isUser && otp !== map.get(email)) {
      return false;
    } else {
      console.log(password);
      password = await bcrypt.hash(password, 2);
      let user = await model.save({ fullName, email, password });
      console.log(process.env.KEY);
      return jwt.sign({ _id: user }, process.env.KEY + "");
    }
  }

  async otp(email: string) {
    const isUser = await model.getUser(email);
    if (isUser) {
      return false;
    } else {
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      console.log(otpCode);
      map.set(email, otpCode);
      const message = `The OTP for the Tic-Tac-Toe Game : ${otpCode}`;
      model.sendMail(message, email, "OTP");
      return true;
    }
  }

  async getUser(_id: string) {
    console.log(_id);
    const user: any = await model.getUserById(_id);
    // delete user.password;
    return user;
  }
  async login(email: string, password: string) {
    try {
      const user: any = await model.getUser(email);
      console.log(user, password);
      const auth = await bcrypt.compare(password, user.password);
      console.log(auth);
      if (auth) {
        const token = jwt.sign({ _id: user._id + "" }, process.env.KEY + "");
        return token;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async resetPasswordOtp(email: string) {
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      console.log(otpCode);
      reset.set(email, otpCode);
      const message = `The OTP for the Tic-Tac-Toe Game to reset password : ${otpCode}`;
      model.sendMail(message, email, "OTP");
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async resetPassword(email: string, password: string, otp: number) {
    try {
      const isUser = await model.getUser(email);
      if (otp === reset.get(email) && isUser) {
        console.log(email, password, otp);
        password = await bcrypt.hash(password, 2);
        model.resetPassword(email, password);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async searchUser(word: string | null,_id:string) {
    try {
      let users = await model.getEmailStartsWith(word,_id);
      return users;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async searchTournament(id:string,elem:string){
    try{
      return await model.getTournamentStartsWith(id,elem)
    }catch(err){
      console.log(err);
    }
  }

  addfrnd(id:string,frndId:string){
    try{
       model.addfrnd(id,frndId)
    }catch(err){
      console.log(err);
    }
  }

  async getFrndsDetails(ids:string[]){
    try{
      const frnds = []
      for(let i=0;i<ids?.length;i++){
        let res = await model.getUserById(ids[i])
        delete res?.password
        frnds.push(res)
      }
      return frnds
   }catch(err){
     console.log(err);
     throw Error()
   }
  }

  async hostTournament(data: any) {
    try {
      const user: any = await model.getUserById(data.id);
      let hostId: any;
      const invite = data?.invite;
      let Code
      if(data.type==="private"){
         Code = Math.floor(100000 + Math.random() * 900000)
      }
      delete data?.invite;
      if (data.instant) {
        hostId = await model.hostTournament({
          admin: data.id,
          head: data.head,
          description: data?.description,
          limit: data.limit,
          pass:Code,
          type: data.type,
          viewers:0,
          instant: data.instant,
          view:data?.view || false,
        });
      } else {
        const date = new Date(data?.date);
        const currentTime = new Date();
        const inputTime = data?.time;
        const [inputHours, inputMinutes] = inputTime.split(":").map(Number);
        if (
          date.getDate() > currentTime.getDate() &&
          date.getMonth() >= currentTime.getMonth() &&
          date.getFullYear() >= currentTime.getFullYear()
        ) {
          hostId = await model.hostTournament({
            admin: data.id,
            head: data.head,
            description: data?.description,
            instant: data.instant,
            limit: data.limit,
            type: data.type,
            date: data.date,
            time: data.time,
          });
        } else {
          if (
            inputHours >= currentTime.getHours() &&
            inputMinutes > currentTime.getMinutes()
          ) {
            hostId = await model.hostTournament({
              admin: data.id,
              head: data.head,
              description: data?.description,
              instant: data.instant,
              limit: data.limit,
              type: data.type,
              date: data.date,
              time: data.time,
            });
          } else {
            return false;
          }
        }
      }

      invite.map((x: string) => {
        const message = `You have a notification from ${user.email}.Your invited to the Tournament ${data.head}.${data.description}`;
        model.sendMail(message, x, "Tic-Tac-Toe");
        model.addNotificationTournamentInvitation(x,hostId)
      });
      return {hostId,Code};
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  getRoomId(){
    try{
      while(true){
        const roomId = Math.floor(10000000 + Math.random() * 900000000);
        if(!rooms.includes(roomId)){
          rooms.push(roomId);
          return roomId;
        }
      }
    }catch(err){
      return false;
    }
  }
 async getTournament(id:string,limit:number){
    try{
    const data = await model.getTournaments(id,limit)
    return data
    }catch(err){
      console.log(err)
      return false;
    }
  }

  async getOpponentDetails(email:string){
    try{
      const user:any =await model.getUser(email)
      delete user.password
      return user
      }catch(err){
        console.log(err)
        return false;
      }
  }

  async getMyTournaments(id:string){
    try{
      const user:any =await model.getMyTournamentsAndJoinedTournaments(id)
      delete user.password
      return user
      }catch(err){
        console.log(err)
        return false;
      }
  }
  async saveTournaments(id:string,tournamentId:string){
    try{
      const res:any =await model.getTournmentDetails(tournamentId)
      if(res?.type==="public"){
         model.saveTournament(id,tournamentId)
      }
      
      }catch(err){
        console.log(err)
      }
  }

  async getTournamentDetails(id:string,tournamentId:string){
    try{
      const res:any =await model.getTournmentDetails(tournamentId)
      if(id+""!==res.admin+"" && res?.pass){
        delete res.pass
      }
      return res
    }catch(err){
      console.log(err);
      return false
      
    }
  }

  async RankSorted(){
    try{
      return await model.getUsersByRank()
    }catch(err){
      console.log(err)
      throw Error()
    }
  }
  async addNotication(_id:string,nId:string){
    try{
      const res = await model.getUserById(_id);
      model.saveNotifictionId(res.email,nId);

    }catch(err){
      console.log(err)
      throw Error()
    }
  }
  
}

export default new Handler();
