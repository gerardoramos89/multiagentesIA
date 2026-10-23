"use client";
import { useState } from "react";
import { Rocket, Plus, Star, Settings, Trash2 } from "lucide-react";

interface Ship {
  id: string;
  name: string;
  project: string;
  status: "ready" | "working" | "idle" | "error";
  progress: number;
  lastActive: string;
  modulesOk: number;
  totalModules: number;
}

interface CommandCenterProps {
  onSelectShip: (ship: Ship) => void;
  onCreateShip: () => void;
}

export default function CommandCenter({ onSelectShip, onCreateShip }: CommandCenterProps) {
  const [ships, setShips] = useState<Ship[]>([
    {
      id: "1",
      name: "EXTRACTO",
      project: "GestorDocumental/Extracto",
      status: "ready",
      progress: 100,
      lastActive: "Hace 2 horas",
      modulesOk: 5,
      totalModules: 5,
    },
    {
      id: "2",
      name: "FABRICA-IA",
      project: "fabric-agents-grtec",
      status: "working",
      progress: 65,
      lastActive: "Ahora mismo",
      modulesOk: 4,
      totalModules: 5,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return "from-emerald-500 to-green-600";
      case "working": return "from-cyan-500 to-blue-600";
      case "idle": return "from-gray-500 to-gray-600";
      case "error": return "from-red-500 to-red-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready": return "Lista para despegar";
      case "working": return "En misión activa";
      case "idle": return "En standby";
      case "error": return "Error en sistemas";
      default: return "Desconocido";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 overflow-y-auto">
      {/* Header del Centro de Comando */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
              CENTRO DE COMANDO GRTEC
            </h1>
            <p className="text-gray-400 mt-2">
              Flota de Fábricas de Software IA • {ships.length} naves activas
            </p>
          </div>
          <button
            onClick={onCreateShip}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/30"
          >
            <Plus size={20} /> Nueva Nave
          </button>
        </div>
      </div>

      {/* Grid de Naves */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ships.map((ship) => (
          <div
            key={ship.id}
            className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-900/20"
            onClick={() => onSelectShip(ship)}
          >
            {/* Indicador de estado */}
            <div className={`absolute top-4 right-4 w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(ship.status)} animate-pulse`} />

            {/* Icono de nave */}
            <div className="mb-4">
              <Rocket size={48} className={`text-transparent bg-clip-text bg-gradient-to-r ${getStatusColor(ship.status)}`} />
            </div>

            {/* Info de la nave */}
            <h2 className="text-2xl font-bold text-white mb-1">{ship.name}</h2>
            <p className="text-sm text-gray-400 mb-4">{ship.project}</p>

            {/* Estado */}
            <div className="flex items-center gap-2 mb-4">
              {ship.status === "ready" && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
              <span className={`text-xs font-bold uppercase tracking-wider ${
                ship.status === "ready" ? "text-emerald-400" :
                ship.status === "working" ? "text-cyan-400" :
                ship.status === "idle" ? "text-gray-400" : "text-red-400"
              }`}>
                {getStatusText(ship.status)}
              </span>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progreso</span>
                <span>{ship.progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getStatusColor(ship.status)} transition-all`}
                  style={{ width: `${ship.progress}%` }}
                />
              </div>
            </div>

            {/* Módulos */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
              <span>Módulos configurados</span>
              <span className="font-bold text-white">{ship.modulesOk}/{ship.totalModules}</span>
            </div>

            {/* Última actividad */}
            <div className="text-xs text-gray-500 border-t border-gray-800 pt-3">
              Última actividad: {ship.lastActive}
            </div>

            {/* Botones de acción (aparecen en hover) */}
            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                <Settings size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="p-2 bg-gray-800 rounded-lg hover:bg-red-900"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Tarjeta para crear nueva nave */}
        <div
          onClick={onCreateShip}
          className="border-2 border-dashed border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] hover:border-cyan-500/50 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-cyan-900/30 transition-colors">
            <Plus size={32} className="text-gray-400 group-hover:text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 group-hover:text-cyan-400">Crear Nueva Nave</h3>
          <p className="text-sm text-gray-500 text-center mt-2">Configura un nuevo proyecto con sus propios agentes</p>
        </div>
      </div>
    </div>
  );
}