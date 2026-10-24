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

const STORAGE_KEY = "fabric-agents-logs";

function saveLogsToStorage(logs: Record<string, AgentLog[]>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); } catch {}
}

function loadLogsFromStorage(): Record<string, AgentLog[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

// ✅ MEMOIZADO PARA EVITAR RE-RENDERS INNECESARIOS
const RocketHUD = memo(({ 
  status, 
  commitsCount, 
  repoLabel, 
  sprintLabel, 
  statusLabel, 
  color, 
  agentLogs = {} 
}: RocketHUDProps) => {
  const [persistentLogs, setPersistentLogs] = useState<Record<string, AgentLog[]>>({});

  useEffect(() => {
    const stored = loadLogsFromStorage();
    setPersistentLogs(stored);
  }, []);

  useEffect(() => {
    if (Object.keys(agentLogs).length > 0) {
      setPersistentLogs(agentLogs);
      saveLogsToStorage(agentLogs);
    }
  }, [agentLogs]);

  const displayLogs = Object.keys(agentLogs).length > 0 ? agentLogs : persistentLogs;

  return (
    // ✅ Html estabilizado: transform={false} y sprite evitan conflictos de DOM
    <Html
      position={[0, 2.8, 0]}
      center
      distanceFactor={8}
      zIndexRange={[100, 0]}
      transform={false}
      sprite
      occlude={false}
    >
      {/* ✅ Contenedor con will-change para aceleración por hardware */}
      <div 
        className="pointer-events-auto select-none"
        style={{ 
          transform: 'translateZ(0)',
          willChange: 'transform',
          minWidth: '280px',
          maxWidth: '320px'
        }}
      >
        <div 
          className="bg-black/95 border-2 rounded-xl px-3 py-3 backdrop-blur-md shadow-2xl" 
          style={{ borderColor: color, boxShadow: `0 0 20px ${color}60` }}
        >
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 text-center font-mono border-b border-gray-700 pb-1">
            🚀 GRTEC Telemetry
          </div>
          
          <div className="text-[11px] font-bold text-white truncate text-center mb-2" title={repoLabel}>
            📦 {repoLabel}
          </div>
          
          <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 border border-cyan-400/50 rounded-lg px-2 py-2 mb-2">
            <div className="text-[8px] text-cyan-300 text-center uppercase tracking-wider mb-0.5">Commits</div>
            <div className="text-[24px] font-black text-cyan-300 text-center font-mono leading-none">
              ⚡ {commitsCount}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-gray-300 gap-2 mb-2">
            <span className="font-mono">★ —</span>
            <span className="font-bold text-cyan-300 font-mono">{sprintLabel}</span>
          </div>

          <div className="text-[8px] text-left space-y-0.5 border-t border-gray-700 pt-2 max-h-24 overflow-y-auto custom-scrollbar">
            <div className="text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wider sticky top-0 bg-black/95 py-0.5">
              📡 Actividad:
            </div>
            
            {Object.entries(displayLogs).length === 0 ? (
              <div className="text-[8px] text-gray-500 italic text-center py-1">Sin actividad</div>
            ) : (
              Object.entries(displayLogs).map(([agent, logs]) => {
                if (!logs || logs.length === 0) return null;
                const icon = agent === "doc" ? "📝" : agent === "dev" ? "🛠️" : agent === "arch" ? "🏗️" : agent === "qa" ? "🧪" : "📋";
                return (
                  <div key={agent} className="flex flex-col gap-0.5">
                    {logs.slice(-1).map((log: AgentLog, i: number) => (
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
              className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block border"
              style={{ color, backgroundColor: `${color}20`, borderColor: `${color}60` }}
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