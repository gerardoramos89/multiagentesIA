"use client";
import { useState, useEffect } from "react";
import { Code, ListChecks, FileText, CheckCircle, Loader2 } from "lucide-react";
interface OnboardingScreenProps {
  onComplete: () => void;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [trelloKey, setTrelloKey] = useState("");
  const [trelloToken, setTrelloToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar repos de GitHub
  useEffect(() => {
    if (step === 2) {
      loadGitHubRepos();
    }
  }, [step]);

  const loadGitHubRepos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/github/repos');
      const data = await res.json();
      if (data.success) {
        setRepos(data.repos);
      } else {
        setError(data.error || "Error cargando repositorios");
      }
    } catch (err) {
      setError("Error de conexión con GitHub");
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (repoName: string) => {
    setSelectedRepos(prev => 
      prev.includes(repoName) 
        ? prev.filter(r => r !== repoName)
        : [...prev, repoName]
    );
  };

  const handleNext = async () => {
    if (step === 2 && selectedRepos.length === 0) {
      setError("Selecciona al menos un repositorio");
      return;
    }
    if (step === 3 && (!trelloKey || !trelloToken)) {
      setError("Completa las credenciales de Trello");
      return;
    }
    
    setError("");
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Guardar configuración
      await saveConfiguration();
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      // Guardar en localStorage (o en Supabase si prefieres)
      const config = {
        github: {
          token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
          owner: process.env.NEXT_PUBLIC_GITHUB_OWNER,
          selectedRepos,
        },
        trello: {
          key: trelloKey,
          token: trelloToken,
        },
        onboarded: true,
      };
      localStorage.setItem('fabric_config', JSON.stringify(config));
      onComplete();
    } catch (err) {
      setError("Error guardando configuración");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-900/80 border border-cyan-500/20 rounded-2xl p-8 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Configuración Inicial de la Fábrica
          </h1>
          <p className="text-gray-400">
            Paso {step} de 4: {
              step === 1 ? "Bienvenida" : 
              step === 2 ? "Conectar GitHub" : 
              step === 3 ? "Configurar Trello" : 
              "Validar y Activar"
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Contenido según paso */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  ¡Bienvenido a GRTEC Software Factory!
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Vamos a configurar tu fábrica de agentes IA. Necesitamos conectar 
                  tus herramientas de desarrollo para que los agentes puedan trabajar 
                  de forma autónoma.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-gray-800/50 border border-cyan-500/20 rounded-xl">
                  <Code className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="font-bold text-white mb-2">GitHub</h3>
                  <p className="text-sm text-gray-400">
                    Conecta tus repositorios para que los agentes lean y escriban código
                  </p>
                </div>
                <div className="p-6 bg-gray-800/50 border border-purple-500/20 rounded-xl">
                <ListChecks className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="font-bold text-white mb-2">Trello</h3>
                  <p className="text-sm text-gray-400">
                    Gestiona el backlog y sprints para que el PO agent trabaje
                  </p>
                </div>
                <div className="p-6 bg-gray-800/50 border border-emerald-500/20 rounded-xl">
                  <FileText className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="font-bold text-white mb-2">README</h3>
                  <p className="text-sm text-gray-400">
                    Valida la documentación de cada proyecto para contexto IA
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Selecciona tus repositorios de GitHub
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-cyan-400 mr-2" />
                  <span className="text-gray-400">Cargando repositorios...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {repos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => toggleRepo(repo.name)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedRepos.includes(repo.name)
                          ? "bg-cyan-950/50 border-cyan-500/50"
                          : "bg-gray-800/50 border-gray-700 hover:border-cyan-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white">{repo.name}</h3>
                          <p className="text-sm text-gray-400">{repo.full_name}</p>
                        </div>
                        {selectedRepos.includes(repo.name) && (
                          <CheckCircle className="text-cyan-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Configurar Trello
              </h2>
              <p className="text-gray-400 text-sm">
                Obtén tus credenciales en:{" "}
                <a 
                  href="https://trello.com/app-key" 
                  target="_blank"
                  className="text-cyan-400 hover:underline"
                >
                  trello.com/app-key
                </a>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="text"
                    value={trelloKey}
                    onChange={(e) => setTrelloKey(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
                    placeholder="Tu API Key de Trello"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token
                  </label>
                  <input
                    type="password"
                    value={trelloToken}
                    onChange={(e) => setTrelloToken(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 outline-none"
                    placeholder="Tu Token de Trello"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Resumen de Configuración
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="font-bold text-cyan-400 mb-2">GitHub</h3>
                  <p className="text-sm text-gray-400">
                    {selectedRepos.length} repositorios seleccionados:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedRepos.map(repo => (
                      <li key={repo} className="text-sm text-white flex items-center">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                        {repo}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h3 className="font-bold text-purple-400 mb-2">Trello</h3>
                  <p className="text-sm text-gray-400">
                    API Key: {trelloKey ? "✓ Configurada" : "✗ Pendiente"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Token: {trelloToken ? "✓ Configurado" : "✗ Pendiente"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {step === 4 ? "Activar Fábrica" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}