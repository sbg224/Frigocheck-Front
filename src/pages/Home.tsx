import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import fondAcceuil from "../assets/images/fondAcceuil.png";
import logo from "../assets/images/logo.png";
import "../styles/Home.css";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleStartClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    navigate("/dashboard");
  };

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
          <button className="start-button" onClick={handleStartClick}>
            {isAuthenticated
              ? "Accéder à mon tableau de bord"
              : "Se connecter pour commencer"}
          </button>
        </div>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Home;
