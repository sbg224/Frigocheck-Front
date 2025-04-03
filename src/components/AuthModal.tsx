import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Modal from "./Modal";
import { toast } from "react-toastify";
import "../styles/AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    birth_day: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    if (!isLoginMode) {
      if (!formData.firstname || !formData.lastname || !formData.birth_day) {
        toast.error("Tous les champs obligatoires doivent être remplis");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas");
        return false;
      }
      if (formData.password.length < 6) {
        toast.error("Le mot de passe doit contenir au moins 6 caractères");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
        toast.success("Connexion réussie");
      } else {
        await register(
          formData.firstname,
          formData.lastname,
          formData.email,
          formData.password,
          formData.birth_day
        );
        toast.success("Inscription réussie");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLoginMode ? "Connexion" : "Inscription"}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isLoginMode && (
          <>
            <div className="form-group">
              <label htmlFor="firstname">Prénom</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                placeholder="Votre prénom"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastname">Nom</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                placeholder="Votre nom"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="birth_day">Date de naissance</label>
              <input
                type="date"
                id="birth_day"
                name="birth_day"
                value={formData.birth_day}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="votre@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Votre mot de passe"
            required
          />
        </div>

        {!isLoginMode && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirmez votre mot de passe"
              required
            />
          </div>
        )}

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading
            ? "Chargement..."
            : isLoginMode
            ? "Se connecter"
            : "S'inscrire"}
        </button>

        <p className="switch-mode">
          {isLoginMode ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button
            type="button"
            className="switch-button"
            onClick={() => setIsLoginMode(!isLoginMode)}
          >
            {isLoginMode ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </form>
    </Modal>
  );
};

export default AuthModal;
