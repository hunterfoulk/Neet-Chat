import React, { useState, useEffect, useRef } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import "./Chat.css";
import { useHistory } from "react-router-dom";

const Chat = ({ location }) => {
  const ENDPOINT = "localhost:5000";
  const socket = useRef({});
  const messagesEndRef = useRef(null);
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typers, setTypers] = useState([]);

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
    });

    socket.current.on("typing", (name) => {
      setTypers((typers) =>
        !typers.includes(name) ? [...typers, name] : typers
      );
    });

    socket.current.on("notTyping", (name) => {
      setTypers((typers) => typers.filter((typer) => typer !== name));
    });

    console.log(socket, [ENDPOINT, location.search]);

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const handleInputSumbit = (e) => {
    e.preventDefault();
    // setTyping(false);
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
    console.log(e.target.value);
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

  return (
    <>
      <div className="roomheader">
        <div className="roomtitle">Welcome!</div>
        <div className="roomroom">Room: {room}</div>
        <div className="roomleave">
          <a onClick={leaveRoom}>Leave Room</a>
        </div>
      </div>
      <div className="roomcontainer">
        <div className="chatcontainer">
          <div className="chatmessagebox">
            <ul>
              {messages.map((message, index) => (
                <div
                  className="chatmessages"
                  key={index}
                  style={{
                    color: message.name === name ? "blue" : "black",
                  }}
                >
                  [{timeStamp}] {message.name}: {message.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          </div>

          <div className="chatinput">
            <form onSubmit={handleInputSumbit}>
              <input
                onChange={checkInputValue}
                className="inputfield"
                type="text"
                placeholder="Say something"
                onInput={(e) => {
                  setMessage(e.target.value);
                }}
                value={message}
                autoComplete="off"
              />
              <button className="button" type="submit">
                Send
              </button>
            </form>
            <div className="usertyping">
              {typers.map((typer, index) => (
                <>
                  {typer}
                  {typers.length > 1 && index !== typers.length - 1 && " and "}
                </>
              ))}
              <>{typers.length > 0 && " is typing..."}</>
            </div>
          </div>
        </div>
        <div className="sidebar">
          <div className="sidebartitle">Users in chat</div>
          <div className="sidebarusers">
            {users.map((user) => (
              <div id="users" className="sidebarname" key={user.socketId}>
                <div>{user.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
