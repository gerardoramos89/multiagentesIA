import fs from "node:fs";
import path from "node:path";

export type JobStatus = "pending" | "running" | "done" | "error";

export interface Job<T = any> {
  id: string;
  kind: string;
  status: JobStatus;
  phase: string;
  progress: number;
  message: string;
  result?: T;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

const JOBS_DIR = path.join(process.cwd(), ".jobs");

function ensureDir() {
  if (!fs.existsSync(JOBS_DIR)) {
    fs.mkdirSync(JOBS_DIR, { recursive: true });
  }
}

function jobPath(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

export function createJob<T>(kind: string): Job<T> {
  ensureDir();
  const id = `job_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const job: Job<T> = {
    id,
    kind,
    status: "pending",
    phase: "queued",
    progress: 0,
    message: "En cola",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const filePath = jobPath(id);
  fs.writeFileSync(filePath, JSON.stringify(job, null, 2), "utf-8");
  
  // ✅ LOG TEMPORAL: Confirma que el archivo se creó
  console.log(`[JOBS] Job creado: ${id} → ${filePath}`);
  console.log(`[JOBS] Archivo existe: ${fs.existsSync(filePath)}`);
  
  return job;
}

export function getJob<T = any>(id: string): Job<T> | undefined {
  try {
    const filePath = jobPath(id);
    if (!fs.existsSync(filePath)) return undefined;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as Job<T>;
  } catch {
    return undefined;
  }
}

export function updateJob<T>(id: string, patch: Partial<Omit<Job<T>, "id" | "createdAt">>) {
  const job = getJob<T>(id);
  if (!job) return;
  Object.assign(job, patch, { updatedAt: Date.now() });
  try {
    fs.writeFileSync(jobPath(id), JSON.stringify(job, null, 2), "utf-8");
  } catch (e) {
    console.error("Error guardando job:", e);
  }
}

// Limpieza: borra jobs viejos (>1h)
setInterval(() => {
  try {
    ensureDir();
    const cutoff = Date.now() - 60 * 60 * 1000;
    const files = fs.readdirSync(JOBS_DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const filePath = path.join(JOBS_DIR, file);
      try {
        const data = fs.readFileSync(filePath, "utf-8");
        const job = JSON.parse(data);
        if (job.createdAt < cutoff) {
          fs.unlinkSync(filePath);
        }
      } catch {}
    }
  } catch {}
}, 5 * 60 * 1000);