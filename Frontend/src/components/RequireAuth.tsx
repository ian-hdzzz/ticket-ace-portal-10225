import { Navigate, Outlet } from "react-router-dom";
import { useAuthInit } from "../hooks/useAuthInit";

// Puedes cambiar la lógica de autenticación según donde guardes el usuario
function isAuthenticated() {
  // Ejemplo: revisa si hay un usuario en localStorage
  return Boolean(localStorage.getItem("user"));
}

export default function RequireAuth() {
  // Initialize and maintain auth state (check/refresh token)
  useAuthInit();
  
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
}
