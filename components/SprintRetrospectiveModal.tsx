"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Target, Sparkles, Trophy, HelpCircle } from "lucide-react";

interface RetrospectiveData {
  whatWasAchieved?: string[];
  whatWentWell?: string[];
  whatWentWrong?: string[];
  whatNeedsDefinition?: string[];
  actionItems?: string[];
  generatedAt?: string;
  generatedBy?: string;
}

interface SprintRetrospectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  retrospective: RetrospectiveData | null;
  sprintNumber: number;
}

export default function SprintRetrospectiveModal({ 
  isOpen, 
  onClose, 
  retrospective, 
  sprintNumber 
}: SprintRetrospectiveModalProps) {
  if (!retrospective) return null;

  // ✅ PROTECCIÓN: Fallback a arrays vacíos si la IA no devolvió algún campo
  const achieved = retrospective.whatWasAchieved || [];
  const well = retrospective.whatWentWell || [];
  const wrong = retrospective.whatWentWrong || [];
  const needsDef = retrospective.whatNeedsDefinition || [];
  const actions = retrospective.actionItems || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 30 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-gray-900/95 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-b border-cyan-500/30 p-6 flex items-center justify-between backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <Sparkles size={28} className="text-cyan-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Retrospectiva Sprint #{sprintNumber}</h2>
                  <p className="text-[10px] text-gray-400">Generada por: {retrospective.generatedBy || "Product Owner Agent"}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ✅ QUÉ SE LOGRÓ */}
              <div className="bg-gradient-to-br from-emerald-950/30 to-green-950/30 border-2 border-emerald-500/50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={24} className="text-emerald-400" />
                  <h3 className="text-base font-bold text-emerald-400">🏆 Qué se logró en este sprint</h3>
                </div>
                <ul className="space-y-3">
                  {achieved.length > 0 ? achieved.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[12px] text-gray-200">
                      <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  )) : <li className="text-[12px] text-gray-400 italic">No hay datos registrados aún.</li>}
                </ul>
              </div>

              {/* ✅ QUÉ SALIÓ BIEN */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-emerald-400">✅ Qué salió bien</h3>
                </div>
                <ul className="space-y-2">
                  {well.length > 0 ? well.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  )) : <li className="text-[11px] text-gray-400 italic">No hay datos registrados aún.</li>}
                </ul>
              </div>

              {/* ⚠️ QUÉ SALIÓ MAL */}
              <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <h3 className="text-sm font-bold text-red-400">⚠️ Qué salió mal</h3>
                </div>
                <ul className="space-y-2">
                  {wrong.length > 0 ? wrong.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  )) : <li className="text-[11px] text-gray-400 italic">No hay datos registrados aún.</li>}
                </ul>
              </div>

              {/* ❓ QUÉ FALTA POR DEFINIR */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle size={20} className="text-amber-400" />
                  <h3 className="text-sm font-bold text-amber-400">❓ Qué falta por definir</h3>
                </div>
                <ul className="space-y-2">
                  {needsDef.length > 0 ? needsDef.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  )) : <li className="text-[11px] text-gray-400 italic">No hay datos registrados aún.</li>}
                </ul>
              </div>

              {/* 🎯 PLAN DE ACCIÓN */}
              <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={20} className="text-cyan-400" />
                  <h3 className="text-sm font-bold text-cyan-400">🎯 Plan de acción para el próximo sprint</h3>
                </div>
                <ul className="space-y-2">
                  {actions.length > 0 ? actions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-300">
                      <span className="text-cyan-400 font-bold mt-0.5">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  )) : <li className="text-[11px] text-gray-400 italic">No hay datos registrados aún.</li>}
                </ul>
              </div>

              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-[9px] text-gray-500">
                  Generada el {retrospective.generatedAt ? new Date(retrospective.generatedAt).toLocaleString("es-ES") : "Fecha desconocida"}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}