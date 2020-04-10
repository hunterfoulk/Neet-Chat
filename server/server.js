const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());

app.use(cors());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use("/", router);

router.route("/rooms").get((req, res) => {
  let rooms = [];
  for (let key in io.sockets.adapter.rooms) {
    rooms.push(key);
    console.log(rooms);
  }
  console.log("rooms: ", rooms);
  console.log(rooms);
  return res.status(200).json(rooms);
});

function User(socketId, name, room) {
  this.socketId = socketId;
  this.name = name;
  this.room = room;
}
function Pmer(socketId, receiver, sender, room, message) {
  this.socketId = socketId;
  this.receiver = receiver;
  this.sender = sender;
  this.room = room;
  this.message = message;
}

let users = [];

//CONNECT TO SOCKET
io.on("connection", (socket) => {
  let userName = "";
  let roomName = "";

  socket.on("join", ({ name, room }) => {
    socket.join(room);
    userName = name;
    roomName = room;
    console.log("New user " + userName + " has joined ", room);
    users.push(new User(socket.id, userName, roomName));

    io.to(roomName).emit("newMessage", {
      name: userName,
      message: " has joined.",
    });
    io.to(roomName).emit(
      "updateUsers",
      users.filter((user) => user.room === roomName)
    );
  });

  socket.on("sendMessage", (message) => {
    console.log("sendMessage: ", message);
    io.to(roomName).emit("newMessage", message);
  });

  socket.on("typing", (user) => {
    console.log(userName, "is typing");
    io.to(roomName).emit("typing", userName);
  });

  socket.on("notTyping", (user) => {
    console.log(userName, "stopped typing");
    io.to(roomName).emit("notTyping", userName);

  socket.on("privateMessage", ({ receiver, message }) => {
    console.log("receiver: ", receiver);

    let privateMessage = {
      sender: new User(socket.id, userName, roomName),
      receiver: receiver,
      message: message,
    };

    socket.to(receiver.socketId).emit("privateMessage", privateMessage);
    socket.emit("privateMessage", privateMessage);
    console.log("server privateRoom:", privateMessage);
  });

  socket.on("disconnect", (reason) => {
    let user = users.find((user) => user.socketId === socket.id);
    if (user) {
      io.to(roomName).emit("newMessage", {
        user: userName,
        message: userName + " has left.",
      });

      users = users.filter((user) => user.socketId !== socket.id);
      io.to(roomName).emit(
        "updateUsers",
        users.filter((user) => user.room === roomName)
      );
    }
  });
});

//LISTENER
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
