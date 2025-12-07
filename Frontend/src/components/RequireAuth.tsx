import { Navigate, Outlet } from "react-router-dom";

// Puedes cambiar la lógica de autenticación según donde guardes el usuario
function isAuthenticated() {
  // Ejemplo: revisa si hay un usuario en localStorage
  return Boolean(localStorage.getItem("user"));
}

export default function RequireAuth() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" replace />;
}
