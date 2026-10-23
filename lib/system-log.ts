import fs from "node:fs";
import path from "node:path";

export type LogLevel = "INFO" | "WARN" | "ERROR" | "AGENT" | "SPRINT" | "SURVEY";
export interface LogEntry { ts: string; level: LogLevel; source: string; message: string; meta?: Record<string, any>; }

const LOG_FILE = path.join(process.cwd(), "logs", "system.jsonl");
const MAX_BUFFER = 500;
const buffer: LogEntry[] = [];

function ensureDir() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function log(level: LogLevel, source: string, message: string, meta?: Record<string, any>) {
  const entry: LogEntry = { ts: new Date().toISOString(), level, source, message, meta };
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  try { ensureDir(); fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n"); } catch {}
}

export function getRecentLogs(n = 50): LogEntry[] { return buffer.slice(-n); }
export function readLogsFromFile(n = 200): LogEntry[] {
  try {
    ensureDir();
    if (!fs.existsSync(LOG_FILE)) return [];
    return fs.readFileSync(LOG_FILE, "utf-8").split("\n").filter(Boolean).slice(-n).map((l) => JSON.parse(l));
  } catch { return []; }
}