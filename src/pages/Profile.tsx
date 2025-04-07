import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "../styles/Profile.css";

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    Password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      setIsEditingProfile(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    try {
      await updatePassword(passwordData.Password, passwordData.newPassword);
      setIsChangingPassword(false);
      setPasswordData({
        Password: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Mot de passe mis à jour avec succès");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!user) {
    return (
      <div className="profile-error">
        Veuillez vous connecter pour accéder à votre profil
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>Mon Profil</h1>

      <section className="profile-section">
        <h2>Informations personnelles</h2>
        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="firstname">Prénom</label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={profileData.firstname}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-button">
                Enregistrer
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditingProfile(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <p>
              <strong>Nom d'utilisateur:</strong> {user.firstname}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <button
              className="edit-button"
              onClick={() => setIsEditingProfile(true)}
            >
              Modifier le profil
            </button>
          </div>
        )}
      </section>

      <section className="profile-section">
        <h2>Sécurité</h2>
        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label htmlFor="Password">Ancien mot de passe</label>
              <input
                type="password"
                id="Password"
                name="Password"
                value={passwordData.Password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Nouveau mot de passe</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-button">
                Changer le mot de passe
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({
                    Password: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            className="change-password-button"
            onClick={() => setIsChangingPassword(true)}
          >
            Changer le mot de passe
          </button>
        )}
      </section>
    </div>
  );
};

export default Profile;
