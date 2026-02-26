// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    // если токена нет — перекидываем на логин
    return <Navigate to="/admin/login" replace />;
  }

  // если токен есть — показываем дочерний компонент
  return children;
};

export default ProtectedRoute;
