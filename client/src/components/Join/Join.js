import React, { useState, useEffect } from "react";
import "./Join.css";
import { useHistory } from "react-router-dom";
import axios from "axios";

const Join = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const history = useHistory();

  const joinRoom = (e) => {
    if (!name && !room) {
      try {
      } catch (error) {
        console.log(error);
      }
      return;
    }
    e.preventDefault();
    history.push(`/chat?name=${name}&room=${room}`);
  };

  useEffect(() => {
    const getRooms = async () => {
      await axios
        .get("http://localhost:5000/rooms")
        .then((res) => {
          setRooms(res.data.filter((room) => room.length < 20));
        })
        .catch((error) => console.log(error));
    };
    getRooms();
  }, []);

  return (
    <div className="landingPage">
      <div className="joinContainer">
        <h3 className="jointitle">Join a Chatroom!</h3>
        <form onSubmit={(e) => joinRoom(e)}>
          <div>
            <input
              className="joininput"
              placeholder="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
          </div>
          <div>
            <input
              className="joininput"
              placeholder="Room"
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            ></input>
          </div>
          <select name="" id="">
            <option value="Available Rooms" disabled selected>
              Rooms
            </option>
            {rooms.map((room) => (
              <option onClick={() => joinRoom(room)} value={room}>
                {room}
              </option>
            ))}
          </select>
          <input className="joinbutton" type="submit" value="Join" />
        </form>
      </div>
    </div>
  );
};

export default Join;
