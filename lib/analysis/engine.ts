import { createJob, updateJob, getJob } from "../jobs";
import { log } from "../system-log";
import { notifyAnalysisDone, notifyAnalysisProgress, notifyAnalysisStart, notifyError } from "../telegram";
import { phaseAuth, phaseMetadata, phaseTree, phaseFiles, phaseFrameworks, phaseQuality } from "./phases";
import { detectProjectType, saveBrief, type ProjectBrief } from "./brief";

export interface AnalyzeInput { owner: string; repo: string; token: string; branch?: string; force?: boolean; }

export async function startAnalysisJob(input: AnalyzeInput) {
  const job = createJob<ProjectBrief>("project-analyze");
  const startedAt = Date.now();
  const repoLabel = `${input.owner}/${input.repo}`;
  log("INFO", "analysis", `Job iniciado: ${job.id} para ${repoLabel}`);
  notifyAnalysisStart(repoLabel);

  runAnalysis(job.id, input, startedAt, repoLabel).catch((e) => {
    log("ERROR", "analysis", `Job ${job.id} falló: ${e?.message}`);
    updateJob(job.id, { status: "error", progress: 0, phase: "error", message: e?.message ?? "Error desconocido", error: e?.message });
    notifyError(`Análisis ${repoLabel}`, e?.message ?? "desconocido");
  });
  return { jobId: job.id };
}

async function runAnalysis(jobId: string, input: AnalyzeInput, startedAt: number, repoLabel: string) {
  updateJob(jobId, { status: "running", phase: "auth", progress: 0, message: "Iniciando" });
  const ctx = { owner: input.owner, repo: input.repo, token: input.token, branch: input.branch };

  const auth = await phaseAuth(ctx, jobId);
  const meta = await phaseMetadata(ctx, jobId);
  const tree = await phaseTree(ctx, jobId, meta.data);
  const files = await phaseFiles(ctx, jobId, tree.data);
  const fw = await phaseFrameworks(jobId, files.data.files);
  const quality = await phaseQuality(jobId, tree.data, files.data.files);

  updateJob(jobId, { phase: "decisions", progress: 86, message: "Identificando decisiones pendientes" });
  const decisionsPending = buildDecisionsPending(meta.data, fw.data, tree.data);

  updateJob(jobId, { phase: "brief", progress: 93, message: "Generando brief del proyecto" });
  const brief: ProjectBrief = {
    projectName: meta.data.name, owner: input.owner, repo: input.repo, analyzedAt: new Date().toISOString(),
    gitSha: meta.data.lastCommitSha, type: detectProjectType(meta.data),
    stack: { languages: meta.data.languages.map((l: any) => ({ name: l.name, percentage: l.percentage })), frameworks: fw.data.frameworks, tools: fw.data.tools },
    status: { commits: meta.data.totalCommits, stars: meta.data.stars, forks: meta.data.forks, hasTests: quality.data.hasTests, coverage: quality.data.coverage, hasReadme: quality.data.hasReadme, hasCiCd: quality.data.hasCiCd, estimatedDebt: quality.data.estimatedDebt },
    analysis: { coverage: tree.data.truncated ? "partial" : "full", filesScanned: Object.keys(files.data.files).length, apiRequests: 0, durationMs: Date.now() - startedAt, warnings: tree.data.truncated ? ["Árbol truncado por GitHub: análisis parcial"] : [] },
    branch: tree.data.branch, decisionsPending, userDecisions: {},
  };
  saveBrief(brief);

  updateJob(jobId, { status: "done", phase: "done", progress: 100, message: "Análisis completado", result: brief });
  log("INFO", "analysis", `Job ${jobId} completado en ${Date.now() - startedAt}ms`);
  notifyAnalysisDone(repoLabel, "config/project-brief.json");
}

function buildDecisionsPending(meta: any, fw: any, tree: any) {
  const decisions: any[] = [];
  if ((meta.totalCommits ?? 0) <= 1) decisions.push({ id: "target_stack", question: "¿Qué stack objetivo quieres?", options: ["Next.js + TS + Tailwind", "React + Vite + TS", "Otro"], blocking: true, reason: "Define la estructura base." });
  if (!fw.tools.ci) decisions.push({ id: "cicd", question: "¿Qué sistema de CI/CD quieres?", options: ["GitHub Actions", "No necesito CI aún"], blocking: false, reason: "Afecta configuración inicial." });
  return decisions;
}

export function getAnalysisJob(jobId: string) { return getJob<ProjectBrief>(jobId); }