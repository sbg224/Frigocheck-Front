import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attendre un court instant pour s'assurer que l'état d'authentification est chargé
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">
          FrigoCheck
        </Link>
      </div>
      <div className="navbar-links">
        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/stock" className="nav-link">
              Frigo
            </Link>
            <Link to="/about" className="nav-link">
              À propos
            </Link>
          </>
        )}
      </div>
      <div className="navbar-auth">
        {isLoading ? (
          <div className="loading-indicator">Chargement...</div>
        ) : isAuthenticated && user ? (
          <div className="user-menu">
            <button
              className="user-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {user.firstname}
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  Profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="auth-button"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Se connecter / S'inscrire
          </button>
        )}
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
