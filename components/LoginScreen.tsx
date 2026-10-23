"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError("Cuenta creada. Revisa tu email para confirmar.");
        return;
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-white">
      {/* Imagen lateral */}
      <div className="w-full md:w-1/2 h-1/3 md:h-full relative overflow-hidden">
        <Image 
          src="/scrum-team.png" 
          alt="AI Factory Team" 
          fill 
          className="object-cover" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-950 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 md:top-1/2 md:left-8 md:-translate-y-1/2">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
            GRTEC <br/> Software Factory
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base">
            Fábrica de Agentes IA para Desarrollo Autónomo
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full md:w-1/2 h-2/3 md:h-full flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 bg-gray-900/50 p-8 rounded-2xl border border-cyan-500/20 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-center text-cyan-400">
            {isLogin ? "Acceso al Sistema" : "Crear Cuenta"}
          </h2>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Procesando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>

          <p className="text-center text-gray-400 text-sm">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:underline"
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}