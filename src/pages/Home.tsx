import React from "react";
import { useNavigate } from "react-router-dom";
import fondAcceuil from "../assets/images/fondAcceuil.png";
import logo from "../assets/images/logo.png";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="background-container">
        <img
          src={fondAcceuil}
          alt="Illustration d'accueil"
          className="background-image"
        />
      </div>
      <div className="home-content">
        <div className="content-wrapper">
          <div className="logo-container">
            <img src={logo} alt="FrigoCheck Logo" className="home-logo" />
          </div>
          <h1 className="home-title">FrigoCheck</h1>
          <p className="home-subtitle">Assistant d'épicerie</p>
          <button
            className="start-button"
            onClick={() => navigate("/dashboard")}
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
