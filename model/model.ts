import { Collection, Db, ObjectId } from "mongodb";
import { getDb } from "../connections/mongodbConnection";
import nodemailer from "nodemailer";

class Model {
  async getUser(email: string) {
    return await getDb()?.collection("users").findOne({ email });
  }

  async save(data: Object) {
    const res = await getDb()
      ?.collection("users")
      .insertOne({ ...data, score: 0, wins: 0 });
    return res?.insertedId + "";
  }

  async getUserById(id: string) {
    const res: any = await getDb()
      ?.collection("users")
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "frnd",
            foreignField: "_id",
            as: "frnds",
          },
        },
        {
          $project: {
            "frnds.password": 0,
            "frnds.invitedTournament": 0,
            "frnds.frnd": 0,
            password: 0,
          },
        },
      ])
      .toArray();
    console.log(res);
    return res[0];
  }

  saveNotifictionId(email: string, nId: string) {
    try {
      getDb()
        ?.collection("notification")
        .updateOne({ email }, { $set: { nId } }, { upsert: true });
    } catch {
      throw Error();
    }
  }

  sendMail(message: string, email: string, subject: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    transporter.sendMail(
      {
        from: process.env.USER,
        to: email,
        subject: subject,
        text: message,
      },
      (error, info) => {
        if (error) {
          console.log("Error:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      }
    );
  }

  async resetPassword(email: string, password: string) {
    let res = await getDb()
      ?.collection("users")
      .updateOne({ email }, { $set: { password } });
    console.log(res);
  }

  async getTournamentStartsWith(
    _id: string | ObjectId,
    word: string | ObjectId
  ) {
    _id = new ObjectId(_id);
    let pattern = new RegExp(`^${word}`, `i`);
    return await getDb()
      ?.collection("hostedTournaments")
      .aggregate([
        {
          $match: {
            head: { $regex: pattern },
            admin: { $ne: _id },
          },
        },
      ])
      .toArray()
      .catch((err) => console.log(err));
  }

  addfrnd(_id: string | ObjectId, frndId: string | ObjectId) {
    try {
      _id = new ObjectId(_id);
      frndId = new ObjectId(frndId);
      getDb()
        ?.collection("users")
        .updateOne({ _id }, { $addToSet: { frnd: frndId } });
    } catch (err) {
      console.log(err);
    }
  }

  async getEmailStartsWith(word: string | null, _id: string | ObjectId) {
    let pattern = new RegExp(`^${word}`, `i`);
    _id = new ObjectId(_id);
    let res = await getDb()
      ?.collection("users")
      .aggregate([
        {
          $match: {
            email: { $regex: pattern },
            _id: { $ne: _id },
          },
        },
        {
          $project: {
            password: 0,
          },
        },
      ])
      .toArray()
      .catch((err) => console.log(err));

    return res;
  }

  async hostTournament(data: any) {
    data.admin = new ObjectId(data.admin);
    let res = await getDb()?.collection("hostedTournaments").insertOne(data);
    return res?.insertedId;
  }

  async addNotificationTournamentInvitation(email: string, hostId: string) {
    getDb()
      ?.collection("users")
      .updateOne({ email }, { $addToSet: { invitedTournamet: hostId } });
  }

  async getTournaments(id: string | any, limit: number) {
    id = new ObjectId(id);
    let res = await getDb()
      ?.collection("hostedTournaments")
      .find({
        admin: { $ne: id },
        Started: { $ne: true },
        $where: function () {
          return this.joined.length < this.limit;
        },
      })
      .skip(parseInt(limit + ""))
      .limit(parseInt(limit + "") + 50)
      .toArray();

    return res;
  }

  async updateRank(id: string | ObjectId, rank: number) {
    id = new ObjectId(id);
    getDb()?.collection("users").updateOne({ _id: id }, { $set: { rank } });
  }

  async getUsersInOrder() {
    return await getDb()
      ?.collection("users")
      .find({})
      .sort({ score: -1 })
      .toArray();
  }

  async getUsersByRank() {
    return await getDb()
      ?.collection("users")
      .find({})
      .sort({ rank: 1 })
      .limit(10)
      .toArray();
  }

  async getMyTournamentsAndJoinedTournaments(id: string | any) {
    try {
      id = new ObjectId(id);
      let res = await getDb()
        ?.collection("hostedTournaments")
        .find({ $or: [{ admin: id }, { save: id }] })
        .toArray();

      return res;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getTournmentDetails(tournamentId: string | any) {
    try {
      tournamentId = new ObjectId(tournamentId);
      return await getDb()
        ?.collection("hostedTournaments")
        .findOne({ _id: tournamentId });
    } catch (err) {
      console.log(err);
    }
  }

  async joinTournament(user: object | any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $addToSet: { joined: user } });
    } catch (err) {
      console.log(err);
    }
  }
  async saveTournament(id: string | ObjectId, tournamentId: string | any) {
    try {
      id = new ObjectId(id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $addToSet: { save: id } });
    } catch (err) {
      console.log(err);
    }
  }

  async leftTournament(user: string | any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $pull: { joined: user } });
    } catch (err) {
      console.log(err);
    }
  }

  async RequestJoinTournament(id: string | any, tournamentId: string | any) {
    try {
      id = new ObjectId(id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $addToSet: { req: id } });
    } catch (err) {
      console.log(err);
    }
  }

  reachedFinal(user: any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $addToSet: { final: user } });
    } catch (err) {
      console.log(err);
    }
  }

  async winnerFirst(user: any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $set: { first: user } });
      const res = await getDb()
        ?.collection("hostedTournaments")
        .findOne({ _id: tournamentId });
      getDb()
        ?.collection("users")
        .updateOne(
          { _id: user._id },
          {
            $inc: { score: 2, wins: 1 },
            $push: {
              history: { tName: res?.head, prize: 1, tId: tournamentId },
            },
          }
        );
    } catch (err) {
      console.log(err);
    }
  }

  async winnerSecond(user: any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $set: { second: user } });
      const res = await getDb()
        ?.collection("hostedTournaments")
        .findOne({ _id: tournamentId });
      getDb()
        ?.collection("users")
        .updateOne(
          { _id: user._id },
          {
            $inc: { score: 1, wins: 1 },
            $push: {
              history: { tName: res?.head, prize: 2, tId: tournamentId },
            },
          }
        );
    } catch (err) {
      console.log(err);
    }
  }

  async lostTournament(user: any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $set: { second: user } });
      const res = await getDb()
        ?.collection("hostedTournaments")
        .findOne({ _id: tournamentId });
      getDb()
        ?.collection("users")
        .updateOne(
          { _id: user._id },
          {
            $inc: { score: -1 },
            $push: {
              history: { tName: res?.head, prize: 3, tId: tournamentId },
            },
          }
        );
    } catch (err) {
      console.log(err);
    }
  }

  reachedSemiFinal(user: any, tournamentId: string | any) {
    try {
      user._id = new ObjectId(user._id);
      tournamentId = new ObjectId(tournamentId);
      getDb()
        ?.collection("hostedTournaments")
        .updateOne({ _id: tournamentId }, { $addToSet: { semiFinal: user } });
    } catch (err) {
      console.log(err);
    }
  }

  async getTournmentDetailsWithUsers(
    id: string | any,
    tournamentId: string | any
  ) {
    try {
      id = new ObjectId(id);
      tournamentId = new ObjectId(tournamentId);
      let res: any = await getDb()
        ?.collection("hostedTournaments")
        .findOne({ admin: id, _id: tournamentId });
      return res;
    } catch (err) {
      console.log(err);
    }
  }
  async startTournament(id: string | ObjectId,email:string) {
    id = new ObjectId(id);

    getDb()
      ?.collection("hostedTournaments")
      .updateOne({ _id: id }, { $set: { Started: true } });
    
      getDb()
        ?.collection("users")
        .updateOne({ email }, { $inc: { played: 1 } });
  }

  saveScore(id: string | ObjectId, userId: any) {
    id = new ObjectId(id);
    userId = new ObjectId(userId);

    getDb()
      ?.collection("hostedTournaments")
      .updateOne(
        { _id: id, "joined._id": userId },
        { $inc: { "joined.$.score": 1 } }
      )
      .catch((x) => {
        console.log(x);
      });
  }

  async sendNotification(
    email: string,
    title: string,
    body: string,
    subtitle: string | null,
    link:string
  ) {
    const res:any = await getDb()?.collection("notification").findOne({ email });

    fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "key="+process.env.GKEY,
      },
      body:JSON.stringify({
        to:res.nId,
        notification:{
          body,title,subtitle,click_action:"http://localhost:3000/"+link,
        },
        data:{
          route:"/"
        }
      })
    });
  }
}

export default new Model();
