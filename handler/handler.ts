import model from "../model/model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const map = new Map();
const reset = new Map();

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
    delete user.password;
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

  async searchUser(word: string | null) {
    try {
      let users = await model.getEmailStartsWith(word);
      return users;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async hostTournament(data: any) {
    try {
      const user: any = await model.getUserById(data.id);
      console.log(user, data);
      let hostId: any;
      const invite = data?.invite;
      delete data?.invite;
      if (data.instant) {
        hostId = await model.hostTournament({
          admin: data.id,
          head: data.head,
          description: data?.description,
          limit: data.limit,
          type: data.type,
          instant: data.instant,
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
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

export default new Handler();
