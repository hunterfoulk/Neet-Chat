import React from "react"
import "./index.scss"
import landing from './components/gallery/landing.png'
import { BrowserRouter as Router, Route } from "react-router-dom"
import Join from "./components/Join"
import Chat from "./components/Chat"

const App = () => (
  <Router>
    <div className="App">
      <Route path='/' exact component={Join} />
      <Route path='/chat' component={Chat} />
      <img className="bg-texture" src={landing} alt="" />
    </div>
  </Router>
)

export default App
