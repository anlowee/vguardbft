import React from "react";
import "./Home.css";
import logo from './logo.svg';

export default function Home() {
  return (
    <div className="Home">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Click <a href="http://localhost:3000/map" style={{ color: 'yellow' }}>here</a> to visit MAP.</p>
        <p>Click <a href="http://localhost:3000/database" style={{ color: 'yellow' }}>here</a> to visit DATABASE.</p>
        <a
          className="App-link"
          href="https://github.com/anlowee/vguardbft"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn our PROJECT.
        </a>
      </header>
    </div>
  );
}