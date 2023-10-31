import { Socket } from "socket.io";
import model from "../model/model";
import handler from "../handler/handler";

const localRoomUsers = new Map();
const UserToId = new Map();
const roomMembers: any = {};
const localRoomSwitchUser: any = {};
let gamePlay: any = {};
const setOpponent = new Map();
const idtodata = new Map();
const opponent: any = {};
const tournamentGroup = new Map();
const score = new Map();
const goldenGame: any = {};
const tournamentUserOnline: any = {};
const condition: any = {};
const randomRoom:any = []

export default function handleSocket(socket: Socket) {
  console.log("user connected with id  " + socket.id);

  socket.on("join-local-room", ({ room, user }) => {
    if (roomMembers[room + ""]?.length < 3 && !roomMembers[room+""]?.includes([user,socket.id]) || !roomMembers[room + ""]) {
      console.log({ room, user });
      socket.join(room);
      socket.to(room).emit("join-local-room", { user });
      if (!roomMembers[room + ""]) {
        roomMembers[room + ""] = [[user, socket.id]];
      } else {
        roomMembers[room + ""].push([user, socket.id]);
      }
      localRoomUsers.set(socket.id, room);
    }
  });

  socket.on("sendEmail", ({ room, user }) => {
    console.log({ room, user });
    socket.to(room).emit("sendEmail", { user });
  });

  socket.on("start-local-game", (data) => {
    if (localRoomUsers.get(socket.id)) {
      if (roomMembers[localRoomUsers.get(socket.id) + ""][0][1] === socket.id) {
        console.log("start-local-game1");
        socket
          .to(roomMembers[localRoomUsers.get(socket.id) + ""][1][1])
          .emit("start-local-game", data);
      } else {
        console.log("start-local-game2");
        socket
          .to(roomMembers[localRoomUsers.get(socket.id) + ""][0][1])
          .emit("start-local-game", data);
      }
    }
  });

  socket.on("play-local-game", (data) => {
    if (localRoomUsers.get(socket.id)) {
      console.log("play-local-game");
      socket.to(localRoomUsers.get(socket.id)).emit("play-local-game", data);
    }
  });

  socket.on("start-playing-local", ({ index, player }) => {
    try {
      console.log(gamePlay[localRoomUsers?.get(socket.id)]);
      if (!gamePlay[localRoomUsers?.get(socket.id)]) {
        gamePlay[localRoomUsers?.get(socket.id)] = {
          currentPlayer: player === "X" ? "O" : "X",
          play: [],
        };
        console.log(gamePlay[localRoomUsers?.get(socket.id)]);
        gamePlay[localRoomUsers?.get(socket.id)].play[index] = player;
      } else if (
        player === gamePlay[localRoomUsers?.get(socket.id)]?.currentPlayer
      ) {
        gamePlay[localRoomUsers?.get(socket.id)].play[index] = player;
        if (player === "X") {
          gamePlay[localRoomUsers?.get(socket.id)].currentPlayer = "O";
        } else {
          gamePlay[localRoomUsers?.get(socket.id)].currentPlayer = "X";
        }
      }
      console.log(
        gamePlay[localRoomUsers?.get(socket.id)].currentPlayer,
        "hello world!"
      );
      socket.to(localRoomUsers.get(socket.id)).emit("start-playing-local", {
        gamePlay: gamePlay[localRoomUsers?.get(socket.id)].play,
        current: gamePlay[localRoomUsers?.get(socket.id)].currentPlayer,
      });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("i-won-local-match", () => {
    socket
      .to(localRoomUsers.get(socket.id))
      .emit("i-won-local-match", gamePlay[localRoomUsers?.get(socket.id)].play);
  });

  socket.on("switch-player-local", () => {
    try {
      if (!localRoomSwitchUser[localRoomUsers.get(socket.id)]) {
        console.log("hello");
        localRoomSwitchUser[localRoomUsers.get(socket.id)] = [socket.id];
      } else {
        localRoomSwitchUser[localRoomUsers.get(socket.id)].push(socket.id);
        if (localRoomSwitchUser[localRoomUsers.get(socket.id)]?.length >= 2) {
          localRoomSwitchUser[localRoomUsers.get(socket.id)] = [];
          if (gamePlay[localRoomUsers?.get(socket.id)]?.currentPlayer === "X") {
            gamePlay[localRoomUsers?.get(socket.id)].currentPlayer = "O";
          } else {
            gamePlay[localRoomUsers?.get(socket.id)].currentPlayer = "X";
          }
        }
      }
    } catch (err) {
      console.log(err, "heee");
    }
  });

  socket.on("next-round-local", () => {
    try {
      gamePlay[localRoomUsers?.get(socket.id)].play = [""];
      if (!gamePlay[localRoomUsers?.get(socket.id)]?.round) {
        gamePlay[localRoomUsers?.get(socket.id)] = {
          play: [],
          currentPlayer: gamePlay[localRoomUsers?.get(socket.id)].currentPlayer,
          round: 2,
        };
      } else {
        gamePlay[localRoomUsers?.get(socket.id)].round =
          gamePlay[localRoomUsers?.get(socket.id)].round + 1;
      }
      if (gamePlay[localRoomUsers?.get(socket.id)]?.round > 3) {
        socket.to(localRoomUsers.get(socket.id)).emit("local-game-finished");
      } else {
        socket
          .to(localRoomUsers.get(socket.id))
          .emit(
            "next-round-local",
            gamePlay[localRoomUsers?.get(socket.id)].round
          );
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("draw-local", () => {
    socket.to(localRoomUsers.get(socket.id)).emit("draw-local");
  });
  socket.on("local-game-finished", () => {
    socket.to(localRoomUsers.get(socket.id)).emit("local-game-finished-end");
    try{
      if(typeof parseInt(localRoomUsers.get(socket.id)) === "number"){
        handler.removeRooms(parseInt(localRoomUsers.get(socket.id)))
      }
    }catch(err){
      console.log(err);
    }
  });

  socket.on("join-tournament-public", async ({ user, room }, callback) => {
    let tournament: any = await model.getTournmentDetails(room);
    try {
      if (
        tournament?.type === "public" &&
        !gamePlay[localRoomUsers.get(socket.id)]?.confirm &&
        !tournament?.Started
      ) {
        if (tournament?.joined?.length < 4 || !tournament?.joined) {
          await model.joinTournament(user, room);
        }
        idtodata.set(socket.id, user);
        localRoomUsers.set(socket.id, room);
        UserToId.set(user.email, socket.id);
        socket.join(room);
        if (tournament?.joined) {
          roomMembers[room] = [...tournament?.joined, user];
        } else {
          roomMembers[room] = [user];
        }

        console.log(roomMembers[room], "hello");
        socket.to(room).emit("updation-tournament-public", roomMembers[room]);
        callback(roomMembers[room]);
        return
      }
      callback("cannot join")
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("user-exited-tournament", async (data) => {
    try {
      if (!gamePlay[localRoomUsers.get(socket.id)]?.confirm) {
        const user = idtodata.get(socket.id);
        await model.leftTournament(user, localRoomUsers.get(socket.id));
        const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(user);
        if (index !== -1)
          roomMembers[localRoomUsers.get(socket.id)].splice(index);
        socket
          .to(localRoomUsers.get(socket.id))
          .emit(
            "updation-tournament-public",
            roomMembers[localRoomUsers.get(socket.id)]
          );
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("userExited", async (data) => {
    console.log("disconnect", socket.id);
    socket.to(localRoomUsers.get(socket.id)).emit("user-quit");
   
    UserToId.set(data,socket.id);

    try {
      if(typeof parseInt(localRoomUsers.get(socket.id)) === "number"){
        handler.removeRooms(parseInt(localRoomUsers.get(socket.id)))
      }
      if (!gamePlay[localRoomUsers.get(socket.id)]?.confirm) {
        const user = idtodata.get(socket.id);
        console.log(user);
        await model.leftTournament(user, localRoomUsers.get(socket.id));
        const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(user);
        if (index !== -1) {
          roomMembers[localRoomUsers.get(socket.id)].splice(index);
        }
        socket
          .to(localRoomUsers.get(socket.id))
          .emit(
            "updation-tournament-public",
            roomMembers[localRoomUsers.get(socket.id)]
          );
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("disconnect", socket.id);
    socket.to(localRoomUsers.get(socket.id)).emit("user-quit");
    try {
      if(typeof parseInt(localRoomUsers.get(socket.id)) === "number"){
        handler.removeRooms(parseInt(localRoomUsers.get(socket.id)))
      }
      if (!gamePlay[localRoomUsers.get(socket.id)]?.confirm) {
        const user = idtodata.get(socket.id);
        await model.leftTournament(user, localRoomUsers.get(socket.id));
        const index = roomMembers[localRoomUsers.get(socket.id)].indexOf(user);
        if (index !== -1) {
          roomMembers[localRoomUsers.get(socket.id)].splice(index);
        }
        socket
          .to(localRoomUsers.get(socket.id))
          .emit(
            "updation-tournament-public",
            roomMembers[localRoomUsers.get(socket.id)]
          );
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("user-online", ({}, callback) => {
    try {
      if (tournamentUserOnline[localRoomUsers.get(socket.id)]?.online) {
        tournamentUserOnline[localRoomUsers.get(socket.id)].online.push(
          idtodata.get(socket.id)?.email
        );
      } else {
        tournamentUserOnline[localRoomUsers.get(socket.id)] = {
          online: [idtodata.get(socket.id)?.email],
        };
      }
      callback(tournamentUserOnline[localRoomUsers.get(socket.id)].online);
      socket
        .to(localRoomUsers.get(socket.id))
        .emit(
          "user-online",
          tournamentUserOnline[localRoomUsers.get(socket.id)].online
        );
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("user-offline", () => {
    try {
      const data = tournamentUserOnline[localRoomUsers.get(socket.id)]?.online;

      const index = data?.indexOf(idtodata.get(socket.id).email);

      if (index !== -1) {
        data?.splice(index);
      }

      tournamentUserOnline[localRoomUsers.get(socket.id)].online = data;
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("confirm-tournament", () => {
    delete tournamentUserOnline[localRoomUsers.get(socket.id)];
    gamePlay[localRoomUsers.get(socket.id)] = {
      confirm: true,
      members: roomMembers[localRoomUsers.get(socket.id)],
      matchs: [],
      round: 1,
    };
    model.startTournament(localRoomUsers.get(socket.id),idtodata.get(socket.id).email)
    let j = 0;
    for (
      let i = 0;
      i < roomMembers[localRoomUsers.get(socket.id)].length;
      i += 2
    ) {
      gamePlay[localRoomUsers.get(socket.id)].matchs[j] = [
        roomMembers[localRoomUsers.get(socket.id)][i],
        roomMembers[localRoomUsers.get(socket.id)][i + 1],
      ];
      j++;
    }
  });

  socket.on("get-matchs-tournament", ({}, callback) => {
try{


    console.log(gamePlay[localRoomUsers.get(socket.id)])
  
    if (gamePlay[localRoomUsers.get(socket.id)]?.round === 1) {
      callback(gamePlay[localRoomUsers.get(socket.id)]?.matchs);
    } else if (gamePlay[localRoomUsers.get(socket.id)]?.round === 2) {
      const winners = [];
      const losers = [];
      console.log(gamePlay[localRoomUsers.get(socket.id)]);
      for (
        let i = 0;
        i < roomMembers[localRoomUsers.get(socket.id)]?.length;
        i++
      ) {
        let s = roomMembers[localRoomUsers.get(socket.id)][i];
        if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 1) {
          winners.push(s);
        } else {
          losers.push(s);
        }
      }
      console.log(winners, losers, "winners and losers");
      gamePlay[localRoomUsers.get(socket.id)].matchs = [];
      for (let i = 0; i < winners?.length; i += 2) {
        gamePlay[localRoomUsers.get(socket.id)].matchs?.push([
          winners[i],
          winners[i + 1],
        ]);
      }
      for (let i = 0; i < losers?.length; i += 2) {
        gamePlay[localRoomUsers.get(socket.id)].matchs?.push([
          losers[i],
          losers[i + 1],
        ]);
      }
      callback(gamePlay[localRoomUsers.get(socket.id)]?.matchs)
    } else if (gamePlay[localRoomUsers.get(socket.id)]?.round === 3) {
      gamePlay[localRoomUsers.get(socket.id)].matchs = [[]];
      console.log("round 3 reached",gamePlay[localRoomUsers.get(socket.id)])
      for (
        let i = 0;
        i < roomMembers[localRoomUsers.get(socket.id)]?.length;
        i++
      ) {
        let s = roomMembers[localRoomUsers.get(socket.id)][i];
        if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 2) {
          model.reachedFinal(s, localRoomUsers.get(socket.id));
          if(s.email === idtodata.get(socket.id).email){
            callback("final")
          }
          gamePlay[localRoomUsers.get(socket.id)] = {...gamePlay[localRoomUsers.get(socket.id)], final: [s] };
        } else if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 1) {
          model.reachedSemiFinal(s, localRoomUsers.get(socket.id));
          gamePlay[localRoomUsers.get(socket.id)]?.matchs[0].push(s);
          console.log("reached semi final",gamePlay[localRoomUsers.get(socket.id)]?.matchs[0]);
          if(s.email === idtodata.get(socket.id).email){
            callback(gamePlay[localRoomUsers.get(socket.id)]?.matchs)
          }
          
        } else if (idtodata.get(socket.id)?.email === s?.email) {
          if(s.email === idtodata.get(socket.id).email){
            callback("loser")
            model.lostTournament(s,localRoomUsers.get(socket.id))
          }
          roomMembers[localRoomUsers.get(UserToId.get(s.email))].splice(i);
          socket.leave(localRoomUsers.get(UserToId.get(s.email)));
          model.leftTournament(s, localRoomUsers.get(UserToId.get(s.email)));
          localRoomUsers.delete(UserToId.get(s.email));
        }
      }
      callback(gamePlay[localRoomUsers.get(socket.id)]?.matchs)
      callback(gamePlay[localRoomUsers.get(socket.id)]?.matchs)
      return
    } else if (gamePlay[localRoomUsers.get(socket.id)]?.round === 4) {
      gamePlay[localRoomUsers.get(socket.id)].matchs = [[]];
      for (
        let i = 0;
        i < roomMembers[localRoomUsers.get(socket.id)]?.length;
        i++
      ) {
        let s = roomMembers[localRoomUsers.get(socket.id)][i];
        if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 2 && s.email === idtodata.get(socket.id).email ) {
          model.reachedFinal(s, localRoomUsers.get(socket.id));
          console.log(gamePlay[localRoomUsers.get(socket.id)]?.final.includes(s))
          if(!gamePlay[localRoomUsers.get(socket.id)]?.final.includes(s)){
            console.log(s,"+++++++++++++++++++++++++++++")
            gamePlay[localRoomUsers.get(socket.id)].final.push(s);
          }
          socket.to(localRoomUsers.get(socket.id)).emit("final")
          gamePlay[localRoomUsers.get(socket.id)].matchs[0] = [
            gamePlay[localRoomUsers.get(socket.id)].final[0],
            gamePlay[localRoomUsers.get(socket.id)].final[1],
          ]
          callback([gamePlay[localRoomUsers.get(socket.id)].final])
        } else if(s.email === idtodata.get(socket.id).email){
          callback("loser")
          model.lostTournament(s,localRoomUsers.get(socket.id))
          roomMembers[localRoomUsers.get(socket.id)].splice(i);
          socket.leave(localRoomUsers.get(socket.id));
          model.leftTournament(s, localRoomUsers.get(socket.id));
          localRoomUsers.delete(socket.id);
        }
      }
      
      
      
      
    }else if(gamePlay[localRoomUsers.get(socket.id)]?.round === 5){
      if(roomMembers[localRoomUsers.get(socket.id)]?.length<2){
        console.log("You Got Second Price")
            model.winnerSecond(roomMembers[localRoomUsers.get(socket.id)][0], localRoomUsers.get(socket.id));
            callback("You Got Second Price")
            roomMembers[localRoomUsers.get(socket.id)].splice(0);
            socket.leave(localRoomUsers.get(socket.id));
            model.leftTournament(roomMembers[localRoomUsers.get(socket.id)][0], localRoomUsers.get(socket.id));
            localRoomUsers.delete(socket.id);
            return
      }
      for ( let i = 0; i < roomMembers[localRoomUsers.get(socket.id)]?.length; i++) {
        let s = roomMembers[localRoomUsers.get(socket.id)][i];
        if (gamePlay[localRoomUsers.get(socket.id)][s.email] === 3) {
          if(s.email === idtodata.get(socket.id).email){
            model.winnerFirst(s, localRoomUsers.get(socket.id));
            callback("You Got First Price")
            roomMembers[localRoomUsers.get(socket.id)].splice(i);
            socket.leave(localRoomUsers.get(socket.id));
            model.leftTournament(s, localRoomUsers.get(socket.id));
            localRoomUsers.delete(socket.id);
            return
          }
          
        } else {
          if(s.email === idtodata.get(socket.id).email){
            console.log("You Got Second Price")
            model.winnerSecond(s, localRoomUsers.get(socket.id));
            callback("You Got Second Price")
            roomMembers[localRoomUsers.get(socket.id)].splice(i);
            socket.leave(localRoomUsers.get(socket.id));
            model.leftTournament(s, localRoomUsers.get(socket.id));
            localRoomUsers.delete(socket.id);
            return
          }
        }
      }
    }
    
  }catch(err){
    console.log(err)
  }
  });
  socket.on("start-tournament", () => {
    try {
      
      const data = gamePlay[localRoomUsers.get(socket.id)]?.matchs;
      let room = localRoomUsers.get(socket.id);
      console.log(room);
      for (let i = 0; i < data?.length; i++) {
        if (
          data[i][0]?.email === idtodata.get(socket.id)?.email ||
          data[i][1]?.email === idtodata.get(socket.id)?.email
        ) {
          room = room + "group" + i;
        }
      }
      console.log(room);
      socket.join(room);
      tournamentGroup.set(socket.id, room);
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("make-tournament-condition-false",()=>{
    try{
       condition[localRoomUsers.get(socket.id)]=false;
    }catch(err){
      console.log(err)
    }
  })

  socket.on("start-game", ({}, callback) => {
    try {
     
      const data = gamePlay[localRoomUsers.get(socket.id)]?.matchs;
      let type = "";
      for (let i = 0; i < data?.length; i++) {
        if (data[i][0]?.email === idtodata.get(socket.id).email) {
          type = "X";
        } else if (data[i][1]?.email === idtodata.get(socket.id).email) {
          type = "O";
        }
      }
      callback(type);
      socket
        .to(tournamentGroup?.get(socket.id))
        .emit("start-game", idtodata.get(socket.id));
      gamePlay[tournamentGroup?.get(socket.id)]={...gamePlay[tournamentGroup?.get(socket.id)],currentPlayer:"X",play:[]}
      delete gamePlay[tournamentGroup?.get(socket.id)].round;
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("start-game-2", () => {
    try {
      socket
        .to(tournamentGroup?.get(socket.id))
        .emit("start-game-2", idtodata.get(socket.id));
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("playing", ({ index, player }) => {
    try {
      console.log(gamePlay[tournamentGroup?.get(socket.id)], socket.rooms);
      if (!gamePlay[tournamentGroup?.get(socket.id)]) {
        gamePlay[tournamentGroup?.get(socket.id)] = {
          currentPlayer: player === "X" ? "O" : "X",
          play: [],
        };
        console.log(gamePlay[tournamentGroup?.get(socket.id)]);
        gamePlay[tournamentGroup?.get(socket.id)].play[index] = player;
      } else if (
        player === gamePlay[tournamentGroup?.get(socket.id)]?.currentPlayer
      ) {
        gamePlay[tournamentGroup?.get(socket.id)].play[index] = player;
        if (player === "X") {
          gamePlay[tournamentGroup?.get(socket.id)].currentPlayer = "O";
        } else {
          gamePlay[tournamentGroup?.get(socket.id)].currentPlayer = "X";
        }
      }
      console.log(
        gamePlay[tournamentGroup?.get(socket.id)].currentPlayer,
        "hello world!"
      );
      socket.to(tournamentGroup.get(socket.id)).emit("playing", {
        gamePlay: gamePlay[tournamentGroup?.get(socket.id)].play,
        current: gamePlay[tournamentGroup?.get(socket.id)].currentPlayer,
      });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("i-won", (data) => {
    try {
      socket.to(tournamentGroup.get(socket.id)).emit("i-won", {
        gamePlay: gamePlay[tournamentGroup?.get(socket.id)].play,
        current: gamePlay[tournamentGroup?.get(socket.id)].currentPlayer,
      });
      gamePlay[tournamentGroup?.get(socket.id)].play = [];
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("switch-player", () => {
    try {
      if (!localRoomSwitchUser[tournamentGroup.get(socket.id)]) {
        console.log("hello");
        localRoomSwitchUser[tournamentGroup.get(socket.id)] = [socket.id];
      } else {
        localRoomSwitchUser[tournamentGroup.get(socket.id)].push(socket.id);
        if (localRoomSwitchUser[tournamentGroup.get(socket.id)]?.length >= 2) {
          localRoomSwitchUser[tournamentGroup.get(socket.id)] = [];
          if (
            gamePlay[tournamentGroup?.get(socket.id)]?.currentPlayer === "X"
          ) {
            gamePlay[tournamentGroup?.get(socket.id)].currentPlayer = "O";
          } else {
            gamePlay[tournamentGroup?.get(socket.id)].currentPlayer = "X";
          }
        }
      }
    } catch (err) {
      console.log(err, "heee");
    }
  });

  socket.on("round-finished", (data: any) => {
    if (data?.email) {
      data = idtodata.get(UserToId.get(data.email));
      gamePlay[localRoomUsers.get(socket.id)][data.email] = gamePlay[
        localRoomUsers.get(socket.id)
      ][data.email]
        ? gamePlay[localRoomUsers.get(socket.id)][data.email] + 1
        : 1;
      socket.to(tournamentGroup?.get(socket.id)).emit("gameFinished");
      if (!condition[localRoomUsers.get(socket.id)]) {
        gamePlay[localRoomUsers.get(socket.id)].round =
          gamePlay[localRoomUsers.get(socket.id)].round + 1;
        condition[localRoomUsers.get(socket.id)] = true;
      }
      model.saveScore(localRoomUsers.get(socket.id), data?._id);
    } else {
      socket.to(tournamentGroup?.get(socket.id)).emit("golden-game");
      goldenGame[tournamentGroup?.get(socket.id)] = true;
    }
  });
  socket.on("next-round", () => {
    try {
      gamePlay[tournamentGroup?.get(socket.id)] = {
        play: [],
        currentPlayer: gamePlay[tournamentGroup?.get(socket.id)].currentPlayer,
        round: gamePlay[tournamentGroup?.get(socket.id)]?.round
          ? gamePlay[tournamentGroup?.get(socket.id)].round + 1
          : 1,
      };
      if (gamePlay[tournamentGroup?.get(socket.id)]?.round > 2) {
        socket.to(tournamentGroup?.get(socket.id)).emit("round-finished");
      } else {
        socket.to(tournamentGroup?.get(socket.id)).emit("next-round");
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("draw", () => {
    try {
      socket.to(tournamentGroup?.get(socket.id)).emit("draw");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("leave-tournament-group", () => {
    socket.leave(tournamentGroup.get(socket.id));
  });

  socket.on("join-tournament-private", async ({ user, room,pass }, callback) => {
    let tournament: any = await model.getTournmentDetails(room);
    try {
      if (
        tournament?.type === "private" && tournament?.pass === pass &&
        !gamePlay[localRoomUsers.get(socket.id)]?.confirm || user._id === tournament.admin+""
      ) {
        if (tournament?.joined?.length < 4 || !tournament?.joined) {
          await model.joinTournament(user, room);
        }
        idtodata.set(socket.id, user);
        localRoomUsers.set(socket.id, room);
        UserToId.set(user.email, socket.id);
        socket.join(room);
        if (tournament?.joined) {
          roomMembers[room] = [...tournament?.joined, user];
        } else {
          roomMembers[room] = [user];
        }

        console.log(roomMembers[room], "hello");
        socket.to(room).emit("updation-tournament-public", roomMembers[room]);
        callback(roomMembers[room]);
      }else{
        callback(false)
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("golden-game-done",()=>{
    socket.to(tournamentGroup.get(socket.id)).emit("golden-game-done")
  })

  socket.on("challenge",({user,link,sender}:{user:string,link:string,sender:string})=>{
    try{
      console.log({user,link,sender})
      socket.to(UserToId.get(user)).emit("challenge",{link,user:sender})
      model.sendNotification(user,"Your Challenged","Your Challenged by "+sender,"hello",link)
    }catch(err){
      console.log(err);
    }
  })

  socket.on("random",async({},callback)=>{
    if(randomRoom[0] && randomRoom[0].id!==socket.id){
      const a = randomRoom.pop()
      callback(a.res);
      socket.to(a.id).emit("random",a.res)
    }else{
      const res:any = handler.getRoomId()
      if(randomRoom.includes({id:socket.id})){
        randomRoom.push({res,id:socket.id});
      }
    }
  })
}
