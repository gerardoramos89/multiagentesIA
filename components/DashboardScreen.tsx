"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, CheckCircle2, AlertCircle, Settings, Play, 
  LayoutGrid, GitBranch, Clock, Lock, X, 
  Cpu, Terminal, Sparkles, MessageSquare, RefreshCw,
  ChevronDown, ChevronUp, FolderGit2, Bot, Activity, ExternalLink,
  FileText, Eye, ScrollText
} from "lucide-react";
import AgentsScene3DWrapper, { FlightTelemetry } from "./AgentsScene3DWrapper";
import { useAnalysisJob } from "@/lib/use-analysis-job";

const GENERIC_SKILLS: Record<string, string[]> = {
  po: ["User Stories", "Priorización", "Criterios de Aceptación"],
  arch: ["Diseño de Sistemas", "Patrones de Diseño", "Escalabilidad"],
  dev: ["Clean Code", "TDD", "Git Flow", "Refactorización"],
  qa: ["Automatización de Tests", "Pruebas de Seguridad", "Revisión de Código"],
  doc: ["Documentación Técnica", "README", "API Docs"]
};

interface Module { id: string; name: string; status: "on" | "off"; icon: any; }
interface ProjectConfig { owner: string; repo: string; branch: string; language: string; hasReadme: boolean; totalCommits: number; lastPush: string; }
interface AgentConfig { id: string; name: string; model: string; enabled: boolean; prompt: string; skills: string[]; }
interface DiagRow { id: string; label: string; status: "ok" | "warning" | "error"; detail: string; version?: string; timestamp: string; durationMs: number; }
interface AssignedTask { testId: string; agentRole: string; cardUrl: string; assignedAt: string; }
interface LogEntry { ts: string; level: string; source: string; message: string; meta?: any; }
type ModuleStatus = "normal" | "error" | "working" | "done";

const AccordionItem = ({ title, icon: Icon, id, isOpen, onToggle, children, badge }: { title: string; icon: any; id: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; badge?: string; }) => (
  <div className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/30 mb-2 transition-all hover:border-gray-700">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors text-left">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-cyan-950/30 rounded"><Icon size={16} className="text-cyan-400" /></div>
        <span className="font-bold text-white text-xs">{title}</span>
        {badge && <span className="text-[9px] font-bold bg-cyan-900/50 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/30">{badge}</span>}
      </div>
      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
          <div className="p-3 border-t border-gray-800 bg-black/20">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

function LiveLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        if (data.success) setLogs(data.logs);
      } catch {}
    };
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = filter === "all" ? logs : logs.filter(l => l.level === filter || l.source === filter);
  const levelColors: Record<string, string> = { INFO: "text-cyan-400", WARN: "text-amber-400", ERROR: "text-red-400", AGENT: "text-purple-400", SPRINT: "text-emerald-400", SURVEY: "text-blue-400" };

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap">
        {["all", "AGENT", "SPRINT", "INFO", "ERROR"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${filter === f ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>{f}</button>
        ))}
      </div>
      <div className="bg-black/60 border border-gray-800 rounded p-2 h-64 overflow-y-auto font-mono custom-scrollbar">
        {filteredLogs.length === 0 ? <p className="text-[9px] text-gray-500 text-center py-4">Sin logs aún...</p> : (
          <div className="space-y-0.5">
            {filteredLogs.slice(-50).map((log, i) => (
              <div key={i} className="text-[8px] leading-tight flex gap-2">
                <span className="text-gray-600 shrink-0">{new Date(log.ts).toLocaleTimeString("es-ES")}</span>
                <span className={`shrink-0 font-bold ${levelColors[log.level] || "text-gray-400"}`}>[{log.level}]</span>
                <span className="text-gray-500 shrink-0">{log.source}:</span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const [analysisJobId, setAnalysisJobId] = useState<string | null>(null);
  const analysis = useAnalysisJob(analysisJobId);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({ po: 0, arch: 0, dev: 0, qa: 0, doc: 0 });
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [projectStatus, setProjectStatus] = useState<"config" | "ready" | "building" | "testing" | "deployed">("config");
  const [commitsCount, setCommitsCount] = useState(0);
  const [lastTrelloUse, setLastTrelloUse] = useState<string>("");
  const [lastWorkTimes, setLastWorkTimes] = useState<Record<string, string>>({});

  const [modules, setModules] = useState<Module[]>([
    { id: "ollama", name: "Ollama (Motor Local)", status: "on", icon: Cpu },
    { id: "deepseek", name: "DeepSeek V2 (Código)", status: "on", icon: Sparkles },
    { id: "hermes", name: "Hermes 3 (Chat/Docs)", status: "on", icon: MessageSquare },
    { id: "aider", name: "Aider (Ejecutor Git)", status: "on", icon: Terminal },
    { id: "github", name: "GitHub (Repositorios)", status: "off", icon: GitBranch },
    { id: "trello", name: "Trello (Gestión)", status: "off", icon: LayoutGrid },
  ]);

  const [activeConfigModal, setActiveConfigModal] = useState<string | null>(null);
  const [githubConfig, setGithubConfig] = useState({ owner: "", repo: "", token: "" });
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);
  const [isAnalyzingProject, setIsAnalyzingProject] = useState(false);

  const [agentsConfig, setAgentsConfig] = useState<AgentConfig[]>([
    { id: "po", name: "Product Owner", model: "hermes3:8b", enabled: true, prompt: "", skills: GENERIC_SKILLS.po },
    { id: "arch", name: "Arquitecto", model: "deepseek-coder-v2:16b", enabled: true, prompt: "", skills: GENERIC_SKILLS.arch },
    { id: "dev", name: "Developer", model: "deepseek-coder-v2:16b", enabled: true, prompt: "", skills: GENERIC_SKILLS.dev },
    { id: "qa", name: "QA Engineer", model: "deepseek-coder-v2:16b", enabled: true, prompt: "", skills: GENERIC_SKILLS.qa },
    { id: "doc", name: "Technical Writer", model: "hermes3:8b", enabled: true, prompt: "", skills: GENERIC_SKILLS.doc },
  ]);

  const [systemTest, setSystemTest] = useState<DiagRow[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [diagnosticsReady, setDiagnosticsReady] = useState(false);
  const [trelloLog, setTrelloLog] = useState<{ url?: string } | null>(null);
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleStatus>>({});
  
  const [sprintPlanned, setSprintPlanned] = useState(false);
  const [humanApproved, setHumanApproved] = useState(false);
  const [sprintExecuting, setSprintExecuting] = useState(false);
  const [sprintState, setSprintState] = useState<any>(null);

  const configuredCount = modules.filter(m => m.status === "on").length;
  const canLaunch = modules.every(m => m.status === "on") && projectConfig !== null && diagnosticsReady && sprintPlanned && humanApproved;
  const [openPanel, setOpenPanel] = useState<string>("");

  // ✅ 1. Cargar estado del sprint periódicamente
  useEffect(() => {
    const fetchSprintState = async () => {
      try {
        const res = await fetch("/api/sprint/state");
        const data = await res.json();
        if (data.success && data.sprint) {
          setSprintState(data);
          setSprintPlanned(true);
          
          const newStates: Record<string, ModuleStatus> = {};
          const newTimes: Record<string, string> = {};
          for (const task of data.sprint.tasks) {
            if (task.status === "working") newStates[task.agent] = "working";
            else if (task.status === "done") {
              newStates[task.agent] = "done";
              if (task.completedAt) newTimes[task.agent] = new Date(task.completedAt).toLocaleString("es-ES", { hour: '2-digit', minute: '2-digit' });
            }
          }
          if (Object.keys(newStates).length > 0) {
            setModuleStates(prev => ({ ...prev, ...newStates }));
            setLastWorkTimes(prev => ({ ...prev, ...newTimes }));
          }
          if (data.sprint.status === "executing") { setSprintExecuting(true); setHumanApproved(true); }
          if (data.sprint.status === "completed") { setSprintExecuting(false); setProjectStatus("deployed"); }
        }
      } catch {}
    };
    fetchSprintState();
    const interval = setInterval(fetchSprintState, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTests = localStorage.getItem('systemTest');
    const savedReady = localStorage.getItem('diagnosticsReady');
    if (savedTests) { try { setSystemTest(JSON.parse(savedTests)); } catch {} }
    if (savedReady) { setDiagnosticsReady(JSON.parse(savedReady)); }
  }, []);

  useEffect(() => {
    if (systemTest.length > 0) {
      localStorage.setItem('systemTest', JSON.stringify(systemTest));
      localStorage.setItem('diagnosticsReady', JSON.stringify(diagnosticsReady));
    }
  }, [systemTest, diagnosticsReady]);

  useEffect(() => {
    if (analysis.status === "done" && analysis.result) {
      setProjectConfig({ owner: githubConfig.owner, repo: githubConfig.repo, branch: analysis.result.branch, language: analysis.result.stack.languages[0]?.name ?? "Desconocido", hasReadme: analysis.result.status.hasReadme, totalCommits: analysis.result.status.commits, lastPush: "" });
      setCommitsCount(analysis.result.status.commits);
      setProjectStatus("ready");
      setIsAnalyzingProject(false);
    } else if (analysis.status === "error") {
      alert(`Error en análisis: ${analysis.error}`);
      setIsAnalyzingProject(false);
    }
  }, [analysis.status, analysis.result, githubConfig.owner, githubConfig.repo]);

  // ✅ 2. Funciones definidas ANTES de ser usadas
  const fetchRealTrelloCards = async (config: any) => {
    try {
      const res = await fetch(`/api/trello/cards?apiKey=${config.apiKey}&token=${config.token}&boardId=${config.boardId}`);
      const data = await res.json();
      if (data.success) { /* setTrelloCards(Object.values(data.data).flat()); */ }
    } catch (error) { console.error("Error cargando Trello:", error); }
  };

  const loadConfigFromServer = async () => {
    try {
      const res = await fetch('/api/config/status');
      const config = await res.json();
      if (config.trello?.configured) {
        setModules(prev => prev.map(m => m.id === "trello" ? { ...m, status: "on" } : m));
        fetchRealTrelloCards({ apiKey: config.trello.apiKey, token: config.trello.token, boardId: config.trello.boardId });
      }
      if (config.github?.configured) {
        setGithubConfig(prev => ({ ...prev, owner: config.github.owner, repo: config.github.repo, token: config.github.token }));
        setModules(prev => prev.map(m => m.id === "github" ? { ...m, status: "on" } : m));
      }
    } catch (error) { console.error("Error cargando config:", error); }
  };

  useEffect(() => { loadConfigFromServer(); }, []);

  const analyzeProject = async () => {
    if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) { alert("Configura GitHub primero"); return; }
    setIsAnalyzingProject(true);
    try {
      const res = await fetch("/api/project/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner: githubConfig.owner, repo: githubConfig.repo, token: githubConfig.token }) });
      const data = await res.json();
      if (data.success) setAnalysisJobId(data.jobId);
      else { alert(`Error: ${data.message}`); setIsAnalyzingProject(false); }
    } catch { alert("Error de conexión"); setIsAnalyzingProject(false); }
  };

  const runPreFlightCheck = async () => {
    setIsRunningTest(true);
    modules.forEach(m => setModuleStates(prev => ({ ...prev, [m.id]: "working" })));
    try {
      const res = await fetch("/api/system/diagnostics", { method: "POST" });
      const data = await res.json();
      setSystemTest(data.results ?? []);
      setDiagnosticsReady(Boolean(data.ready));
      const newStates: Record<string, ModuleStatus> = {};
      const newTimes: Record<string, string> = {};
      const nowStr = new Date().toLocaleString("es-ES", { hour: '2-digit', minute: '2-digit' });
      for (const row of data.results) {
        newStates[row.id] = row.status === "error" ? "error" : "done";
        if (row.status !== "error") newTimes[row.id] = nowStr;
      }
      ["po", "arch", "dev", "qa", "doc"].forEach(id => { newStates[id] = "normal"; });
      setModuleStates(newStates);
      setLastWorkTimes(prev => ({ ...prev, ...newTimes }));
      if (data.trelloLog?.ok) { setTrelloLog(data.trelloLog); setLastTrelloUse(data.trelloLog.timestamp ?? nowStr); }
    } catch {
      setDiagnosticsReady(false);
      setSystemTest([{ id: "runner", label: "Executor", status: "error", detail: "Error de conexión", timestamp: new Date().toISOString(), durationMs: 0 }]);
    } finally { setIsRunningTest(false); }
  };

  const progress = (configuredCount / modules.length) * 100;
  
  const telemetry: FlightTelemetry = useMemo(() => ({
    repo: githubConfig.owner && githubConfig.repo ? { owner: githubConfig.owner, name: githubConfig.repo } : null,
    stars: null,
    commits: sprintExecuting ? (commitsCount + (sprintState?.sprint?.tasks?.filter((t: any) => t.status === "done").length || 0)) : commitsCount,
    sprint: { number: sprintPlanned ? 1 : null, source: "default" },
    status: sprintExecuting ? "building" : projectStatus,
    progress,
    lastActivity: null,
  }), [githubConfig, commitsCount, projectStatus, progress, sprintPlanned, sprintExecuting, sprintState]);

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
      <div className="w-full md:w-[70%] h-full relative">
        <AgentsScene3DWrapper 
          onComplete={() => {}} showUI={false} 
          configuredModules={modules.filter(m => m.status === "on").map(m => m.id)}
          projectStatus={sprintExecuting ? "building" : projectStatus} 
          commitsCount={telemetry.commits || 0}
          moduleStates={moduleStates} 
          lastWorkTimes={lastWorkTimes}
          taskCounts={taskCounts} 
          telemetry={telemetry}
          sprintState={sprintState}
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-2"><Rocket size={14} /> Estado de la Nave</h3>
            <span className="text-[10px] text-gray-400">{configuredCount}/{modules.length} módulos</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <motion.div className={`h-full rounded-full transition-all duration-500 ${canLaunch ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="w-full md:w-[30%] h-full bg-gray-950 border-l border-cyan-500/20 flex flex-col">
        <div className="p-4 border-b border-cyan-500/20 bg-gray-900/30 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white mb-0.5">Centro de Comando</h1>
            <p className="text-[10px] text-gray-400">Configuración Inteligente</p>
          </div>
          <button onClick={loadConfigFromServer} className="text-[10px] flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline"><RefreshCw size={10} /> Sync</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <AccordionItem title="Módulos" icon={Settings} id="modules" isOpen={openPanel === "modules"} onToggle={() => setOpenPanel(openPanel === "modules" ? "" : "modules")} badge={`${configuredCount}/${modules.length}`}>
            <div className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <div key={module.id} className={`p-2 rounded border flex items-center justify-between transition-all ${module.status === "on" ? "bg-emerald-950/20 border-emerald-500/30" : "bg-red-950/40 border-red-500/50"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${module.status === "on" ? "bg-emerald-500/20" : "bg-red-500/20"}`}><Icon size={14} className={module.status === "on" ? "text-emerald-400" : "text-red-400"} /></div>
                      <div><span className="text-[11px] font-medium text-white block">{module.name}</span></div>
                    </div>
                    {module.status === "off" && <button onClick={() => setActiveConfigModal(module.id)} className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-bold rounded transition-all">Config</button>}
                  </div>
                );
              })}
            </div>
          </AccordionItem>

          <AccordionItem title="Test Pre-Vuelo" icon={Activity} id="test" isOpen={openPanel === "test"} onToggle={() => setOpenPanel(openPanel === "test" ? "" : "test")} badge={systemTest.length ? `${systemTest.filter(r => r.status === "ok").length}/${systemTest.length} OK` : "Sin ejecutar"}>
            <div className="space-y-2">
              {systemTest.length === 0 && <div className="p-2 border border-dashed border-gray-700 rounded text-[9px] text-gray-500">Ejecuta el diagnóstico.</div>}
              {systemTest.map((row) => (
                <div key={row.id} className={`p-2 rounded border ${row.status === "error" ? "border-red-500/60 bg-red-950/30" : "border-emerald-500/40 bg-emerald-950/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white font-medium">{row.label}</span>
                    <span className="text-[8px] text-gray-500 font-mono">{row.durationMs}ms</span>
                  </div>
                  <p className={`text-[9px] break-words ${row.status === "error" ? "text-red-400" : "text-emerald-300"}`}>{row.detail}</p>
                </div>
              ))}
              <button onClick={runPreFlightCheck} disabled={isRunningTest} className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold rounded hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                {isRunningTest ? <><RefreshCw size={12} className="animate-spin" /> Ejecutando...</> : <><Activity size={12} /> Ejecutar Diagnóstico</>}
              </button>
            </div>
          </AccordionItem>

          <AccordionItem title="Configuración del Proyecto" icon={FolderGit2} id="project" isOpen={openPanel === "project"} onToggle={() => setOpenPanel(openPanel === "project" ? "" : "project")} badge={!diagnosticsReady ? "🔒 Bloqueado" : projectConfig ? "Analizado" : "Pendiente"}>
            <div className="space-y-3">
              {!diagnosticsReady ? <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded"><p className="text-[9px] text-amber-300/80">Debes aprobar el <strong>Test Pre-Vuelo</strong>.</p></div>
              : !projectConfig ? <button onClick={analyzeProject} disabled={!githubConfig.token} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded transition-all"><GitBranch size={12} className="inline mr-1"/> Analizar Proyecto</button>
              : <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded"><div className="text-[10px] text-emerald-400 font-bold mb-1">✓ Proyecto Detectado</div><div className="text-[9px] text-gray-300">📦 {projectConfig.owner}/{projectConfig.repo} · 🔢 {projectConfig.totalCommits} commits</div></div>}
            </div>
          </AccordionItem>

          <AccordionItem title="Configuración de Agentes" icon={Bot} id="agents" isOpen={openPanel === "agents"} onToggle={() => setOpenPanel(openPanel === "agents" ? "" : "agents")} badge={!diagnosticsReady ? "🔒 Bloqueado" : `${agentsConfig.filter(a => a.enabled).length}/${agentsConfig.length}`}>
            <div className="space-y-2">
              {!diagnosticsReady ? <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded"><p className="text-[9px] text-amber-300/80">Debes aprobar el <strong>Test Pre-Vuelo</strong>.</p></div>
              : agentsConfig.map((agent) => (
                <div key={agent.id} className="p-2 bg-gray-900/50 rounded border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white font-bold">{agent.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {GENERIC_SKILLS[agent.id].map((skill) => {
                      const isActive = agent.skills.includes(skill);
                      return (
                        <button key={skill} onClick={() => setAgentsConfig(prev => prev.map(a => a.id === agent.id ? {...a, skills: isActive ? a.skills.filter(s => s !== skill) : [...a.skills, skill]} : a))} className={`px-1.5 py-0.5 border rounded text-[8px] transition-all ${isActive ? "bg-cyan-950/50 border-cyan-500/50 text-cyan-400" : "bg-gray-800 border-gray-700 text-gray-500"}`}>
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </AccordionItem>

          <AccordionItem title="Logs del Sistema" icon={ScrollText} id="logs" isOpen={openPanel === "logs"} onToggle={() => setOpenPanel(openPanel === "logs" ? "" : "logs")} badge="En vivo">
            <LiveLogs />
          </AccordionItem>
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50 shrink-0 space-y-3">
          {!sprintPlanned ? (
            <button disabled={!projectConfig || !diagnosticsReady} onClick={async () => {
              const res = await fetch("/api/sprint/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agents: agentsConfig.filter(a => a.enabled), brief: await fetch("/api/project/brief").then(r => r.json()).then(d => d.brief) }) });
              const data = await res.json();
              if (data.success) { alert(data.alreadyExists ? "ℹ️ Sprint ya planificado." : `✅ Sprint planificado con ${data.tasksCount} tareas.`); setSprintPlanned(true); } 
              else { alert(`❌ Error: ${data.message}`); }
            }} className={`w-full py-2 rounded-lg font-bold text-[10px] transition-all flex items-center justify-center gap-2 ${projectConfig && diagnosticsReady ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}>
              <LayoutGrid size={14} /> Planificar Primer Sprint
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400"><CheckCircle2 size={14} /><span className="font-bold">Sprint Planificado</span></div>
              {!humanApproved && !sprintExecuting ? (
                <div className="p-3 bg-amber-950/20 border border-amber-500/40 rounded">
                  <div className="flex items-center gap-2 mb-2"><Eye size={14} className="text-amber-400 animate-pulse" /><span className="text-[10px] font-bold text-amber-400">Pendiente de Revisión Humana</span></div>
                  <p className="text-[9px] text-gray-400 mb-2">Revisa las tareas en Trello y autoriza la ejecución.</p>
                  <button onClick={() => setHumanApproved(true)} className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-bold rounded transition-all flex items-center justify-center gap-1"><CheckCircle2 size={12} /> Aprobar Ejecución</button>
                </div>
              ) : humanApproved && !sprintExecuting ? (
                <button onClick={async () => {
                  const res = await fetch("/api/sprint/execute", { method: "POST" });
                  const data = await res.json();
                  if (data.success) { setSprintExecuting(true); setProjectStatus("building"); alert("🚀 ¡Sprint iniciado! Los agentes están trabajando."); } 
                  else { alert(`❌ Error: ${data.message}`); }
                }} className="w-full py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-bold rounded hover:from-emerald-500 hover:to-green-500 transition-all flex items-center justify-center gap-2 animate-pulse">
                  <Play size={14} /> INICIAR EJECUCIÓN DEL SPRINT
                </button>
              ) : sprintExecuting ? (
                <div className="p-3 bg-purple-950/20 border border-purple-500/40 rounded">
                  <div className="flex items-center gap-2 mb-1"><RefreshCw size={14} className="text-purple-400 animate-spin" /><span className="text-[10px] font-bold text-purple-400">Sprint en Ejecución</span></div>
                  <p className="text-[9px] text-gray-400">{sprintState?.sprint?.tasks?.filter((t: any) => t.status === "done").length || 0} / {sprintState?.sprint?.tasks?.length || 0} tareas completadas</p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/40 rounded">
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-[10px] font-bold text-emerald-400">Sprint Completado</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activeConfigModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setActiveConfigModal(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Configurar {modules.find(m => m.id === activeConfigModal)?.name}</h2>
                <button onClick={() => setActiveConfigModal(null)}><X size={20} className="text-gray-400 hover:text-white" /></button>
              </div>
              <p className="text-sm text-gray-400 mb-4">Añade las variables a <span className="font-mono text-cyan-400">.env.local</span>.</p>
              <button onClick={() => { setActiveConfigModal(null); loadConfigFromServer(); }} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all">Verificar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}