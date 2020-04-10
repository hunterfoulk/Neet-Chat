import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Modal from "godspeed/build/Modal";
import Card from "godspeed/build/Card";
import Input from "godspeed/build/Input";
import Button from "godspeed/build/Button";
import "./components.scss";

const Join = () => {
  const [modal, openModal] = useState(false);
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState({ name: false, room: false });
  const history = useHistory();

  const joinRoom = (e) => {
    e.preventDefault();
    setError({ name: !name ? true : false, room: !room ? true : false });
    if (name && room) history.push(`/chat?name=${name}&room=${room}`);
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
    modal && getRooms();
  }, [modal]);

  return (
    <>
      <Modal className="modal" onClick={() => openModal(!modal)} open={modal}>
        <h1 className="title">Choose a room</h1>
        {rooms.map((room, i) => (
          <Button
            key={i}
            className="rooms"
            text={room}
            onClick={(e) => {
              setRoom(room);
              openModal(false);
              setError({ ...error, room: false });
            }}
            shadow
          />
        ))}
      </Modal>
      <div className="home-page">
        <Card className="card" padding="20px">
          <h1>Welcome to NeetChat</h1>
          <div className="inputs">
            <Input
              placeholder="Nickname"
              error={error.name}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError({ ...error, name: false });
              }}
              underlined
            />
            <Input
              placeholder="Room name"
              error={error.room}
              value={room}
              onChange={(e) => {
                setRoom(e.target.value);
                setError({ ...error, room: false });
              }}
              underlined
            />
          </div>
          <div className="buttons">
            <Button
              text="Available Rooms"
              onClick={() => openModal(!modal)}
              shadow
            />
            <Button text="Join Room" onClick={(e) => joinRoom(e)} shadow />
          </div>
        </Card>
      </div>
    </>
  );
};

export default Join;
