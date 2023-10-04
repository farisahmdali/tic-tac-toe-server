import { Request, Response } from "express";
import handler from "../handler/handler";

class Controller {
  constructor() {}

  async signup(req: Request, res: Response) {
    try {
      let token = await handler.signup(req.body);
      if (token) {
        res.status(200).send({ token });
      } else {
        res.status(403).send("OTP is incorrect");
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async otp(req: Request, res: Response) {
    try {
      let a = await handler.otp(req.body.email);

      if (a) {
        res.sendStatus(200);
      } else {
        res.status(403).send("User Already exist");
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async getUser(req: Request | any, res: Response) {
    try {
      console.log(req._id);
      let user = await handler.getUser(req._id);
      res.status(200).send({ user });
    } catch (err) {
      console.log(err, "hello");

      res.sendStatus(500);
    }
  }
  async login(req: Request, res: Response) {
    try {
      console.log(req.query);

      let token = await handler.login(
        req.query.email + "",
        req.query.password + ""
      );
      if (token) {
        res.status(200).send({ token });
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async resetPasswordOtp(req: Request, res: Response) {
    try {
      let val = await handler.resetPasswordOtp(req.body.email);
      if (val) {
        res.sendStatus(200);
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async resetPassword(req: Request, res: Response) {
    try {
      let val = await handler.resetPassword(req.body.email,req.body.password,req.body.otp);
      if (val) {
        res.sendStatus(200);
      } else {
        res.sendStatus(403);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async searchUser(req: Request, res: Response){
    try{
    let user = await  handler.searchUser(req.query.word+"")
    res.status(200).send({user})
    }catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

async hostTournament(req:any,res:Response){
    try{
      const valid = await handler.hostTournament({id:req._id,...req.body})
      if(valid){
        res.sendStatus(200)
      }else{
        console.log("error")
        res.sendStatus(403)
      }
      }catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
  }

  getRoomId(req:Request,res:Response){
    try{
      let roomId = handler.getRoomId();
      if(roomId){
        res.status(200).send({roomId});
      }else{
        res.sendStatus(500)
      }
    }catch(err){
      console.log(err);
      res.sendStatus(500)
    }
  }
 async getTournaments(req:any,res:Response){
    try{
      let tournaments =await handler.getTournament(req._id,req.query.limit);
      if(tournaments){
        res.status(200).send({tournaments});
      }else{
        res.sendStatus(500)
      }
    }catch(err){
      console.log(err);
      res.sendStatus(500)
    }
  }
}

export default new Controller();
