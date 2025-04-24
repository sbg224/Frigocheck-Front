import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance, {
  isAuthenticated as checkAuthStatus,
  fetchUserData,
  logout as logoutApi,
  setAuthInfo,
  clearAuthInfo,
} from "../utils/axios";
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    birth_day: string
  ) => Promise<boolean>;
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
  const [authChecked, setAuthChecked] = useState(false);

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    const verifyAuth = async () => {
      // Éviter de vérifier plusieurs fois
      if (authChecked) return;

      try {
        console.log("=== VÉRIFICATION DE L'AUTHENTIFICATION ===");
        setIsLoading(true);

        // Vérifier si l'utilisateur est authentifié
        const authStatus = await checkAuthStatus();
        console.log("Statut d'authentification:", authStatus);

        if (authStatus) {
          try {
            // Récupérer les données utilisateur
            const userData = await fetchUserData();
            if (userData) {
              console.log("✅ Utilisateur authentifié:", userData);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.log("❌ Impossible de récupérer les données utilisateur");
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error: unknown) {
            console.error(
              "❌ Erreur lors de la récupération des données utilisateur:",
              error
            );
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("❌ Utilisateur non authentifié");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error: unknown) {
        console.error(
          "❌ Erreur lors de la vérification de l'authentification:",
          error
        );
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [authChecked]);

  const login = async (email: string, password: string) => {
    try {
      console.log("=== TENTATIVE DE CONNEXION ===");
      const response = await axiosInstance.post(
        "http://localhost:3315/api/user/login",
        {
          email,
          password,
        }
      );

      const { user, token } = response.data;
      console.log("Réponse de connexion:", response.data);

      if (user?.id) {
        console.log("✅ Connexion réussie");
        // Stocker les informations d'authentification
        setAuthInfo(token, user.id.toString());
        setUser(user);
        setIsAuthenticated(true);
        toast.success("Connexion réussie !");
      } else {
        throw new Error("Données d'authentification invalides");
      }
    } catch (error: unknown) {
      console.error("❌ Erreur de connexion:", error instanceof Error ? error.message : error);
      toast.error(error instanceof Error ? error.message : "Erreur de connexion");
      throw error;
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
      console.log("=== TENTATIVE D'INSCRIPTION ===");
      const response = await axiosInstance.post(
        "http://localhost:3315/api/user",
        {
          firstname,
          lastname,
          email,
          password,
          birth_day,
        }
      );

      console.log("Réponse d'inscription:", response.data);

      // Vérifier si la réponse indique un succès, même sans ID utilisateur
      if (response.data?.success) {
        toast.success(
          "Inscription réussie ! Vous pouvez maintenant vous connecter."
        );
        return true;
      }

      const { user } = response.data;
      if (user?.id) {
        toast.success(
          "Inscription réussie ! Vous pouvez maintenant vous connecter."
        );
        return true;
      }

      console.log(
        "Inscription réussie mais format de réponse inattendu:",
        response.data
      );
      toast.success(
        "Inscription réussie ! Vous pouvez maintenant vous connecter."
      );
      return true;
    } catch (error: unknown) {
      console.error("Erreur d'inscription:", error instanceof Error ? error.message : error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'inscription"
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("=== DÉCONNEXION ===");
      // Nettoyer les informations d'authentification
      clearAuthInfo();
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Déconnexion réussie");
    } catch (error: unknown) {
      console.error("❌ Erreur lors de la déconnexion:", error instanceof Error ? error.message : error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const response = await axiosInstance.put(
        `http://localhost:3315/api/user/update/${user.id}`,
        data
      );

      setUser({ ...user, ...data });
      toast.success("Profil mis à jour avec succès !");
    } catch (error: unknown) {
      console.error(
        "Erreur lors de la mise à jour du profil:",
        error instanceof Error ? error.message : error
      );
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil"
      );
      throw error;
    }
  };

  const updatePassword = async (Password: string, newPassword: string) => {
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      await axiosInstance.put(
        `http://localhost:3315/api/user/update/${user.id}`,
        {
          Password,
          newPassword,
        }
      );

      toast.success("Mot de passe mis à jour avec succès !");
    } catch (error: unknown) {
      console.error(
        "Erreur lors de la mise à jour du mot de passe:",
        error instanceof Error ? error.message : error
      );
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour du mot de passe"
      );
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};