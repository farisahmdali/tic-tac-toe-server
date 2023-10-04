import express from "express";
import userRoutesController from "../controller/userRoutesController";
import middleware from "../middlewares/middleware";

const router = express.Router();

router.post("/signup",userRoutesController.signup)
router.post("/otp",userRoutesController.otp)
router.get("/getuser",middleware.verifyToken,userRoutesController.getUser)
router.get("/login",userRoutesController.login)
router.post("/resetPasswordOtp",userRoutesController.resetPasswordOtp)
router.post("/resetPassword",userRoutesController.resetPassword)
router.get("/searchUser",middleware.verifyToken,userRoutesController.searchUser)
router.post("/host-tournament",middleware.verifyToken,userRoutesController.hostTournament)
router.get("/get-room-id",middleware.verifyToken,userRoutesController.getRoomId)
router.get("/get-tournaments",middleware.verifyToken,userRoutesController.getTournaments)



export default router