import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabase/client.ts'

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula login y registro, acepta cualquier credencial
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden md:flex flex-1 bg-[#2663EB] items-center justify-center">
        <div className="flex flex-col items-center">
<img src="/cea-logo.png" alt="CEA Querétaro" className="mb-2 w-[420px] rounded-lg" />  
          <p className="text-white text-xl text-center max-w-xs font-bold">Sistema de Gestión de Tickets</p>
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
              <input
                type="password"
                required
                className="w-full px-4 py-2 rounded-lg bg-[#232B3E] text-white placeholder-[#bfcbe7] border border-[#2663EB] focus:outline-none focus:ring-2 focus:ring-[#2663EB]"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
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