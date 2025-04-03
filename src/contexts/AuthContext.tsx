import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  birth_day: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    birth_day: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setupAxiosAuth = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setupAxiosAuth(null);
        setIsLoading(false);
        return;
      }

      setupAxiosAuth(token);

      const response = await axios.get(
        "http://localhost:3315/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
        setupAxiosAuth(null);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      setupAxiosAuth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3315/api/user/login",
        {
          email,
          password,
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      setUser(user);
      setIsAuthenticated(true);

      setupAxiosAuth(token);

      toast.success("Connexion réussie !");
    } catch (error: any) {
      console.error("Erreur de connexion:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Erreur de connexion");
      throw new Error(error.response?.data?.message || "Erreur de connexion");
    }
  };

  const register = async (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    birth_day: string
  ) => {
    try {
      const response = await axios.post("http://localhost:3315/api/user", {
        firstname,
        lastname,
        email,
        password,
        birth_day,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      setUser(user);
      setIsAuthenticated(true);

      setupAxiosAuth(token);

      toast.success("Inscription réussie !");
    } catch (error: any) {
      console.error("Erreur d'inscription:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Erreur d'inscription");
      throw new Error(error.response?.data?.message || "Erreur d'inscription");
    }
  };

  const logout = async () => {
    try {
      if (isAuthenticated) {
        await axios.post("http://localhost:3315/api/user/logout");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      localStorage.removeItem("token");

      setUser(null);
      setIsAuthenticated(false);

      setupAxiosAuth(null);

      toast.success("Déconnexion réussie !");
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await axios.put(
        `http://localhost:3315/api/user/update/${user.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUser({ ...user, ...data });

      toast.success("Profil mis à jour avec succès !");
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour du profil:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil"
      );
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil"
      );
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      await axios.put(
        "http://localhost:3315/api/user/password",
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Mot de passe mis à jour avec succès !");
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour du mot de passe:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du mot de passe"
      );
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du mot de passe"
      );
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
