import React, { useEffect, useRef } from 'react'
import Input from 'godspeed/build/Input'
import arrow from './gallery/arrow-up.png'

const Messenger = ({ messenger, openMessenger, privateRooms, privateMessage, setPrivateMessage }) => {

  const rooms = privateRooms
  const message = privateMessage
  const setMessage = setPrivateMessage

  const messagesEndRef = useRef(null);

  var moment = require("moment");
  let timeStamp = moment().format("LT");


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
  }

  return (
    <>
      <div className="private-messages" style={messenger ? { minHeight: '400px' } : { maxHeight: '50px' }}>
        <div className="head">
          <h1>name</h1>
          <img onClick={() => openMessenger(!messenger)} className={messenger && 'down'} src={arrow} alt="" />
        </div>
        {messenger &&
          <>
            <div className="body">
              <div className="messages">
                <ul>
                  {rooms.length > 0 && rooms[0].messages.map((message, index) => (
                    <div
                      className="bubble"
                      key={index}
                    // style={message.message === name ? bubble.mine : bubble.other}
                    >
                      [{timeStamp}] {message.receiver.name}: {message.message}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ul>
              </div>
            </div>
            <div className="foot">
              <form onSubmit={e => e.preventDefault()}>
                <Input placeholder="Type a message" onChange={e => setMessage(e.target.value)} value={message}></Input>
              </form>
            </div>
          </>
        }
      </div>
    </>
  )
}

export default Messenger
