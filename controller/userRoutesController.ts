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
      let val = await handler.resetPassword(
        req.body.email,
        req.body.password,
        req.body.otp
      );
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
  async searchUser(req: Request |any, res: Response) {
    try {
      let user = await handler.searchUser(req.query.word + "",req._id);
      res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async hostTournament(req: any, res: Response) {
    try {
      const valid = await handler.hostTournament({ id: req._id, ...req.body });
      if (valid) {
        res.status(200).send(valid);
      } else {
        console.log("error");
        res.sendStatus(403);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async searchTournament(req: any, res: Response){
    try {
      const valid = await handler.searchTournament(req._id,req.query.elem);
      if (valid) {
        res.status(200).send(valid);
      } else {
        console.log("error");
        res.sendStatus(403);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  addfrnd(req: any, res: Response){
    try{
      handler.addfrnd(req._id,req.body.id)
    }catch(err){
      console.log(err);
      res.sendStatus(500);
    }
  }

  removefrnd(req: any, res: Response){
    try{
      handler.removefrnd(req._id,req.body.id)
    }catch(err){
      console.log(err);
      res.sendStatus(500);
    }
  }

 async getFrndsDetails(req: any, res: Response ){
    try{
      const frnds =  await handler.getFrndsDetails(req.query.ids)
      res.status(200).send(frnds)
    }catch(err){
      console.log(err);
      res.sendStatus(500);
    }
  }

  getRoomId(req: Request, res: Response) {
    try {
      let roomId = handler.getRoomId();
      if (roomId) {
        res.status(200).send({ roomId });
      } else {
        res.sendStatus(500);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async getTournaments(req: any, res: Response) {
    try {
      let tournaments = await handler.getTournament(req._id, req.query.limit);
      if (tournaments) {
        res.status(200).send({ tournaments });
      } else {
        res.sendStatus(500);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async getOpponentDetails(req: Request, res: Response) {
    try {
      let user = await handler.getOpponentDetails(req.query.email + "");
      res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async getMyTournament(req: Request | any, res: Response) {
    try {
      let user = await handler.getMyTournaments(req._id);
  
      res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  saveTournament(req: Request | any, res: Response) {
    try {
      handler.saveTournaments(req._id, req.body.tournamentId);
      res.sendStatus(200);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async getTournamentDetails(req: Request | any, res: Response) {
    try {
      const data = await handler.getTournamentDetails(
        req._id,
        req.query.tournamentId
      );
      res.status(200).send(data)
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async getRankSorted(req:Request,res:Response){
    try {
      const data = await handler.RankSorted();
      res.status(200).send(data)
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }
  async addNotification(req:any,res:Response){
    try{
      handler.addNotication(req._id,req.body.nId)
      res.sendStatus(200)
    }catch(err){
      res.sendStatus(500)
    }
  }
  async updateName(req:Request | any,res:Response){
    try {
       handler.updateName(req?._id,req?.body?.name);
       res.sendStatus(200)
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  }

  async orderPayment(req:Request | any,res:Response){
    try{
      const order = await handler.orderPayment(req.query.amount,req._id);
      res.status(200).send({order});
    }catch(err){
      console.log(err);
      res.sendStatus(500);
    }
  }

  async addCredits(req: Request|any, res: Response){
    try{
      handler.addCredits(req.body.order,req._id)
      res.sendStatus(200)
    }catch(err){
      console.log(err);
      res.sendStatus(500);
    }
  }

  withdraw(req: Request|any, res: Response){
    try{
      handler.withdraw(req._id,req.body.amount,req.body.upiId)
      res.sendStatus(200)
    }catch(err){
      console.log(err)
      res.sendStatus(500)
    }
  }
  withdrawLogin(req: Request|any, res: Response){
    try{
      const token = handler.withdrawLogin(req.query.username,req.query.password)
      if(token){
        res.status(200).send({token})
      }else{
        res.sendStatus(403)
      }
    }catch(err){
      console.log(err)
      res.sendStatus(500)
    }
  }
 async getWithdrawdata(req: Request, res: Response){
    try{
      const data =await handler.getWithdrawdata()
      if(data){
        res.status(200).send({data})
      }else{
        res.sendStatus(403)
      }
    }catch(err){
      console.log(err)
      res.sendStatus(500)
    }
  }

  async withdrawDone(req: Request, res: Response){
    try{
      handler.withdrawDone(req.body.id)
    }catch(err){
      console.log(err)
      res.sendStatus(500)
    }
  }
}

export default new Controller();
