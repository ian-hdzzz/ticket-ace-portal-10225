import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabase/client.ts'

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const result = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (result.error) {
          alert(result.error.message || "Correo o contraseña incorrectos");
          return;
        }
        navigate("/dashboard");
      } else {
        // Registro de usuario
        const result = await supabase.auth.signUp({
          email,
          password
        });
        if (result.error) {
          alert(result.error.message || "Error al registrar usuario");
          return;
        }
        // Si el registro fue exitoso, guardar en tabla personalizada
        if (result.data?.user) {
          await supabase
            .from('users') 
            .insert([
              {
                id: result.data.user.id,
                email,
                full_name: "admin", // o pide el nombre en el formulario
                password,      // puedes guardar el hash si lo tienes
                active: true
              }
            ]);
        }
        alert("Usuario registrado correctamente. Revisa tu correo para confirmar la cuenta.");
        setMode("login");
      }
    } catch (error) {
      console.error("Error en autenticación:", error);
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
          <h1 className="text-2xl font-bold text-white mb-2 text-center">
            {mode === "login" ? "Inicia sesión en tu cuenta" : "Crea tu cuenta"}
          </h1>
          <p className="text-[#bfcbe7] text-center mb-6">
            {mode === "login"
              ? "Bienvenido de nuevo, ingresa tus datos"
              : "Regístrate para acceder al sistema"}
          </p>
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 rounded-l-lg font-semibold transition ${
                mode === "login"
                  ? "bg-white text-[#2663EB]"
                  : "bg-transparent text-[#bfcbe7]"
              }`}
              onClick={() => setMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              className={`flex-1 py-2 rounded-r-lg font-semibold transition ${
                mode === "register"
                  ? "bg-white text-[#2663EB]"
                  : "bg-transparent text-[#bfcbe7]"
              }`}
              onClick={() => setMode("register")}
            >
              Registrarse
            </button>
          </div>
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
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-lg bg-[#2663EB] text-white font-bold text-lg hover:bg-[#1f53c5] transition"
            >
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
          {/* Botón de Google eliminado */}
        </div>
      </div>
    </div>
  );
}