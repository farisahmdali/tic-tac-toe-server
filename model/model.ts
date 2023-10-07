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
    console.log(id, new ObjectId(id));
    const res = await getDb()
      ?.collection("users")
      .findOne({ _id: new ObjectId(id) });
    console.log(res);
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
    console.log(res);

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

  async getTournaments(id: string | any, limit:number) {
    id = new ObjectId(id);
    console.log(id,parseInt(limit+""));
    let res = await getDb()
      ?.collection("hostedTournaments")
      .find({ admin: { $ne: id } })
      .skip(parseInt(limit+""))
      .limit(parseInt(limit+"")+50)
      .toArray();
    console.log(res);

    return res;
  }
}

export default new Model();
