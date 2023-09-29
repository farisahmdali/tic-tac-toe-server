import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

class Middleware {
  verifyToken(req: Request | any, res: Response, next: NextFunction) {
    try {
            
      if (req.headers.authorization) {
        const {_id}:any = jwt.verify(req.headers.authorization, process.env.KEY + "");
        console.log(_id);
        
        req._id = _id;
        next();
      } else {
        console.log("not authenticated")
        res.sendStatus(403);
      }
    } catch (err) {
      console.log(err);
      res.sendStatus(403);
    }
  }
}

export default new Middleware()
