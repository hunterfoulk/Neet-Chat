import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import "./components.scss";
import { useHistory } from "react-router-dom";
import Button from "godspeed/build/Button";
import Input from "godspeed/build/Input";
import Modal from "godspeed/build/Modal";
import axios from "axios";

const Chat = ({ location }) => {
  const ENDPOINT = "localhost:5000";
  const socket = useRef({});
  const messagesEndRef = useRef(null);
  const [PMS, openPMS] = useState(false);
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [privateMessage, setPrivateMEssage] = useState("placeholder message");
  const [messages, setMessages] = useState([]);
  const [typers, setTypers] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);

  var moment = require("moment");
  let timeStamp = moment().format("LT");
  const history = useHistory();

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    console.log(name, room);

    setName(name);
    setRoom(room);

    socket.current = io(ENDPOINT);

    socket.current.on("connect", () => {
      socket.current.emit("join", { name: name, room: room });
    });

    socket.current.on("newMessage", (message) => {
      setMessages((msgs) => [...msgs, message]);
      messagesEndRef.current.scrollIntoView();
    });

    socket.current.on("updateUsers", (updatedUsers) => {
      setUsers(updatedUsers);
      console.log("updated users:", updatedUsers);
    });

    socket.current.on("typing", (name) => {
      setTypers((typers) =>
        !typers.includes(name) ? [...typers, name] : typers
      );
    });

    socket.current.on("notTyping", (name) => {
      setTypers((typers) => typers.filter((typer) => typer !== name));
    });

    socket.current.on("privateMessage", ({ sender, receiver, message }) => {
      setPrivateRooms((rooms) => {
        let privateRoomsCopy = [...rooms];
        let existingRoom = privateRoomsCopy.find(
          (r) =>
            (r.sender.socketId === sender.socketId &&
              r.receiver.socketId === receiver.socketId) ||
            (r.sender.socketId === receiver.socketId &&
              r.receiver.socketId === sender.socketId)
        );
        if (!existingRoom) {
          privateRoomsCopy.push({
            sender: sender,
            receiver: receiver,

            messages: [
              { sender: sender, receiver: receiver, message: message },
            ],
          });
        } else {
          let messagesCopy = [...existingRoom.messages];
          messagesCopy.push({
            sender: sender,
            receiver: receiver,
            message: message,
          });
          existingRoom.messages = messagesCopy;
        }
        return privateRoomsCopy;
      });
    });

    console.log(socket, [ENDPOINT, location.search]);

    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log(privateRooms);
  }, [privateRooms]);

  // PRIVATE MESSAGE
  const openPrivateMessage = (receiver) => {
    socket.current.emit("privateMessage", { receiver, message: "test" });
    console.log("receiver:", receiver);
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (message) {
      socket.current.emit("sendMessage", {
        message: message,
        name: name,
      });
      setMessage("");
      socket.current.emit("notTyping", {
        name: name,
      });
    }
  };

  function checkInputValue(e) {
    setMessage(e.target.value);
    if (!e.target.value) {
      socket.current.emit("notTyping", {
        name: name,
      });
    } else {
      socket.current.emit("typing", {
        name: name,
      });
    }
  }

  const leaveRoom = () => history.push("/");

  const bubble = {
    mine: {
      backgroundColor: "rgb(40, 69, 104)",
      color: "white",
      marginLeft: "auto",
    },
    other: {
      backgroundColor: "white",
      color: "black",
    },
  };

  return (
    <>
      {/* <Modal className="modal" onClick={() => openPMS(!PMS)} open={PMS}>
        <Input
          placeholder="Type a message"
          onChange={(e) => setPrivateMEssage(e.target.value)}
          value={privateMessage}
          autoFocus
        />

      </Modal> */}
      <div className="chat-room">
        <div className="head">
          <h1>Welcome to {room}</h1>
        </div>
        <div className="room">
          <div className="chat">
            <div className="messages">
              <ul>
                {messages.map((message, index) => (
                  <div
                    className="bubble"
                    key={index}
                    style={message.name === name ? bubble.mine : bubble.other}
                  >
                    [{timeStamp}] {message.name}: {message.message}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </ul>
            </div>
            <div className="typing">
              {typers.map((typer, index) => (
                <>
                  {typer}{" "}
                  {typers.length > 1 && index !== typers.length - 1 && " and "}
                </>
              ))}
              <>{typers.length > 0 && " is typing..."}</>
            </div>
          </div>
          <div className="side">
            <h1>Users</h1>
            <div className="users">
              {users.map((user) => (
                <div key={user.socketId}>
                  {user.name}
                  <Button
                    onClick={() => {
                      openPMS(true);
                      openPrivateMessage(user);
                    }}
                    className="button"
                    text="Message"
                  />
                </div>
              ))}
            </div>
            <div className="pms">
              <div className="tab">
                <h1>name</h1>
              </div>
              <div className="tab">
                <h1>name</h1>
              </div>
              <div className="tab">
                <h1>name</h1>
              </div>
              <div className="tab">
                <h1>name</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="foot">
          <form className="form" onSubmit={handleInputSubmit}>
            <Input
              placeholder="Type a message"
              value={message}
              onChange={checkInputValue}
              value={message}
              autoFocus
            />
          </form>
          <div className="leave">
            <Button text="Leave" onClick={leaveRoom} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
