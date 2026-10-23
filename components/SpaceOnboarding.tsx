"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Float, MeshDistortMaterial, Sphere, Html } from "@react-three/drei";

interface SpaceOnboardingProps {
  onComplete: () => void;
}

// Componente 3D: El Núcleo de la Nave Nodriza
function MothershipCore() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#06b6d4" // Cyan GRTEC
          attach="material"
          distort={0.4} // Efecto de energía líquida
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe={true} // Estilo futurista de malla
        />
      </Sphere>
      {/* Núcleo interno brillante */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial color="#3b82f6" emissive="#06b6d4" emissiveIntensity={2} />
      </Sphere>
    </Float>
  );
}

export default function SpaceOnboarding({ onComplete }: SpaceOnboardingProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Capa 3D de fondo */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />
          
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <MothershipCore />
          </Suspense>
        </Canvas>
      </div>

      {/* Capa de Interfaz de Usuario (UI) sobre el 3D */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center space-y-6 p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-cyan-500/30 pointer-events-auto max-w-2xl">
          
          {/* Título Animado */}
          <div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tighter">
              SISTEMA NODRIZA
            </h1>
            <p className="text-cyan-200/80 mt-4 text-lg md:text-xl font-light">
              Has accedido al núcleo de <span className="font-bold text-white">GRTEC</span>.
            </p>
          </div>

          {/* Mensaje de Configuración */}
          <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-700/50">
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Para iniciar la fábrica de software, <br/>
              <span className="text-cyan-400 font-bold">debes configurar las Naves Nodrizas</span> <br/>
              que trabajarán en tus proyectos.
            </p>
          </div>

          {/* Botón Interactivo */}
          <button
            onClick={onComplete}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
              mt-8 px-10 py-4 rounded-full font-bold text-lg tracking-widest uppercase transition-all duration-300
              ${isHovering 
                ? "bg-cyan-500 text-black shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-105" 
                : "bg-transparent text-cyan-400 border-2 border-cyan-500 hover:bg-cyan-500/10"
              }
            `}
          >
            {isHovering ? "🚀 INICIAR SECUENCIA" : "CONFIGURAR NAVES"}
          </button>
        </div>
      </div>
    </div>
  );
}