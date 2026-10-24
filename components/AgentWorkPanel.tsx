"use client";
import { Html } from "@react-three/drei";
import { memo } from "react";

interface AgentWorkLog {
  agent: string;
  taskId: string;
  taskTitle: string;
  prompt: string;
  response: string;
  status: "working" | "done" | "error";
  startedAt: string;
  completedAt?: string;
  fileName?: string;
}

interface AgentWorkPanelProps {
  position: [number, number, number];
  agent: string;
  workLog?: AgentWorkLog;
  color: string;
}

const AgentWorkPanel = memo(({ position, agent, workLog, color }: AgentWorkPanelProps) => {
  if (!workLog) return null;

  const agentNames: Record<string, string> = {
    po: "Product Owner",
    arch: "Arquitecto",
    dev: "Developer",
    qa: "QA Engineer",
    doc: "Technical Writer"
  };

  const statusColors = {
    working: "border-amber-500/50 bg-amber-950/30",
    done: "border-emerald-500/50 bg-emerald-950/30",
    error: "border-red-500/50 bg-red-950/30"
  };

  const statusIcons = {
    working: "⚙️",
    done: "✅",
    error: "❌"
  };

  return (
    <Html position={position} center distanceFactor={12} occlude={false}>
      <div className="pointer-events-none select-none" style={{ transform: 'translateZ(0)' }}>
        <div className={`border-2 rounded-lg p-3 backdrop-blur-md shadow-xl min-w-[320px] max-w-[400px] ${statusColors[workLog.status]}`} style={{ borderColor: color }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white">
                {statusIcons[workLog.status]} {agentNames[agent] || agent}
              </span>
            </div>
            <span className="text-[8px] text-gray-400 font-mono">
              {workLog.status === "working" ? "Trabajando..." : workLog.fileName || "Completado"}
            </span>
          </div>

          {/* Tarea */}
          <div className="mb-2">
            <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">Tarea:</div>
            <div className="text-[9px] text-white font-medium line-clamp-2">
              {workLog.taskTitle}
            </div>
          </div>

          {/* Prompt (resumido) */}
          {workLog.prompt && (
            <div className="mb-2">
              <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">Prompt:</div>
              <div className="text-[8px] text-cyan-300 bg-black/40 rounded p-2 max-h-16 overflow-y-auto custom-scrollbar font-mono line-clamp-4">
                {workLog.prompt}
              </div>
            </div>
          )}

          {/* Respuesta */}
          {workLog.response && (
            <div>
              <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">
                {workLog.status === "working" ? "Generando..." : "Respuesta:"}
              </div>
              <div className="text-[8px] text-emerald-300 bg-black/40 rounded p-2 max-h-20 overflow-y-auto custom-scrollbar font-mono line-clamp-6">
                {workLog.status === "working" ? (
                  <span className="animate-pulse">⏳ Procesando con IA...</span>
                ) : (
                  workLog.response
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          {workLog.completedAt && (
            <div className="mt-2 pt-2 border-t border-gray-700 text-[8px] text-gray-400 text-right">
              {new Date(workLog.completedAt).toLocaleTimeString("es-ES")}
            </div>
          )}
        </div>
      </div>
    </Html>
  );
});

AgentWorkPanel.displayName = "AgentWorkPanel";

export default AgentWorkPanel;