"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Float, Grid, Line, Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Brain, Code, Shield, FileText, Users, MessageSquare, Server, 
  Terminal, Sparkles, Cpu, X, CheckCircle2, Activity, Settings, LayoutGrid, AlertCircle, GitBranch
} from "lucide-react";
import * as THREE from "three";
import { useRef, useMemo, useState } from "react";
import type { FlightTelemetry } from "./AgentsScene3DWrapper"; // ✅ Importado para el tipo

const agents = [
  { id: "po", name: "Product Owner", role: "Backlog & Trello", position: [-6, 0, 4], icon: Brain, color: "#a855f7" },
  { id: "arch", name: "Arquitecto", role: "Diseño & Patrones", position: [-3, 0, 6], icon: Users, color: "#3b82f6" },
  { id: "dev", name: "Developer", role: "Código & Git", position: [0, 0, 7], icon: Code, color: "#10b981" },
  { id: "qa", name: "QA Engineer", role: "Tests & Seguridad", position: [3, 0, 6], icon: Shield, color: "#f59e0b" },
  { id: "doc", name: "Technical Writer", role: "Docs & Surveys", position: [6, 0, 4], icon: FileText, color: "#f43f5e" },
];

const tools = [
  { id: "aider", name: "Aider", role: "Ejecutor & Git", position: [-7, 0, -2], icon: Terminal, color: "#10b981" },
  { id: "github", name: "GitHub", role: "Repositorios", position: [-4, 0, -4.5], icon: GitBranch, color: "#e5e7eb" },
  { id: "deepseek", name: "DeepSeek V2", role: "Modelo de Código", position: [-1, 0, -5.5], icon: Sparkles, color: "#06b6d4" },
  { id: "trello", name: "Trello", role: "Gestión", position: [1, 0, -5.5], icon: LayoutGrid, color: "#3b82f6" },
  { id: "hermes", name: "Hermes 3", role: "Chat & Docs", position: [4, 0, -4.5], icon: MessageSquare, color: "#8b5cf6" },
  { id: "ollama", name: "Ollama", role: "Motor Local", position: [7, 0, -2], icon: Cpu, color: "#f97316" },
];

const CORE_POSITION: [number, number, number] = [0, 1.5, 1];

type ProjectStatus = "config" | "ready" | "building" | "testing" | "deployed";
type ModuleStatus = "normal" | "error" | "working" | "done";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  config: "#ef4444", ready: "#eab308", building: "#06b6d4", testing: "#f97316", deployed: "#10b981"
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  config: "CONFIGURANDO", ready: "LISTO PARA DESPEGAR", building: "CONSTRUYENDO CÓDIGO", testing: "VALIDANDO QA", deployed: "DESPLEGADO EN PROD"
};

function StatusSpiral({ color, isActive, isTrello }: { color: string; isActive: boolean; isTrello?: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const spiralParticles = useMemo(() => {
    const count = isTrello ? 80 : 50;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * (isTrello ? 16 : 10);
      const radius = 0.15 + t * (isTrello ? 1.5 : 1.0);
      const y = t * (isTrello ? 5.0 : 3.5);
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [isTrello]);

  useFrame((_, delta) => {
    if (particlesRef.current && isActive) {
      particlesRef.current.rotation.y += delta * (isTrello ? 5.0 : 3.5);
    }
  });

  if (!isActive) return null;
  return (
    <points ref={particlesRef} position={[0, 1.5, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={spiralParticles.length / 3} array={spiralParticles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={isTrello ? 0.12 : 0.10} color={color} transparent opacity={isTrello ? 1.0 : 0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function HolographicRocket({
  status,
  commitsCount,
  telemetry,
}: {
  status: ProjectStatus;
  commitsCount: number;
  telemetry?: FlightTelemetry;
}) {
  const rocketRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const color = STATUS_COLORS[status];

  const targetHeight = useMemo(() => {
    switch (status) {
      case "config": return 0.5;
      case "ready": return 2.0;
      case "building": return 3.0;
      case "testing": return 3.5;
      case "deployed": return 4.5;
      default: return 0.5;
    }
  }, [status]);

  useFrame((_, delta) => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y += delta * 0.3;
      rocketRef.current.position.y = THREE.MathUtils.lerp(
        rocketRef.current.position.y,
        targetHeight + Math.sin(Date.now() * 0.002) * 0.1,
        delta * 2
      );
    }
    if (flameRef.current)
      flameRef.current.scale.y = status === "config" ? 0.4 : 1.0 + Math.sin(Date.now() * 0.015) * 0.4;
    if (ringRef.current) ringRef.current.rotation.z += delta * 2;
    if (particlesRef.current) particlesRef.current.rotation.y -= delta * 2.0;
  });

  const spiralParticles = useMemo(() => {
    const count = Math.min(Math.max(commitsCount, 15), 60);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 10;
      const radius = 0.1 + t * 1.5;
      const y = -1.0 - t * 2.0;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [commitsCount]);

  // ✅ ESTABILIZAR DATOS DEL HUD CON useMemo
  const hudData = useMemo(() => {
    const t = telemetry;
    return {
      repoLabel: t?.repo ? `${t.repo.owner}/${t.repo.name}` : "—",
      starsLabel: t?.stars != null ? `★ ${t.stars}` : "★ —",
      commitsLabel: `⚡ ${commitsCount} COMMITS`,
      sprintLabel: t?.sprint.number != null ? `SPRINT ${String(t.sprint.number).padStart(2, "0")}` : "SPRINT —",
      statusLabel: STATUS_LABELS[status],
    };
  }, [telemetry, commitsCount, status]);

  return (
    <group position={CORE_POSITION} ref={rocketRef}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.4, 1.5, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} wireframe transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <coneGeometry args={[0.3, 0.6, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} wireframe transparent opacity={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.5, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.05]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} wireframe transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh ref={flameRef} position={[0, -1.2, 0]}>
        <coneGeometry args={[0.35, 1.2, 16]} />
        <meshStandardMaterial color={status === "config" ? "#333" : "#ffaa00"} emissive={status === "config" ? "#111" : "#ff6b35"} emissiveIntensity={status === "config" ? 0.2 : 3.0} transparent opacity={status === "config" ? 0.3 : 0.9} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.04, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.9} />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={spiralParticles.length / 3} array={spiralParticles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color={color} transparent opacity={0.7} />
      </points>

      {/* ✅ FIX: key estable para evitar race condition de unmount en React Three Fiber */}
      <Html key={`rocket-hud-${status}`} position={[0, 2.8, 0]} center>
        <div className="flex flex-col items-center pointer-events-none">
          <div className="bg-black/85 border-2 rounded-lg px-4 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.5)] min-w-[240px]" style={{ borderColor: color }}>
            <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 text-center">
              GRTEC / Flight Telemetry
            </div>
            <div className="text-[11px] font-bold text-white truncate max-w-[220px] text-center mb-2" title={hudData.repoLabel}>
              {hudData.repoLabel}
            </div>
            
            <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border border-cyan-500/50 rounded px-3 py-2 mb-2">
              <div className="text-[14px] font-bold text-cyan-400 text-center animate-pulse">
                {hudData.commitsLabel}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-gray-300 gap-3">
              <span className="font-mono">{hudData.starsLabel}</span>
              <span className="text-[10px] font-bold text-cyan-300 font-mono">{hudData.sprintLabel}</span>
            </div>
            <div className="mt-2 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ color, backgroundColor: `${color}22` }}>
                {hudData.statusLabel}
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

function DataPulse({ start, end, color, delay = 0 }: { start: [number, number, number]; end: [number, number, number]; color: string; delay?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progress = useRef(delay);
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    progress.current += delta * 0.4;
    if (progress.current > 1) progress.current = 0;
    const t = progress.current;
    meshRef.current.position.set(start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t, start[2] + (end[2] - start[2]) * t);
  });
  return (<mesh ref={meshRef}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} /></mesh>);
}

function Workstation({ agent, isModalOpen, moduleStatus, lastWorkTime, taskCount, currentTask, nextTask }: { 
  agent: typeof agents[0]; 
  isModalOpen: boolean; 
  moduleStatus: ModuleStatus; 
  lastWorkTime?: string;
  taskCount: number;
  currentTask?: any;
  nextTask?: any;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetZ = isModalOpen ? agent.position[2] + 8 : agent.position[2];
  useFrame((_, delta) => { 
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3); 
    }
  });
  
  const showSpiral = moduleStatus === "error" || moduleStatus === "working";
  const spiralColor = moduleStatus === "error" ? "#ef4444" : agent.color;
  const borderColor = moduleStatus === "error" ? "#ef4444" : moduleStatus === "working" ? agent.color : "transparent";
  const Icon = agent.icon;

  return (
    <group ref={groupRef} position={[agent.position[0], agent.position[1], agent.position[2]]}>
      <Float speed={1} rotationIntensity={0.05} floatIntensity={0.2}>
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
          <meshStandardMaterial color="#111827" emissive={agent.color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
        </mesh>
        <StatusSpiral color={spiralColor} isActive={showSpiral} />
        
        <Html position={[0, 1.5, 0]} center sprite zIndexRange={[10, 0]}>
          <div style={{ display: isModalOpen ? 'none' : 'block' }} className="pointer-events-auto flex flex-col items-center relative">
            {taskCount > 0 && (
              <div className="absolute -top-6 right-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-300 shadow-lg animate-bounce z-20">
                📋 {taskCount}
              </div>
            )}
            <div className="mb-2 p-1.5 bg-cyan-950/80 border border-cyan-500/50 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-bounce">
              <MessageSquare size={14} className="text-cyan-400" />
            </div>
            
            <div className={`bg-gray-900/90 backdrop-blur-md border-2 rounded-lg p-2 w-[180px] shadow-xl transition-all`} style={{ borderColor }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 bg-gray-800 rounded">
                  <Icon className="w-3 h-3" style={{ color: agent.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[10px] text-white truncate">{agent.name}</h3>
                  <p className="text-gray-400 text-[7px]">{agent.role}</p>
                </div>
              </div>
              
              {currentTask && (
                <div className="p-1.5 bg-cyan-950/30 border border-cyan-500/30 rounded mb-1">
                  <div className="text-[7px] text-cyan-400 font-bold mb-0.5">🎯 ACTUAL</div>
                  <div className="text-[8px] text-white truncate" title={currentTask.title}>
                    {currentTask.title.replace(/\[.*?\]\s*/, "")}
                  </div>
                  {currentTask.status === "working" && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="text-[7px] text-cyan-400">Ejecutando...</span>
                    </div>
                  )}
                </div>
              )}
              
              {nextTask && !currentTask && (
                <div className="p-1.5 bg-gray-800/50 border border-gray-700 rounded mb-1">
                  <div className="text-[7px] text-gray-400 font-bold mb-0.5">📋 SIGUIENTE</div>
                  <div className="text-[8px] text-gray-300 truncate" title={nextTask.title}>
                    {nextTask.title.replace(/\[.*?\]\s*/, "")}
                  </div>
                </div>
              )}
              
              {moduleStatus === "working" && !currentTask && (
                <div className="mt-1 pt-1 border-t border-gray-700">
                  <span className="text-[8px] font-bold block flex items-center justify-center gap-1" style={{ color: agent.color }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }}></span>
                    TRABAJANDO
                  </span>
                </div>
              )}
              {moduleStatus === "error" && (
                <span className="text-[8px] text-red-400 font-bold mt-1 block flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  ⚠️ ERROR
                </span>
              )}
              {moduleStatus === "done" && (
                <div className="mt-1 pt-1 border-t border-gray-700">
                  <span className="text-[8px] text-emerald-400 font-bold block flex items-center justify-center gap-1">
                    <CheckCircle2 size={10} /> COMPLETADO
                  </span>
                  <span className="text-[7px] text-gray-400 block mt-0.5 font-mono text-center">
                    {lastWorkTime || "Recién"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function ServerRack({ tool, isConfigured, onConfigure, isModalOpen, moduleStatus, lastWorkTime, taskCount }: { 
  tool: typeof tools[0]; 
  isConfigured: boolean; 
  onConfigure: (tool: typeof tools[0]) => void; 
  isModalOpen: boolean; 
  moduleStatus: ModuleStatus; 
  lastWorkTime?: string;
  taskCount: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetX = isModalOpen ? tool.position[0] * 1.8 : tool.position[0];
  const targetZ = isModalOpen ? tool.position[2] - 3 : tool.position[2];
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, delta * 3);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3);
    }
  });

  const showSpiral = moduleStatus === "error" || moduleStatus === "working";
  const spiralColor = moduleStatus === "error" ? "#ef4444" : tool.color;
  const borderColor = moduleStatus === "error" ? "#ef4444" : moduleStatus === "working" ? tool.color : "transparent";
  const isCritical = tool.id === "github" || tool.id === "trello";
  
  // ✅ FIX: Extraer el icono como variable para usarlo correctamente en JSX
  const Icon = tool.icon;

  return (
    <group ref={groupRef} position={[tool.position[0], tool.position[1], tool.position[2]]}>
      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.1}>
        <mesh position={[0, -1.2, 0]} onClick={() => !isModalOpen && onConfigure(tool)}>
          <boxGeometry args={[1.5, 0.5, 1.5]} />
          <meshStandardMaterial color="#0f172a" emissive={isConfigured ? tool.color : "#374151"} emissiveIntensity={isConfigured ? 0.4 : 0.1} roughness={0.1} metalness={0.9} transparent opacity={isModalOpen ? 0.2 : 1} />
        </mesh>
        <mesh position={[0, -0.8, 0.8]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={isConfigured ? "#10b981" : "#ef4444"} emissive={isConfigured ? "#10b981" : "#ef4444"} emissiveIntensity={2} transparent opacity={isModalOpen ? 0.2 : 1} />
        </mesh>
        <StatusSpiral color={spiralColor} isActive={showSpiral} isTrello={tool.id === "trello" && moduleStatus === "working"} />
        
        <Html position={[0, 1.5, 0]} center sprite zIndexRange={[10, 0]}>
          <div style={{ display: isModalOpen ? 'none' : 'block' }} className="pointer-events-auto flex flex-col items-center relative">
            {taskCount > 0 && (
              <div className="absolute -top-6 right-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-300 shadow-lg animate-bounce z-20">
                📋 {taskCount}
              </div>
            )}
            <button onClick={(e) => { e.stopPropagation(); onConfigure(tool); }} className="absolute -top-4 -right-4 p-1.5 bg-gray-800 border border-gray-600 rounded-full hover:bg-cyan-900 hover:border-cyan-500 transition-all cursor-pointer shadow-lg z-10 group/gear">
              <Settings size={12} className="text-gray-300 group-hover/gear:text-cyan-400 group-hover/gear:rotate-90 transition-transform duration-300" />
            </button>
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border ${isConfigured ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400" : "bg-red-950/80 border-red-500/50 text-red-400"}`}>
              {isConfigured ? <CheckCircle2 size={8} /> : <AlertCircle size={8} />}
              {isConfigured ? "ON" : "OFF"}
            </div>
            <div className="mb-2 p-1.5 bg-gray-900/80 border border-gray-500/50 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] animate-pulse">
              <Icon size={14} style={{ color: tool.color }} />
            </div>
            <div className={`bg-gray-900/90 backdrop-blur-md border-2 rounded-lg p-3 w-[140px] text-center shadow-xl transition-all group`} style={{ borderColor }}>
              <div className="flex justify-center mb-2"><div className="p-1.5 bg-gray-800 rounded-md group-hover:bg-gray-700 transition-colors"><Icon className="w-5 h-5" style={{ color: tool.color }} /></div></div>
              <h3 className="font-bold text-[11px] text-white mb-0.5 truncate">{tool.name}</h3>
              <p className="text-gray-400 text-[9px] leading-tight">{tool.role}</p>
              {isCritical && !isConfigured && <span className="text-[8px] text-red-400 font-bold mt-1 block">¡REQUERIDO!</span>}
              
              {moduleStatus === "working" && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                  <span className="text-[8px] font-bold block flex items-center justify-center gap-1" style={{ color: tool.color }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: tool.color }}></span>
                    TRABAJANDO
                  </span>
                </div>
              )}
              {moduleStatus === "error" && (
                <span className="text-[8px] text-red-400 font-bold mt-1 block flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  ⚠️ ERROR
                </span>
              )}
              {moduleStatus === "done" && tool.id === "trello" && (
                <div className="mt-1.5 pt-1.5 border-t border-blue-500/30">
                  <span className="text-[8px] text-blue-400 font-bold block flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    ESTELA ACTIVA
                  </span>
                  <span className="text-[7px] text-blue-300/80 block mt-0.5 font-mono text-center">
                    {lastWorkTime || "Recién"}
                  </span>
                </div>
              )}
              {moduleStatus === "done" && tool.id !== "trello" && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-700">
                  <span className="text-[8px] text-emerald-400 font-bold block flex items-center justify-center gap-1">
                    <CheckCircle2 size={10} /> COMPLETADO
                  </span>
                  <span className="text-[7px] text-gray-400 block mt-0.5 font-mono text-center">
                    {lastWorkTime || "Recién"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

// ✅ INTERFAZ ACTUALIZADA CON sprintState
interface AgentsScene3DProps {
  onComplete: () => void;
  showUI?: boolean;
  configuredModules?: string[];
  projectStatus?: ProjectStatus;
  commitsCount?: number;
  moduleStates?: Record<string, ModuleStatus>;
  lastWorkTimes?: Record<string, string>;
  taskCounts?: Record<string, number>;
  telemetry?: FlightTelemetry;
  sprintState?: any; // ✅ AÑADIDO
}

// ✅ COMPONENTE PRINCIPAL DESESTRUCTURANDO sprintState
export default function AgentsScene3D({ 
  onComplete, 
  showUI = true, 
  configuredModules = ["ollama"], 
  projectStatus = "config", 
  commitsCount = 0, 
  moduleStates = {}, 
  lastWorkTimes = {}, 
  taskCounts = {}, 
  telemetry,
  sprintState // ✅ AÑADIDO
}: AgentsScene3DProps) {
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);
  const [trelloConfig, setTrelloConfig] = useState({ apiKey: "", token: "", boardId: "" });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleConfigure = (tool: typeof tools[0]) => { setSelectedTool(tool); setTestResult(null); };
  const runTrelloTest = async () => {
    setIsTesting(true); setTestResult(null);
    try {
      const response = await fetch('/api/trello/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(trelloConfig) });
      setTestResult(await response.json());
    } catch { setTestResult({ success: false, message: 'Error de red.' }); } finally { setIsTesting(false); }
  };

  const pulses = useMemo(() => {
    const result: { start: [number, number, number]; end: [number, number, number]; color: string; delay: number }[] = [];
    agents.forEach((agent, i) => result.push({ start: CORE_POSITION, end: [agent.position[0], agent.position[1], agent.position[2]], color: "#06b6d4", delay: i * 0.3 }));
    tools.forEach((tool, i) => result.push({ start: CORE_POSITION, end: [tool.position[0], tool.position[1], tool.position[2]], color: configuredModules.includes(tool.id) ? "#10b981" : "#ef4444", delay: i * 0.4 }));
    return result;
  }, [configuredModules]);

  const isModalOpen = selectedTool !== null;

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 6, 14], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 10, 0]} intensity={1} color="#06b6d4" />
        <pointLight position={[0, 10, -5]} intensity={1} color="#f97316" />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <Grid position={[0, -1.5, 0]} args={[40, 40]} cellSize={1} cellThickness={0.5} cellColor="#06b6d4" sectionSize={3} sectionThickness={1} sectionColor="#0891b2" fadeDistance={25} fadeStrength={1} infiniteGrid />
        <HolographicRocket status={projectStatus} commitsCount={commitsCount} telemetry={telemetry} />
        {agents.map((agent, i) => (<Line key={`lan-agent-${i}`} points={[CORE_POSITION, [agent.position[0], agent.position[1], agent.position[2]]]} color="#06b6d4" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} opacity={0.6} transparent />))}
        {tools.map((tool, i) => (<Line key={`lan-tool-${i}`} points={[CORE_POSITION, [tool.position[0], tool.position[1], tool.position[2]]]} color={configuredModules.includes(tool.id) ? "#10b981" : "#ef4444"} lineWidth={2} dashed dashSize={0.2} gapSize={0.1} opacity={0.6} transparent />))}
        {pulses.map((pulse, i) => (<DataPulse key={`pulse-${i}`} {...pulse} />))}
        
        {/* ✅ RENDERIZADO DE AGENTES CON sprintState */}
        {agents.map((agent) => (
          <Workstation 
            key={agent.id} 
            agent={agent} 
            isModalOpen={isModalOpen} 
            moduleStatus={moduleStates[agent.id] || "normal"} 
            lastWorkTime={lastWorkTimes[agent.id]}
            taskCount={taskCounts[agent.id] || 0}
            currentTask={sprintState?.currentTasks?.[agent.id]}
            nextTask={sprintState?.nextTasks?.[agent.id]}
          />
        ))}
        
        {tools.map((tool) => (
          <ServerRack 
            key={tool.id} 
            tool={tool} 
            isConfigured={configuredModules.includes(tool.id)} 
            onConfigure={handleConfigure} 
            isModalOpen={isModalOpen} 
            moduleStatus={moduleStates[tool.id] || "normal"} 
            lastWorkTime={lastWorkTimes[tool.id]}
            taskCount={taskCounts[tool.id] || 0}
          />
        ))}
        
        <OrbitControls enableZoom={true} enablePan={false} autoRotate={!isModalOpen} autoRotateSpeed={0.4} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>

      {showUI && !isModalOpen && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-12">
          <div className="text-center space-y-2 pointer-events-auto mt-4">
            <div className="inline-block px-4 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2">Panel de Control de Módulos</div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Estado de la <span className="text-emerald-400">Flota</span></h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">Haz clic en los servidores para configurarlos. <span className="text-red-400 font-bold">GitHub y Trello son obligatorios</span> para despegar.</p>
          </div>
          <div className="flex justify-center pointer-events-auto mb-8">
            <button onClick={onComplete} className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-full hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/50 group">
              Acceder al Centro de Comando <MessageSquare size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedTool && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617] pointer-events-auto" onClick={() => setSelectedTool(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative z-[101] w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0b1220] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg"><selectedTool.icon className="w-6 h-6" style={{ color: selectedTool.color }} /></div>
                  <div><h2 className="text-xl font-bold text-white">{selectedTool.name}</h2><p className="text-xs text-gray-400">{selectedTool.role}</p></div>
                </div>
                <button onClick={() => setSelectedTool(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className={`p-4 rounded-xl border mb-6 ${configuredModules.includes(selectedTool.id) ? "bg-emerald-950/30 border-emerald-500/50" : "bg-red-950/30 border-red-500/50"}`}>
                <div className="flex items-center gap-3">
                  {configuredModules.includes(selectedTool.id) ? <CheckCircle2 className="text-emerald-400" size={24} /> : <AlertCircle className="text-red-400" size={24} />}
                  <div>
                    <div className={`font-bold ${configuredModules.includes(selectedTool.id) ? "text-emerald-400" : "text-red-400"}`}>{configuredModules.includes(selectedTool.id) ? "MÓDULO ACTIVO (ON)" : "MÓDULO INACTIVO (OFF)"}</div>
                    <div className="text-xs text-gray-400">{configuredModules.includes(selectedTool.id) ? "Conectado y operando correctamente." : "Requiere configuración para funcionar."}</div>
                  </div>
                </div>
              </div>
              {selectedTool.id === 'trello' && (
                <div className="space-y-3 mb-4">
                  <div><label className="text-xs text-gray-400 mb-1 block">API Key de Trello</label><input type="text" className="w-full p-2 bg-black/40 border border-gray-700 rounded-lg text-sm text-white focus:border-cyan-500 outline-none" value={trelloConfig.apiKey} onChange={(e) => setTrelloConfig({...trelloConfig, apiKey: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Token de Trello</label><input type="password" className="w-full p-2 bg-black/40 border border-gray-700 rounded-lg text-sm text-white focus:border-cyan-500 outline-none" value={trelloConfig.token} onChange={(e) => setTrelloConfig({...trelloConfig, token: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-400 mb-1 block">Board ID</label><input type="text" className="w-full p-2 bg-black/40 border border-gray-700 rounded-lg text-sm text-white focus:border-cyan-500 outline-none" value={trelloConfig.boardId} onChange={(e) => setTrelloConfig({...trelloConfig, boardId: e.target.value})} /></div>
                  {testResult && (
                    <div className={`p-3 rounded-lg mb-4 ${testResult.success ? "bg-emerald-950/30 border border-emerald-500/50" : "bg-red-950/30 border-red-500/50"}`}>
                      <div className="flex items-center gap-2">
                        {testResult.success ? <CheckCircle2 className="text-emerald-400" size={16} /> : <AlertCircle className="text-red-400" size={16} />}
                        <span className={`text-xs font-bold ${testResult.success ? "text-emerald-400" : "text-red-400"}`}>{testResult.message}</span>
                      </div>
                    </div>
                  )}
                  <button onClick={runTrelloTest} disabled={!trelloConfig.apiKey || !trelloConfig.token || !trelloConfig.boardId || isTesting} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isTesting ? <><Activity size={16} className="animate-spin" /> Probando...</> : <><Activity size={16} /> Ejecutar Test de Conexión</>}
                  </button>
                </div>
              )}
              {selectedTool.id !== 'trello' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center">
                    <p className="text-sm text-gray-300 mb-2">La configuración de <span className="font-bold text-white">{selectedTool.name}</span> se gestiona desde el archivo <span className="font-mono text-cyan-400">.env.local</span>.</p>
                  </div>
                  <button onClick={() => setSelectedTool(null)} className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all">Entendido</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}