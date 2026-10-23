"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CheckCircle2, Terminal, Cpu, Sparkles } from "lucide-react";
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
      const timers = [
        setTimeout(() => setStep(2), 1500),
        setTimeout(() => setStep(3), 3000),
        setTimeout(() => setStep(4), 4500),
        setTimeout(() => onClose(), 6000),
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setStep(1);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-lg p-8 bg-gray-900/80 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden"
          >
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
                    <Cpu size={32} className="text-purple-400" />
                    <span className="text-xl font-bold text-white">Agentes Activados</span>
                  </div>
                  <p className="text-gray-400 text-sm">Product Owner, Arquitecto, Developer, QA y Technical Writer están en línea.</p>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Terminal size={32} className="text-emerald-400" />
                    <span className="text-xl font-bold text-white">Ejecutando Tareas</span>
                  </div>
                  <p className="text-gray-400 text-sm">Generando código, actualizando documentación y preparando commits.</p>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                  <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-emerald-400 mb-2">¡Despegue Exitoso!</h2>
                  <p className="text-gray-300 text-sm">Tu máquina está trabajando autónomamente. Revisa los logs o GitHub para ver el progreso.</p>
                </motion.div>
              )}

              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-6">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  initial={{ width: "0%" }}
                  animate={{ width: `${(step / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}