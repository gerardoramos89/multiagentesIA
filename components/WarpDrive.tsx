"use client";
import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Brain, GitBranch, ShieldCheck, FileText, Zap } from "lucide-react";
import * as THREE from "three";

// Componente 3D: Estrellas en movimiento (Warp Drive)
function WarpStars() {
  const starsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <Stars 
      ref={starsRef} 
      radius={100} 
      depth={50} 
      count={7000} 
      factor={4} 
      saturation={0} 
      fade 
      speed={3} 
    />
  );
}

interface WarpDriveProps {
  isFirstTime: boolean;
  onComplete: () => void;
}

export default function WarpDrive({ isFirstTime, onComplete }: WarpDriveProps) {
  const [visible, setVisible] = useState(false);

  // Efecto de aparición suave al cargar
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Fondo 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <WarpStars />
        </Canvas>
      </div>

      {/* Panel de Briefing (Manifiesto) */}
      <div 
        className={`relative z-10 w-full max-w-3xl p-8 md:p-12 bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-900/40 transition-all duration-1000 transform ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
            <Zap size={14} className="animate-pulse" />
            Sistema Operativo GRTEC v1.0
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {isFirstTime ? "Bienvenido a la Fábrica" : "Sistemas en Línea"}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Este software no es un simple editor. Es una <span className="text-cyan-400 font-bold">Flota de Agentes IA Autónomos</span> diseñada para transformar tus ideas en código de producción.
          </p>
        </div>

        {/* Grid de Capacidades (Lo que haremos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors">
            <Brain className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-sm">Cerebro Colectivo (5 Agentes)</h3>
              <p className="text-xs text-gray-400 mt-1">PO, Arquitecto, Dev, QA y Documentador trabajando en sincronía.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-colors">
            <GitBranch className="w-6 h-6 text-cyan-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-sm">Ciclo Scrum Autónomo</h3>
              <p className="text-xs text-gray-400 mt-1">Leemos tu Trello, creamos ramas en GitHub y escribimos el código.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-emerald-500/50 transition-colors">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-sm">Calidad y Seguridad</h3>
              <p className="text-xs text-gray-400 mt-1">Tests automáticos, auditoría de vulnerabilidades y código limpio.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-amber-500/50 transition-colors">
            <FileText className="w-6 h-6 text-amber-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-bold text-white text-sm">Documentación Viva</h3>
              <p className="text-xs text-gray-400 mt-1">Actualización automática de READMEs y guías para la IA y humanos.</p>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-800">
          <button
            onClick={onComplete}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2 group"
          >
            <Zap size={20} className="group-hover:animate-pulse" />
            {isFirstTime ? "CONFIGURAR MI PRIMERA NAVE" : "IR AL CENTRO DE COMANDO"}
          </button>
          
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-white transition-colors underline decoration-gray-700 hover:decoration-white underline-offset-4"
          >
            Omitir introducción
          </button>
        </div>
      </div>
    </div>
  );
}