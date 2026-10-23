"use client";
import { useEffect, useRef, useState } from "react";

export interface AnalysisJobState {
  jobId: string | null; status: "idle" | "running" | "done" | "error";
  phase: string; progress: number; message: string; result: any | null; error: string | null;
}

export function useAnalysisJob(jobId: string | null) {
  const [state, setState] = useState<AnalysisJobState>({ jobId, status: "idle", phase: "", progress: 0, message: "", result: null, error: null });
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!jobId) return;
    async function poll() {
      try {
        const res = await fetch(`/api/project/analyze/${jobId}`);
        const data = await res.json();
        setState({ jobId, status: data.status, phase: data.phase, progress: data.progress, message: data.message, result: data.result, error: data.error });
        if (data.status === "done" || data.status === "error") clearInterval(timer.current);
      } catch {}
    }
    poll();
    timer.current = setInterval(poll, 1500);
    return () => clearInterval(timer.current);
  }, [jobId]);

  return state;
}