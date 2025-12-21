import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from '../services/auth.service'

export default function Auth() {
  // Solo login, no registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      // Call backend API for authentication
      const response = await authService.login(email, password);
      
      if (!response.success) {
        setErrorMsg(response.message || "Correo o contraseña incorrectos.");
        return;
      }

      // Check if user has temporary password
      if (response.user.is_temporary_password) {
        // Show change password form
        setShowChangePassword(true);
        // Store user temporarily for password change
        localStorage.setItem("user_temp", JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          full_name: response.user.full_name
        }));
        return;
      }

      // Store user in localStorage for route protection
      authService.setCurrentUser(response.user);
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.message || "Ocurrió un error inesperado. Por favor intenta de nuevo más tarde.");
      console.error("Error en autenticación:", error);
    }
  };

  // Si el usuario ya está loggeado, redirige automáticamente al dashboard
  if (localStorage.getItem("user")) {
    navigate("/dashboard");
    return null;
  }

  // Lógica para cambiar contraseña si es temporal
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    try {
      // Call backend API to change password
      const response = await authService.changePassword(newPassword, confirmPassword);
      
      if (!response.success) {
        setErrorMsg(response.message || "No se pudo actualizar la contraseña.");
        return;
      }

      // Save updated user and clean temporary storage
      authService.setCurrentUser(response.user);
      localStorage.removeItem("user_temp");
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.message || "No se pudo actualizar la contraseña. Intenta de nuevo.");
      console.error("Error al cambiar contraseña:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden md:flex flex-1 bg-[#2663EB] items-center justify-center">
        <div className="flex flex-col items-center">
          <img src="/cea-logo.png" alt="CEA Querétaro" className="mb-2 w-[420px] rounded-lg" />  
          <p className="text-white text-xl text-center max-w-xs ">Sistema de Gestión de Tickets</p>
        </div>
      </div>
      {/* Right side - auth form */}
      <div className="flex-1 flex items-center justify-center bg-[#0B1019]">
        <div className="w-full max-w-md p-8 rounded-xl">
          {showChangePassword ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Cambia tu contraseña</h1>
              <p className="text-[#bfcbe7] text-center mb-6">Por seguridad, debes establecer una nueva contraseña para tu cuenta.</p>
              <form className="space-y-4" onSubmit={handleChangePassword}>
                <div>
                  <label className="block text-[#bfcbe7] mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-[#232B3E] text-white placeholder-[#bfcbe7] border border-[#2663EB] focus:outline-none focus:ring-2 focus:ring-[#2663EB]"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[#bfcbe7] mb-1">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-[#232B3E] text-white placeholder-[#bfcbe7] border border-[#2663EB] focus:outline-none focus:ring-2 focus:ring-[#2663EB]"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                {errorMsg && (
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-200 via-red-100 to-red-200 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-2 shadow animate-fade-in">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    <span className="font-medium">{errorMsg}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-lg bg-[#2663EB] text-white font-bold text-lg hover:bg-[#1f53c5] transition"
                >
                  Guardar nueva contraseña
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                Inicia sesión en tu cuenta
              </h1>
              <p className="text-[#bfcbe7] text-center mb-6">
                Bienvenido de nuevo, ingresa tus datos
              </p>
              {/* Solo login, sin botones de modo */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[#bfcbe7] mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2 rounded-lg bg-[#232B3E] text-white placeholder-[#bfcbe7] border border-[#2663EB] focus:outline-none focus:ring-2 focus:ring-[#2663EB]"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[#bfcbe7] mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-[#232B3E] text-white placeholder-[#bfcbe7] border border-[#2663EB] focus:outline-none focus:ring-2 focus:ring-[#2663EB] pr-12"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bfcbe7] focus:outline-none"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? (
                        // Ojito abierto
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z" />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      ) : (
                        // Ojito cerrado
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M6.53 6.53C4.06 8.36 2.25 12 2.25 12s3.75 6.75 9.75 6.75c2.03 0 3.91-.5 5.47-1.47M17.47 17.47C19.94 15.64 21.75 12 21.75 12s-3.75-6.75-9.75-6.75c-1.13 0-2.22.13-3.24.37" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {errorMsg && (
                  <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-200 via-red-100 to-red-200 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-2 shadow animate-fade-in">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    <span className="font-medium">{errorMsg}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-lg bg-[#2663EB] text-white font-bold text-lg hover:bg-[#1f53c5] transition"
                >
                  Iniciar sesión
                </button>
              </form>
              {/* Botón de Google eliminado */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}