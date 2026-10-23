"use client";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import Node3D from "./Node3D"; // Tu componente Node3D

export default function Scene3D() {
  return (
    <div className="h-screen w-screen">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        {/* Luces */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Fondo de estrellas */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Aquí van tus Nodos 3D - DENTRO del Canvas */}
        <Node3D 
          position={[-3, 2, 0]} 
          isActive={true} 
          title="Product Owner" 
          description="Lee Trello y define tareas" 
        />
        <Node3D 
          position={[0, 2, 0]} 
          isActive={false} 
          title="Arquitecto" 
          description="Diseña la solución" 
        />
        <Node3D 
          position={[3, 2, 0]} 
          isActive={false} 
          title="Developer" 
          description="Escribe el código" 
        />
        
        {/* Controles de cámara */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}