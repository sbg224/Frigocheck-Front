import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "../styles/ProtectedRoute.css";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasShownToast) {
      toast.error("Vous devez être connecté pour accéder à cette page");
      setHasShownToast(true);
    }
  }, [isAuthenticated, isLoading, hasShownToast]);

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
