"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface VaultScreenProps {
  onUnlock: () => void;
}

const CORRECT_PIN = "8429";

export default function VaultScreen({ onUnlock }: VaultScreenProps) {
  const [pin, setPin] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = [...pin, num];
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin.join("") === CORRECT_PIN) {
          setTimeout(onUnlock, 500);
        } else {
          setError(true);
          setTimeout(() => { 
            setPin([]); 
            setError(false); 
          }, 800);
        }
      }
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-4">
      <motion.div 
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        className="text-center mb-8"
      >
        <h2 className="text-xl md:text-2xl font-mono text-cyan-400 mb-2">
          PROTOCOLO DE SEGURIDAD NIVEL 4  -  8429
        </h2>
        <p className="text-gray-400 text-sm md:text-base max-w-md">
          Para entrar a la fábrica de software de GRTEC debes ingresar el código válido...
        </p>
      </motion.div>

      {/* Indicadores */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            animate={{ 
              scale: pin[i] ? 1.2 : 1, 
              backgroundColor: pin[i] ? '#06b6d4' : '#374151' 
            }}
            className="w-4 h-4 rounded-full" 
          />
        ))}
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-3 gap-4 w-64">
        {["1","2","3","4","5","6","7","8","9","C","0","✓"].map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === "C") setPin([]);
              else if (key === "✓") {
                if (pin.length === 4) handlePress(pin[pin.length - 1]);
              }
              else handlePress(key);
            }}
            className={`h-16 rounded-xl font-bold text-xl transition-all active:scale-95 ${
              key === "✓" ? "bg-cyan-600 text-white" : 
              key === "C" ? "bg-red-900/50 text-red-400" : 
              "bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}