import { ghRest, ghGraphQL } from "./github";
import { updateJob } from "../jobs";
import { log } from "../system-log";

export interface AnalysisContext { owner: string; repo: string; token: string; branch?: string; }
export interface PhaseResult { phase: string; data: Record<string, any>; }
type ProgressFn = (phase: string, progress: number, message: string) => void;

function progress(jobId: string): ProgressFn {
  return (phase, prog, msg) => { 
    updateJob(jobId, { phase, progress: prog, message: msg }); 
    log("INFO", "analysis", `${phase} ${prog}% · ${msg}`, { jobId }); 
  };
}

export async function phaseAuth(ctx: AnalysisContext, jobId: string): Promise<PhaseResult> {
  const report = progress(jobId);
  report("auth", 2, "Validando token de GitHub");
  const user = await ghRest<{ login: string }>(ctx.token, "/user");
  const rate = await ghRest<{ resources: { core: { remaining: number } } }>(ctx.token, "/rate_limit");
  if (rate.resources.core.remaining < 50) throw new Error("Rate limit bajo. Espera un momento.");
  report("auth", 5, `Autenticado como ${user.login}`);
  return { phase: "auth", data: { login: user.login } };
}

export async function phaseMetadata(ctx: AnalysisContext, jobId: string): Promise<PhaseResult> {
  const report = progress(jobId);
  report("metadata", 8, "Obteniendo metadata del repo");
  const q = `query($owner:String!,$name:String!){ repository(owner:$owner,name:$name){ name description stargazerCount forkCount isPrivate primaryLanguage{name} defaultBranchRef{name target{...on Commit{oid history(first:1){totalCount} committedDate}}} pushedAt createdAt languages(first:10){totalSize edges{size node{name}}} } }`;
  const data = await ghGraphQL<{ repository: any }>(ctx.token, q, { owner: ctx.owner, name: ctx.repo });
  const r = data.repository;
  const totalLangSize = r.languages.totalSize || 1;
  const languages = r.languages.edges.map((e: any) => ({ name: e.node.name, bytes: e.size, percentage: Math.round((e.size / totalLangSize) * 1000) / 10 }));
  const result = { name: r.name, description: r.description ?? "", stars: r.stargazerCount, forks: r.forkCount, isPrivate: r.isPrivate, primaryLanguage: r.primaryLanguage?.name ?? null, defaultBranch: r.defaultBranchRef?.name ?? "main", lastCommitSha: r.defaultBranchRef?.target?.oid ?? null, totalCommits: r.defaultBranchRef?.target?.history?.totalCount ?? 0, lastCommitDate: r.defaultBranchRef?.target?.committedDate ?? null, pushedAt: r.pushedAt, createdAt: r.createdAt, languages };
  report("metadata", 15, `★${result.stars} · ${result.totalCommits} commits`);
  return { phase: "metadata", data: result };
}

export async function phaseTree(ctx: AnalysisContext, jobId: string, meta: any): Promise<PhaseResult> {
  const report = progress(jobId);
  report("tree", 18, "Leyendo árbol del repo");
  const branch = ctx.branch ?? meta.defaultBranch;
  const tree = await ghRest<{ tree: any[]; truncated: boolean }>(ctx.token, `/repos/${ctx.owner}/${ctx.repo}/git/trees/${branch}?recursive=1`);
  const files = tree.tree.filter((n) => n.type === "blob");
  const dirs = tree.tree.filter((n) => n.type === "tree");
  const byExt: Record<string, number> = {};
  for (const f of files) { const ext = (f.path.split(".").pop() ?? "").toLowerCase(); byExt[ext] = (byExt[ext] ?? 0) + 1; }
  const topFolders = Array.from(new Set(files.map((f) => f.path.split("/")[0]))).slice(0, 30);
  const result = { totalFiles: files.length, totalDirs: dirs.length, truncated: tree.truncated, byExtension: byExt, topFolders, branch };
  report("tree", 40, `${result.totalFiles} archivos`);
  return { phase: "tree", data: result };
}

export async function phaseFiles(ctx: AnalysisContext, jobId: string, tree: any): Promise<PhaseResult> {
  const report = progress(jobId);
  report("files", 42, "Leyendo archivos clave");
  
  const candidates = [
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "tsconfig.json", "next.config.js", "next.config.ts", "next.config.mjs",
    "vite.config.ts", "vite.config.js", "webpack.config.js",
    "tailwind.config.js", "tailwind.config.ts", "postcss.config.js",
    ".eslintrc.json", ".eslintrc.js", ".prettierrc",
    "README.md", "readme.md", "CONTRIBUTING.md",
    "requirements.txt", "Pipfile", "pyproject.toml",
    "Cargo.toml", "go.mod", "pom.xml", "build.gradle",
    "docker-compose.yml", "docker-compose.yaml", "Dockerfile",
    ".github/workflows/ci.yml", ".github/workflows/main.yml",
    ".github/workflows/build.yml", ".github/workflows/test.yml",
    "jest.config.js", "jest.config.ts", "vitest.config.ts",
  ];

  const toFetch = candidates.slice(0, 40);
  const results: Record<string, string | null> = {};
  let done = 0;
  const queue = [...toFetch];

  async function worker() {
    while (queue.length) {
      const p = queue.shift()!;
      try {
        // ✅ FIX: Agregado AbortSignal.timeout(10000) para evitar que se congele indefinidamente
        const raw = await ghRest<{ content: string; encoding: string }>(
          ctx.token,
          `/repos/${ctx.owner}/${ctx.repo}/contents/${p}?ref=${tree.branch}`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (raw && raw.encoding === "base64") {
          results[p] = Buffer.from(raw.content, "base64").toString("utf-8");
        } else {
          results[p] = raw ? String(raw.content || raw) : null;
        }
      } catch {
        results[p] = null; // Si falla o se agota el tiempo, simplemente lo marca como null y sigue
      }
      done++;
      const pct = 42 + Math.round((done / toFetch.length) * 18);
      report("files", pct, `Leyendo ${p} (${done}/${toFetch.length})`);
      await new Promise((r) => setTimeout(r, 100)); // Pausa breve para no saturar la API
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => worker()));
  report("files", 60, `${Object.values(results).filter(Boolean).length} archivos leídos exitosamente`);
  return { phase: "files", data: { files: results, fetched: toFetch } };
}

export async function phaseFrameworks(jobId: string, files: Record<string, string | null>): Promise<PhaseResult> {
  const report = progress(jobId);
  report("frameworks", 62, "Detectando frameworks y herramientas..."); // ✅ FIX: Reporte inmediato
  
  const frameworks = new Set<string>();
  const tools: Record<string, string | null> = { build: null, test: null, ci: null, packageManager: null };
  const pkg = files["package.json"];
  
  if (pkg) {
    try {
      const p = JSON.parse(pkg);
      const deps = { ...(p.dependencies ?? {}), ...(p.devDependencies ?? {}) };
      if (deps["next"]) { frameworks.add(`Next.js ${deps["next"]}`); tools.build = "Next.js"; }
      if (deps["react"]) frameworks.add(`React ${deps["react"]}`);
      if (deps["typescript"]) frameworks.add("TypeScript");
      if (deps["tailwindcss"]) frameworks.add("Tailwind CSS");
      if (deps["jest"] || deps["@jest/core"]) tools.test = "Jest";
      if (deps["vitest"]) tools.test = "Vitest";
      if (files["pnpm-lock.yaml"]) tools.packageManager = "pnpm";
      else if (files["yarn.lock"]) tools.packageManager = "yarn";
      else if (files["package-lock.json"]) tools.packageManager = "npm";
    } catch { /* Ignorar errores de parseo */ }
  }
  
  if (files["requirements.txt"] || files["pyproject.toml"]) frameworks.add("Python");
  if (Object.keys(files).some((k) => k.startsWith(".github/workflows/"))) tools.ci = "GitHub Actions";
  if (files["Dockerfile"] || files["docker-compose.yml"]) frameworks.add("Docker");
  
  report("frameworks", 75, `${frameworks.size} frameworks detectados`);
  return { phase: "frameworks", data: { frameworks: Array.from(frameworks), tools } };
}

export async function phaseQuality(jobId: string, tree: any, files: Record<string, string | null>): Promise<PhaseResult> {
  const report = progress(jobId);
  report("quality", 77, "Evaluando calidad y deuda técnica..."); // ✅ FIX: Reporte inmediato
  
  const allPaths = Object.keys(files);
  const hasReadme = allPaths.some((p) => /^readme\.md$/i.test(p));
  const hasCiCd = allPaths.some((p) => p.startsWith(".github/workflows/"));
  const hasTests = allPaths.some((p) => ["__tests__", ".test.", ".spec.", "tests/"].some((t) => p.toLowerCase().includes(t)));
  const hasLint = allPaths.some((p) => [".eslintrc", ".prettierrc"].some((t) => p.toLowerCase().includes(t)));
  
  let estimatedDebt: "low" | "medium" | "high" = "low";
  const riskFactors = [!hasTests, !hasLint, !hasCiCd, !hasReadme].filter(Boolean).length;
  if (riskFactors >= 3) estimatedDebt = "high";
  else if (riskFactors >= 1) estimatedDebt = "medium";
  
  report("quality", 85, `Deuda estimada: ${estimatedDebt}`);
  return { phase: "quality", data: { hasReadme, hasCiCd, hasTests, hasLint, estimatedDebt, coverage: null } };
}