"use client";
import dynamic from "next/dynamic";

const AgentsScene3D = dynamic(() => import("./AgentsScene3D"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-black flex items-center justify-center"><div className="text-cyan-400 animate-pulse">Cargando escena 3D...</div></div>,
});

export interface FlightTelemetry {
  repo: { owner: string; name: string } | null;
  stars: number | null;
  commits: number | null;
  sprint: { number: number | null; source: "history" | "trello" | "default" };
  status: "config" | "ready" | "building" | "testing" | "deployed";
  progress: number;
  lastActivity: string | null;
}

interface Props {
  onComplete: () => void;
  showUI?: boolean;
  configuredModules?: string[];
  projectStatus?: "config" | "ready" | "building" | "testing" | "deployed";
  commitsCount?: number;
  moduleStates?: Record<string, "normal" | "error" | "working" | "done">;
  lastWorkTimes?: Record<string, string>;
  taskCounts?: Record<string, number>;
  telemetry?: FlightTelemetry;
  sprintState?: any;
}

export default function AgentsScene3DWrapper(props: Props) {
  return <AgentsScene3D {...props} />;
}