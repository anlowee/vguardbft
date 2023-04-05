import React from 'react';
import './App.css';
import Home from "./Home";
import Map from "./Map";
import Database from "./Database";

function App() {
  let component
  switch (window.location.pathname) {
    case "/":
      component = <Home />
      break
    case "/map":
      component = <Map />
      break
    case "/database":
      component = <Database />
      break
  }
  return (
    <div className="App">
      { component }
    </div>
  )
}

export default App;
