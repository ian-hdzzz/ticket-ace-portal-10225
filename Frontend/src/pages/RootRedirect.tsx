import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Reemplaza esto por tu hook/context real de autenticación
// No hay useAuth, usamos localStorage como en Auth
import Auth from "./Auth";

const RootRedirect = () => {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("user"));

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? null : <Auth />;
};

export default RootRedirect;
