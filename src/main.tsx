import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import About from "./pages/About";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance, { getUserId } from "./utils/axios";

// Fonction utilitaire pour récupérer l'ID utilisateur de manière fiable
const getCurrentUserId = () => {
  const userId = getUserId();
  if (!userId) {
    console.error("Aucun utilisateur connecté");
    return null;
  }

  console.log("ID utilisateur récupéré pour les loaders:", userId);
  return userId;
};

// Loader pour récupérer la liste de courses
async function shoppingListLoader() {
  try {
    const userId = getCurrentUserId();
    if (!userId) return { shoppingList: [] };

    console.log(
      "Chargement de la liste de courses pour l'utilisateur:",
      userId
    );
    const response = await axiosInstance.get(
      `http://localhost:3315/api/affiche/shoppingList/${userId}`
    );

    console.log("Liste de courses chargée:", response.data);
    return { shoppingList: response.data.data || [] };
  } catch (error: any) {
    console.error("Erreur lors du chargement de la liste de courses:", error);

    // Si l'erreur est 404, cela signifie que l'utilisateur n'a pas de liste de courses
    if (error.response && error.response.status === 404) {
      console.log(
        "L'utilisateur n'a pas de liste de courses, retour d'une liste vide"
      );
      return { shoppingList: [] };
    }

    return { shoppingList: [] };
  }
}

// Loader pour récupérer les données du stock
async function stockLoader() {
  try {
    const userId = getCurrentUserId();
    if (!userId) return { stockItems: [] };

    console.log("Chargement du stock pour l'utilisateur:", userId);
    const response = await axiosInstance.get(
      `http://localhost:3315/api/produits/${userId}`
    );

    console.log("Stock chargé:", response.data);
    return { stockItems: response.data.data || [] };
  } catch (error: any) {
    console.error("Erreur lors du chargement du stock:", error);

    // Si l'erreur est 404, cela signifie que l'utilisateur n'a pas de produits
    if (error.response && error.response.status === 404) {
      console.log("L'utilisateur n'a pas de produits, retour d'une liste vide");
      return { stockItems: [] };
    }

    return { stockItems: [] };
  }
}

// Loader pour le Dashboard - charge les deux types de données séparément
async function dashboardLoader() {
  try {
    const userId = getCurrentUserId();
    if (!userId) return { shoppingList: [], stockItems: [] };

    console.log(
      "Chargement des données du dashboard pour l'utilisateur:",
      userId
    );

    // Charger d'abord la liste de courses
    const shoppingListData = await shoppingListLoader();

    // Puis charger le stock
    const stockData = await stockLoader();

    // Combiner les résultats
    return {
      shoppingList: shoppingListData.shoppingList,
      stockItems: stockData.stockItems,
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données du dashboard:", error);
    return { shoppingList: [], stockItems: [] };
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
            loader: async () => {
              // Attendre un court instant pour s'assurer que le contexte d'authentification est initialisé
              await new Promise((resolve) => setTimeout(resolve, 100));
              return dashboardLoader();
            },
          },
          {
            path: "/stock",
            element: <Stock />,
            loader: async () => {
              // Attendre un court instant pour s'assurer que le contexte d'authentification est initialisé
              await new Promise((resolve) => setTimeout(resolve, 100));
              return stockLoader();
            },
          },
          {
            path: "/profile",
            element: <Profile />,
          },
          {
            path: "/about",
            element: <About />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
