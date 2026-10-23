import fs from "node:fs";
import path from "node:path";
import { log } from "../system-log";

export interface ProjectBrief {
  projectName: string; owner: string; repo: string; analyzedAt: string; gitSha: string | null;
  type: "new" | "existing" | "legacy" | "docs-only";
  stack: { languages: { name: string; percentage: number }[]; frameworks: string[]; tools: { build: string | null; test: string | null; ci: string | null; packageManager: string | null } };
  status: { commits: number; stars: number; forks: number; hasTests: boolean; coverage: number | null; hasReadme: boolean; hasCiCd: boolean; estimatedDebt: "low" | "medium" | "high" };
  analysis: { coverage: "full" | "partial"; filesScanned: number; apiRequests: number; durationMs: number; warnings: string[] };
  branch: string; decisionsPending: any[]; userDecisions: Record<string, string>;
}

const BRIEF_PATH = path.join(process.cwd(), "config", "project-brief.json");
export function saveBrief(brief: ProjectBrief) {
  const dir = path.dirname(BRIEF_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BRIEF_PATH, JSON.stringify(brief, null, 2), "utf-8");
  log("INFO", "brief", `Brief guardado en ${BRIEF_PATH}`);
}
export function loadBrief(): ProjectBrief | null {
  try { if (!fs.existsSync(BRIEF_PATH)) return null; return JSON.parse(fs.readFileSync(BRIEF_PATH, "utf-8")); } catch { return null; }
}
export function detectProjectType(meta: any): ProjectBrief["type"] {
  const commits = meta.totalCommits ?? 0;
  if (commits === 0) return "new";
  const lastCommit = meta.lastCommitDate ? new Date(meta.lastCommitDate) : null;
  if (!lastCommit) return "existing";
  const daysSince = (Date.now() - lastCommit.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 180) return "legacy";
  return "existing";
}