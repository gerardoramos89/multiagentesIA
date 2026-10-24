"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, FileText, Clock, CheckCircle2, AlertCircle, 
  Loader2, Filter, Download, RefreshCw, Search
} from "lucide-react";

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
  duration?: number;
}

interface ModelsLogPanelProps {
  agentWorkLogs: AgentWorkLog[];
}

export default function ModelsLogPanel({ agentWorkLogs }: ModelsLogPanelProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const agentNames: Record<string, string> = {
    po: "Product Owner",
    arch: "Arquitecto",
    dev: "Developer",
    qa: "QA Engineer",
    doc: "Technical Writer"
  };

  const agentColors: Record<string, string> = {
    po: "text-blue-400 border-blue-500/50 bg-blue-950/20",
    arch: "text-purple-400 border-purple-500/50 bg-purple-950/20",
    dev: "text-emerald-400 border-emerald-500/50 bg-emerald-950/20",
    qa: "text-amber-400 border-amber-500/50 bg-amber-950/20",
    doc: "text-cyan-400 border-cyan-500/50 bg-cyan-950/20"
  };

  const statusIcons = {
    working: <Loader2 size={14} className="animate-spin text-amber-400" />,
    done: <CheckCircle2 size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />
  };

  // ✅ FILTRAR LOGS
  const filteredLogs = agentWorkLogs
    .filter(log => {
      if (filter !== "all" && log.agent !== filter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          log.taskTitle.toLowerCase().includes(search) ||
          log.prompt.toLowerCase().includes(search) ||
          log.response.toLowerCase().includes(search) ||
          log.fileName?.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // ✅ EXPORTAR LOGS
  const exportLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-logs-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Models Activity Log</h2>
            <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
              {filteredLogs.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-1.5 rounded transition-all ${autoRefresh ? "bg-emerald-600/20 text-emerald-400" : "bg-gray-800 text-gray-500"}`}
              title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            >
              <RefreshCw size={14} className={autoRefresh ? "animate-spin" : ""} />
            </button>
            <button
              onClick={exportLogs}
              className="p-1.5 bg-cyan-600/20 text-cyan-400 rounded hover:bg-cyan-600/40 transition-all"
              title="Exportar logs"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en logs..."
              className="w-full pl-7 pr-2 py-1.5 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-2 py-1.5 bg-black/40 border border-gray-700 rounded text-[10px] text-white focus:border-cyan-500 outline-none"
          >
            <option value="all">Todos los agentes</option>
            <option value="po">Product Owner</option>
            <option value="arch">Arquitecto</option>
            <option value="dev">Developer</option>
            <option value="qa">QA Engineer</option>
            <option value="doc">Technical Writer</option>
          </select>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(agentNames).map(([agent, name]) => {
            const count = agentWorkLogs.filter(l => l.agent === agent).length;
            const working = agentWorkLogs.filter(l => l.agent === agent && l.status === "working").length;
            return (
              <div key={agent} className={`p-2 rounded border ${agentColors[agent]} text-center`}>
                <div className="text-[9px] font-bold text-white">{name.split(" ")[0]}</div>
                <div className="text-[10px] font-mono">
                  {count} {working > 0 && <span className="text-amber-400">({working}⚙️)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Bot size={48} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay actividad registrada aún</p>
            <p className="text-[10px] text-gray-600 mt-1">Los logs aparecerán aquí cuando los agentes trabajen</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredLogs.map((log) => {
              const isExpanded = expandedLog === log.taskId;
              const duration = log.completedAt && log.startedAt 
                ? Math.round((new Date(log.completedAt).getTime() - new Date(log.startedAt).getTime()) / 1000)
                : null;

              return (
                <motion.div
                  key={log.taskId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`border-2 rounded-lg overflow-hidden ${agentColors[log.agent]}`}
                >
                  {/* Header del log */}
                  <div
                    className="p-3 cursor-pointer hover:bg-black/20 transition-all"
                    onClick={() => setExpandedLog(isExpanded ? null : log.taskId)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {statusIcons[log.status]}
                        <span className="text-[11px] font-bold text-white">
                          {agentNames[log.agent]}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {new Date(log.startedAt).toLocaleTimeString("es-ES")}
                        </span>
                        {duration && (
                          <span className="text-[9px] text-gray-500 flex items-center gap-1">
                            <Clock size={10} />
                            {duration}s
                          </span>
                        )}
                      </div>
                      {log.fileName && (
                        <span className="text-[9px] text-cyan-400 font-mono bg-black/40 px-2 py-0.5 rounded">
                          <FileText size={10} className="inline mr-1" />
                          {log.fileName}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-300 line-clamp-2">
                      {log.taskTitle}
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700 bg-black/40"
                      >
                        <div className="p-3 space-y-3">
                          {/* Prompt */}
                          <div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold">
                              📝 Prompt enviado:
                            </div>
                            <div className="text-[9px] text-cyan-300 bg-black/60 rounded p-2 max-h-32 overflow-y-auto custom-scrollbar font-mono whitespace-pre-wrap">
                              {log.prompt || "No disponible"}
                            </div>
                          </div>

                          {/* Respuesta */}
                          <div>
                            <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1 font-bold">
                              💬 Respuesta generada:
                            </div>
                            <div className="text-[9px] text-emerald-300 bg-black/60 rounded p-2 max-h-48 overflow-y-auto custom-scrollbar font-mono whitespace-pre-wrap">
                              {log.status === "working" ? (
                                <span className="animate-pulse">⏳ Generando respuesta...</span>
                              ) : (
                                log.response || "No disponible"
                              )}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="grid grid-cols-2 gap-2 text-[8px] text-gray-500 border-t border-gray-800 pt-2">
                            <div>
                              <span className="font-bold">Task ID:</span> {log.taskId}
                            </div>
                            <div>
                              <span className="font-bold">Estado:</span>{" "}
                              <span className={
                                log.status === "done" ? "text-emerald-400" :
                                log.status === "error" ? "text-red-400" : "text-amber-400"
                              }>
                                {log.status.toUpperCase()}
                              </span>
                            </div>
                            {log.completedAt && (
                              <div>
                                <span className="font-bold">Completado:</span>{" "}
                                {new Date(log.completedAt).toLocaleString("es-ES")}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}