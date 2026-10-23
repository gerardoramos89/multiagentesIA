"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CheckCircle2, Terminal, Cpu, X } from "lucide-react";
import { useEffect, useState } from "react";

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintNumber: number;
}

export default function LaunchModal({ isOpen, onClose, sprintNumber }: LaunchModalProps) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timers = [
        setTimeout(() => setStep(2), 1500),
        setTimeout(() => setStep(3), 3500),
        setTimeout(() => setStep(4), 5500),
        setTimeout(() => onClose(), 7000), // Se cierra solo después de 7 segundos
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 50 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.8, y: 50 }}
        className="relative w-full max-w-lg p-8 bg-gray-900/90 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden"
      >
        {/* Botón de cierre manual por seguridad */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
          title="Cerrar y ver progreso"
        >
          <X size={24} />
        </button>

        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse" />
        
        <div className="relative z-10 text-center space-y-6">
          {step === 1 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
              <Rocket size={64} className="text-cyan-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">🚀 Iniciando Sprint #{sprintNumber}</h2>
              <p className="text-cyan-300 text-sm">Preparando motores de IA...</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Cpu size={32} className="text-purple-400 animate-pulse" />
                <span className="text-xl font-bold text-white">Agentes Activados</span>
              </div>
              <p className="text-gray-400 text-sm">Product Owner, Arquitecto, Developer, QA y Technical Writer están en línea y trabajando.</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Terminal size={32} className="text-emerald-400 animate-pulse" />
                <span className="text-xl font-bold text-white">Ejecutando Tareas</span>
              </div>
              <p className="text-gray-400 text-sm">Generando código, actualizando documentación y preparando commits en GitHub.</p>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-emerald-400 mb-2">¡Despegue Exitoso!</h2>
              <p className="text-gray-300 text-sm">Tu máquina está trabajando autónomamente. Revisa los logs o GitHub para ver el progreso en tiempo real.</p>
            </motion.div>
          )}

          {/* Barra de progreso futurista */}
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-6">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <button 
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 text-sm font-bold rounded hover:bg-cyan-600/40 transition-all"
          >
            Ver Progreso en el Dashboard →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}