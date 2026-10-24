import fs from "node:fs";
import path from "node:path";
import { log } from "./system-log";

const REPO_DIR = process.cwd();
const BRIEF_FILE = path.join(REPO_DIR, "config", "project-brief.json");

interface AnalysisResult {
  owner: string;
  repo: string;
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
}

export async function startAnalysisJob(owner: string, repo: string, token: string): Promise<string> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  analyzeRepository(owner, repo, token, jobId).catch((err) => {
    log("ERROR", "analysis", `Job ${jobId} falló: ${err.message}`);
  });
  
  return jobId;
}

async function analyzeRepository(owner: string, repo: string, token: string, jobId: string) {
  log("INFO", "analysis", `Iniciando análisis de ${owner}/${repo}...`);
  
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json"
  };

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) throw new Error(`Error obteniendo repo: ${repoRes.status}`);
    const repoData = await repoRes.json();

    const branchesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, { headers });
    const branches = branchesRes.ok ? await branchesRes.json() : [];
    const defaultBranch = repoData.default_branch || "main";

    const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents?ref=${defaultBranch}`, { headers });
    const contents = contentsRes.ok ? await contentsRes.json() : [];

    const stack = await detectStack(owner, repo, token, contents, defaultBranch);

    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
    const commits = commitsRes.ok ? await commitsRes.json() : [];
    
    let totalCommits = 0;
    try {
      const commitCountRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, { headers });
      if (commitCountRes.ok) {
        const allCommits = await commitCountRes.json();
        totalCommits = allCommits.length;
      }
    } catch {}

    const contribRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, { headers });
    const contributors = contribRes.ok ? (await contribRes.json()).length : 1;

    const hasReadme = contents.some((f: any) => 
      f.name.toLowerCase() === "readme.md" || f.name.toLowerCase() === "readme"
    );

    const result: AnalysisResult = {
      owner,
      repo,
      branch: defaultBranch,
      stack,
      status: {
        hasReadme,
        commits: totalCommits,
        lastCommit: commits[0]?.commit?.committer?.date || repoData.pushed_at || "",
        contributors
      },
      structure: {
        folders: contents.filter((f: any) => f.type === "dir").map((f: any) => f.name),
        keyFiles: contents.filter((f: any) => f.type === "file").map((f: any) => f.name)
      },
      analyzedAt: new Date().toISOString()
    };

    await saveBrief(result);
    log("INFO", "analysis", `✅ Análisis completado para ${owner}/${repo}`);
    return result;
  } catch (error: any) {
    log("ERROR", "analysis", `❌ Error en análisis: ${error.message}`);
    throw error;
  }
}

async function detectStack(owner: string, repo: string, token: string, contents: any[], branch: string): Promise<any> {
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" };
  const languages: { name: string; percentage: number }[] = [];
  const frameworks: string[] = [];
  const tools: string[] = [];
  const fileNames = contents.map((f: any) => f.name.toLowerCase());
  
  if (fileNames.includes("package.json")) {
    languages.push({ name: "JavaScript/TypeScript", percentage: 60 });
    try {
      const pkgRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${branch}`, { headers });
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        const pkgContent = Buffer.from(pkgData.content, "base64").toString("utf-8");
        const pkg = JSON.parse(pkgContent);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.next) frameworks.push("Next.js");
        if (deps.react) frameworks.push("React");
        if (deps.vue) frameworks.push("Vue.js");
        if (deps.express) frameworks.push("Express");
        if (deps.tailwindcss) frameworks.push("Tailwind CSS");
        if (deps.typescript) tools.push("TypeScript");
        if (deps.jest || deps.vitest) tools.push("Jest/Vitest");
        if (deps.prisma) tools.push("Prisma");
      }
    } catch {}
  }
  
  if (fileNames.includes("requirements.txt") || fileNames.includes("pyproject.toml")) {
    languages.push({ name: "Python", percentage: 40 });
    frameworks.push("Python");
  }
  
  if (fileNames.includes("dockerfile")) tools.push("Docker");
  if (fileNames.includes("docker-compose.yml") || fileNames.includes("docker-compose.yaml")) tools.push("Docker Compose");

  const total = languages.reduce((sum, l) => sum + l.percentage, 0) || 1;
  languages.forEach(l => l.percentage = Math.round((l.percentage / total) * 100));

  return {
    languages: languages.length > 0 ? languages : [{ name: "Desconocido", percentage: 100 }],
    frameworks: [...new Set(frameworks)],
    tools: [...new Set(tools)]
  };
}

async function saveBrief(result: AnalysisResult) {
  try {
    const dir = path.dirname(BRIEF_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const brief = {
      projectName: result.repo,
      owner: result.owner,
      repository: `${result.owner}/${result.repo}`,
      branch: result.branch,
      stack: result.stack,
      status: result.status,
      structure: result.structure,
      analyzedAt: result.analyzedAt,
      summary: `Proyecto ${result.repo} de ${result.owner}. Stack: ${result.stack.frameworks.join(", ") || "No detectado"}. ${result.status.commits} commits.`
    };
    
    fs.writeFileSync(BRIEF_FILE, JSON.stringify(brief, null, 2), "utf-8");
  } catch (error: any) {
    log("ERROR", "analysis", `Error guardando brief: ${error.message}`);
  }
}