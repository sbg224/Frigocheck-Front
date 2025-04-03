import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import App from "./App";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import About from "./pages/About";
import Profile from "./pages/Profile";
import { AuthProvider } from "./contexts/AuthContext";

interface ApiResponse<T> {
  data: T[];
}

// Loader pour récupérer les données de la liste de courses
async function shoppingListLoader() {
  try {
    console.log("Chargement de la liste de courses...");
    const response = await axios.get<ApiResponse<any>>(
      "http://localhost:3315/api/affiche/shoppingList"
    );
    console.log("Données de la liste de courses:", response.data);

    return {
      shoppingList: response.data.data || [],
    };
  } catch (error) {
    console.error("Erreur lors du chargement de la liste de courses:", error);
    return {
      shoppingList: [],
    };
  }
}

// Loader pour récupérer les données du stock
async function stockLoader() {
  try {
    console.log("Chargement du stock...");
    const response = await axios.get<ApiResponse<any>>(
      "http://localhost:3315/api/produits"
    );
    console.log("Données du stock:", response.data);

    return {
      stockItems: response.data.data || [],
    };
  } catch (error) {
    console.error("Erreur lors du chargement du stock:", error);
    return {
      stockItems: [],
    };
  }
}

// Loader combiné pour le Dashboard
async function dashboardLoader() {
  try {
    const [shoppingListData, stockData] = await Promise.all([
      shoppingListLoader(),
      stockLoader(),
    ]);

    return {
      ...shoppingListData,
      ...stockData,
    };
  } catch (error) {
    console.error("Erreur lors du chargement des données du dashboard:", error);
    return {
      shoppingList: [],
      stockItems: [],
    };
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
        path: "/dashboard",
        element: <Dashboard />,
        loader: dashboardLoader,
      },
      {
        path: "/stock",
        element: <Stock />,
        loader: stockLoader,
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
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
