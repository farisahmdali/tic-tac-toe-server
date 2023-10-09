import { Socket } from "socket.io";

const localRoomUsers = new Map();
const UserToId = new Map();
const roomMembers: any = {};
const localRoomSwitchUser: any = {};
let gamePlay: any = {};

export default function handleSocket(socket: Socket) {
  console.log("user connected with id  " + socket.id);

  socket.on("join-local-room", ({ room, user }) => {
    if (roomMembers[room + ""]?.length < 2 || !roomMembers[room + ""]) {
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
      if (!gamePlay[localRoomUsers?.get(socket.id)] ) {
        gamePlay[localRoomUsers?.get(socket.id)] = {
          currentPlayer:player==="X" ? "O" : "X",
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
  });

  socket.on("disconnect", ()=>{
    console.log("disconnect",socket.id)
    socket.to(localRoomUsers.get(socket.id)).emit("user-quit")
  })
}
