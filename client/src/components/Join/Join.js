import React, { useState, useEffect } from "react";
import "./Join.css";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Menu from "godspeed/build/Menu";

const Join = () => {
  const [menu, setMenu] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);

  const history = useHistory();

  const joinRoom = (e) => {
    e.preventDefault();
    if (name && room) {
      history.push(`/chat?name=${name}&room=${room}`);
    }
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
        <form onSubmit={(e) => joinRoom(e)}>
          <h1>Nickname</h1>
          <input
            className="joininput"
            placeholder="Nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <h1>Create room</h1>
          <input
            className="joininput"
            placeholder="Room Name"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <div>
            <button className="joinbutton" onClick={(e) => joinRoom(e)}>
              Join
            </button>
          </div>
        </form>
        <h1>Existing Rooms</h1>
        <select className="room-menu" onClick={(e) => setRoom(e.target.value)}>
          <option disabled selected></option>
          {rooms.map((room) => (
            <option value={room}>{room}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Join;
