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
    const res = await getDb()
      ?.collection("users")
      .findOne({ _id: new ObjectId(id) });
    return res;
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

  async getEmailStartsWith(word: string | null) {
    let pattern = new RegExp(`^${word}`, `i`);
    let res = await getDb()
      ?.collection("users")
      .aggregate([
        {
          $match: {
            email: { $regex: pattern },
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
        save: { $ne: id },
        $where: function () {
          return this.joined.length < this.limit;
        },
      })
      .skip(parseInt(limit + ""))
      .limit(parseInt(limit + "") + 50)
      .toArray();

    return res;
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
  startTournament(id: string | ObjectId) {
    id = new ObjectId(id);

    getDb()
      ?.collection("hostedTournaments")
      .updateOne({ _id: id }, { $set: { Started: true } });
  }
}

export default new Model();
