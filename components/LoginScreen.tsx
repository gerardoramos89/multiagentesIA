"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ MODO LOCAL: Si Supabase no está configurado, acepta cualquier credencial
    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        localStorage.setItem("user", JSON.stringify({ email: email || "demo@grtec.com", mode: "local" }));
        onLoginSuccess();
      }, 500);
      return;
    }

    // ✅ MODO SUPABASE: Autenticación real
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      localStorage.setItem("user", JSON.stringify(data.user));
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const isLocalMode = !isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-black to-purple-950/20" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
              <Bot size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Fabric Agents GRTEC</h1>
            <p className="text-sm text-gray-400">
              {isLocalMode ? (
                <span className="text-amber-400">🔧 Modo Local (sin autenticación)</span>
              ) : (
                "Inicia sesión para acceder al centro de comando"
              )}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isLocalMode ? "demo@grtec.com" : "tu@email.com"}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-sm text-white focus:border-cyan-500 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Contraseña</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLocalMode ? "Cualquier contraseña" : "••••••••"}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-gray-700 rounded-lg text-sm text-white focus:border-cyan-500 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-500/50 rounded-lg text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Acceder al Centro de Comando
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          {isLocalMode && (
            <div className="mt-6 p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 text-center">
              💡 Modo local activo. Para habilitar autenticación real, configura las variables de Supabase en .env.local
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}