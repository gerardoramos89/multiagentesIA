"use client";
import { Html } from "@react-three/drei";
import { memo, useEffect, useState } from "react";

interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
}

interface RocketHUDProps {
  status: string;
  commitsCount: number;
  repoLabel: string;
  sprintLabel: string;
  statusLabel: string;
  color: string;
  agentLogs?: Record<string, AgentLog[]>;
}

// ✅ GUARDAR LOGS EN LOCALSTORAGE
const STORAGE_KEY = "fabric-agents-logs";

function saveLogsToStorage(logs: Record<string, AgentLog[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {}
}

function loadLogsFromStorage(): Record<string, AgentLog[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

const RocketHUD = memo(({ status, commitsCount, repoLabel, sprintLabel, statusLabel, color, agentLogs = {} }: RocketHUDProps) => {
  const [persistentLogs, setPersistentLogs] = useState<Record<string, AgentLog[]>>({});

  // ✅ CARGAR LOGS AL INICIAR
  useEffect(() => {
    const stored = loadLogsFromStorage();
    setPersistentLogs(stored);
  }, []);

  // ✅ ACTUALIZAR Y GUARDAR LOGS CUANDO CAMBIAN
  useEffect(() => {
    if (Object.keys(agentLogs).length > 0) {
      setPersistentLogs(agentLogs);
      saveLogsToStorage(agentLogs);
    }
  }, [agentLogs]);

  // ✅ COMBINAR LOGS PERSISTENTES CON LOS ACTUALES
  const displayLogs = Object.keys(agentLogs).length > 0 ? agentLogs : persistentLogs;

  return (
    <Html position={[0, 2.8, 0]} center distanceFactor={10} occlude={false}>
      <div className="pointer-events-none select-none" style={{ transform: 'translateZ(0)' }}>
        <div 
          className="bg-black/95 border-2 rounded-lg px-4 py-3 backdrop-blur-md shadow-2xl min-w-[280px]" 
          style={{ borderColor: color }}
        >
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 text-center font-mono">
            GRTEC / Flight Telemetry
          </div>
          <div className="text-[11px] font-bold text-white truncate max-w-[220px] text-center mb-2" title={repoLabel}>
            {repoLabel}
          </div>
          
          {/* ✅ CONTADOR DE COMMITS LLAMATIVO */}
          <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 border border-cyan-500/50 rounded px-3 py-2 mb-3">
            <div className="text-[16px] font-bold text-cyan-400 text-center font-mono">
              ⚡ {commitsCount} COMMITS
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-gray-300 gap-3 mb-2">
            <span className="font-mono">★ —</span>
            <span className="text-[10px] font-bold text-cyan-300 font-mono">{sprintLabel}</span>
          </div>

          {/* ✅ ÚLTIMOS LOGS DE AGENTES CON PERSISTENCIA */}
          <div className="text-[8px] text-left space-y-1 border-t border-gray-700 pt-2 max-h-28 overflow-y-auto custom-scrollbar">
            <div className="text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider sticky top-0 bg-black/95 py-1">
              Actividad Reciente:
            </div>
            {Object.entries(displayLogs).length === 0 ? (
              <div className="text-[8px] text-gray-500 italic text-center py-2">
                Sin actividad registrada
              </div>
            ) : (
              Object.entries(displayLogs).map(([agent, logs]) => {
                if (!logs || logs.length === 0) return null;
                const icon = agent === "doc" ? "📝" : agent === "dev" ? "🛠️" : agent === "arch" ? "🏗️" : agent === "qa" ? "🧪" : "📋";
                return (
                  <div key={agent} className="flex flex-col gap-0.5">
                    {logs.slice(-2).map((log: AgentLog, i: number) => (
                      <div key={i} className="flex items-start gap-1">
                        <span className="shrink-0">{icon}</span>
                        <span className={`truncate max-w-[200px] ${
                          log.level === 'error' ? 'text-red-400' : 
                          log.level === 'success' ? 'text-emerald-400' : 
                          'text-gray-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-2 text-center">
            <span 
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block" 
              style={{ color, backgroundColor: `${color}22` }}
            >
              {statusLabel}
            </span>
          </div>
        </div>
      </div>
    </Html>
  );
});

RocketHUD.displayName = "RocketHUD";

export default RocketHUD;