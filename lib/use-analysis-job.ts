"use client";
import { useState, useEffect } from "react";

export interface AnalysisResult {
  projectName: string;
  owner: string;
  repository: string;
  branch: string;
  stack: {
    languages: { name: string; percentage: number }[];
    frameworks: string[];
    tools: string[];
  };
  status: {
    hasReadme: boolean;
    commits: number;
    lastCommit: string;
    contributors: number;
  };
  structure: {
    folders: string[];
    keyFiles: string[];
  };
  analyzedAt: string;
  summary: string;
}

export function useAnalysisJob(jobId: string | null) {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setStatus("idle");
      return;
    }

    setStatus("pending");
    
    const interval = setInterval(async () => {
      try {
        // ✅ CORRECTO: Consultamos el endpoint de brief, NO el de analyze con jobId
        const res = await fetch("/api/project/brief");
        const data = await res.json();
        
        if (data.success && data.brief) {
          setResult(data.brief);
          setStatus("done");
          clearInterval(interval); // Detener el polling cuando tengamos los datos
        }
      } catch (err: any) {
        // Silenciamos el error y seguimos intentando hasta que el archivo exista
      }
    }, 2000); // Consultar cada 2 segundos

    // Timeout de seguridad después de 60 segundos
    const timeout = setTimeout(() => {
      setStatus("error");
      setError("El análisis tardó demasiado. Verifica tu conexión a GitHub.");
      clearInterval(interval);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [jobId]);

  return { status, result, error };
}