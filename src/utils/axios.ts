import axios from 'axios';


// Récupérer l'URL de l'API depuis les variables d'environnement ou utiliser une valeur par défaut
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3315';

// Clés pour le localStorage
const TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';

// Fonction pour décoder le token JWT et extraire les informations de l'utilisateur
export const getUserFromToken = (): { id: number; email: string } | null => {
  const token = getTokenFromStorage();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le token JWT
    console.log("Informations extraites du token:", payload);
    return { id: payload.id, email: payload.email };
  } catch (error) {
    console.error("Erreur de décodage du token:", error);
    return null;
  }
};

// Fonction pour récupérer le token depuis le localStorage
const getTokenFromStorage = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  console.log("Token récupéré du localStorage:", token ? "✅ Présent" : "❌ Absent");
  return token;
};

// Fonction pour récupérer l'ID utilisateur depuis le localStorage
const getUserIdFromStorage = () => {
  const userId = localStorage.getItem(USER_ID_KEY);
  console.log("ID utilisateur récupéré du localStorage:", userId ? "✅ Présent" : "❌ Absent");
  return userId;
};
// Fonction pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // Vérifier d'abord si nous avons un token dans le localStorage
    const token = getTokenFromStorage();
    if (!token) {
      console.log("Aucun token trouvé dans le localStorage");
      return false;
    }
    
    // Si nous avons un token, nous considérons l'utilisateur comme authentifié
    // sans faire de requête au serveur pour éviter les boucles
    console.log("Token trouvé dans le localStorage, utilisateur considéré comme authentifié");
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return false;
  }
};

// Fonction pour récupérer le token d'authentification
export const getAuthToken = () => {
  return getTokenFromStorage();
};

// Fonction pour récupérer l'ID de l'utilisateur
export const getUserId = () => {
  // Essayer d'abord de récupérer l'ID depuis le localStorage
  const userIdFromStorage = getUserIdFromStorage();
  if (userIdFromStorage) {
    console.log("ID utilisateur récupéré du localStorage:", userIdFromStorage);
    return userIdFromStorage;
  }
  
  // Sinon, essayer d'extraire l'ID depuis le token JWT
  const userInfo = getUserFromToken();
  if (userInfo && userInfo.id) {
    console.log("ID utilisateur extrait du token JWT:", userInfo.id);
    // Stocker l'ID dans le localStorage pour les prochaines fois
    localStorage.setItem(USER_ID_KEY, userInfo.id.toString());
    return userInfo.id.toString();
  }
  
  console.error("Aucun ID utilisateur trouvé ni dans le localStorage ni dans le token JWT");
  return null;
};

// Fonction pour récupérer les données de l'utilisateur depuis le serveur
export const fetchUserData = async () => {
  try {
    // Récupérer l'ID de l'utilisateur
    const userId = getUserId();
    
    if (!userId) {
      console.error("Aucun ID utilisateur trouvé");
      return null;
    }
    
    console.log("Récupération des données utilisateur pour l'ID:", userId);
    
    // Faire une requête au serveur pour récupérer les données utilisateur
    const response = await axiosInstance.get(`/api/user/profile/${userId}`);
    console.log("Données utilisateur récupérées:", response.data);
    return response.data.user;
  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error);
    return null;
  }
};

// Fonction pour définir les informations d'authentification
export const setAuthInfo = (token: string, userId: string) => {
  console.log("Stockage des informations d'authentification dans le localStorage");
  try {
    // Stocker le token dans le localStorage
    localStorage.setItem(TOKEN_KEY, token);
    
    // Stocker l'ID utilisateur dans le localStorage
    if (userId) {
      console.log("Stockage de l'ID utilisateur fourni:", userId);
      localStorage.setItem(USER_ID_KEY, userId);
    } else {
      // Si l'ID n'est pas fourni, essayer de l'extraire du token
      const userInfo = getUserFromToken();
      if (userInfo && userInfo.id) {
        console.log("ID utilisateur extrait du token:", userInfo.id);
        localStorage.setItem(USER_ID_KEY, userInfo.id.toString());
      } else {
        console.warn("Impossible d'extraire l'ID utilisateur du token");
      }
    }
    
    // Vérifier que les informations ont été correctement stockées
    const tokenFromStorage = getTokenFromStorage();
    const userIdFromStorage = getUserIdFromStorage();
    
    console.log("Vérification du stockage:");
    console.log("Token récupéré:", tokenFromStorage ? "✅ Présent" : "❌ Absent");
    console.log("ID utilisateur récupéré:", userIdFromStorage ? "✅ Présent" : "❌ Absent");
    
    if (!tokenFromStorage || !userIdFromStorage) {
      console.warn("Les informations n'ont pas été correctement stockées");
    }
  } catch (error) {
    console.error("Erreur lors du stockage des informations:", error);
  }
};

// Fonction pour nettoyer les informations d'authentification
export const clearAuthInfo = () => {
  console.log("Nettoyage des informations d'authentification");
  try {
    // Supprimer les informations du localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    
    console.log("Token supprimé du localStorage");
    console.log("ID utilisateur supprimé du localStorage");
    
    // Vérifier que les informations ont été correctement supprimées
    const tokenFromStorage = getTokenFromStorage();
    const userIdFromStorage = getUserIdFromStorage();
    
    console.log("Vérification de la suppression:");
    console.log("Token présent:", tokenFromStorage ? "✅ Présent" : "❌ Absent");
    console.log("ID utilisateur présent:", userIdFromStorage ? "✅ Présent" : "❌ Absent");
    
    if (tokenFromStorage || userIdFromStorage) {
      console.warn("Certaines informations n'ont pas été correctement supprimées");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des informations:", error);
  }
};

// Créer une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important : permet l'envoi de cookies
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Si le serveur répond avec une erreur 401 (non autorisé)
      if (error.response.status === 401) {
        console.log("Session expirée ou token invalide");
        // Ne pas rediriger automatiquement, laisser le composant gérer la redirection
        // window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Fonction de déconnexion
export const logout = async () => {
  try {
    // Appeler l'API de déconnexion pour supprimer le cookie
    await axiosInstance.post('/api/user/logout');
    // Rediriger vers la page d'accueil
    window.location.href = '/';
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
};

export default axiosInstance; 