"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";

interface AutoCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintNumber: number;
}

export default function AutoCloseModal({ isOpen, onClose, sprintNumber }: AutoCloseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-gradient-to-br from-emerald-950/90 to-cyan-950/90 border-2 border-emerald-400/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-pulse" />
            
            <div className="relative z-10 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              >
                <CheckCircle2 size={72} className="text-emerald-400 mx-auto mb-4" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">
                🎉 ¡Sprint #{sprintNumber} Completado!
              </h2>
              <p className="text-emerald-300 text-sm mb-4">
                Todas las encuestas fueron respondidas exitosamente
              </p>
              
              <div className="bg-black/40 border border-emerald-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Sparkles size={16} />
                  <span className="text-[11px] font-bold">El sprint ha sido archivado en el historial</span>
                  <Sparkles size={16} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  La retrospectiva y las lecciones aprendidas están disponibles para el próximo sprint
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-lg hover:from-emerald-500 hover:to-cyan-500 transition-all"
              >
                Continuar →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}