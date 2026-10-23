import { log } from "./system-log";
import { sendTelegram, tg } from "./telegram";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface SprintTask {
  id: string;
  title: string;
  description: string;
  agent: "po" | "arch" | "dev" | "qa" | "doc";
  status: "pending" | "working" | "done" | "blocked";
  startedAt?: string;
  completedAt?: string;
  output?: string;
  commits?: string[];
  filesModified?: string[];
}

export interface SprintState {
  sprintNumber: number;
  startedAt: string;
  approvedBy: "human";
  tasks: SprintTask[];
  status: "planned" | "executing" | "completed";
}

const SPRINT_FILE = path.join(process.cwd(), "config", "sprint-active.json");
const REPO_DIR = process.cwd();
const AIDER_PATH = process.env.AIDER_PATH || "C:/Users/GERARD/Documents/Proyectos/fabric-agents-grtec/venv-aider/Scripts/aider.exe";

export function loadSprint(): SprintState | null {
  try {
    if (!fs.existsSync(SPRINT_FILE)) return null;
    return JSON.parse(fs.readFileSync(SPRINT_FILE, "utf-8"));
  } catch { return null; }
}

export function saveSprint(sprint: SprintState) {
  try {
    const dir = path.dirname(SPRINT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SPRINT_FILE, JSON.stringify(sprint, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando sprint:", e); }
}

export function getCurrentAgentTasks(): Record<string, SprintTask | null> {
  const sprint = loadSprint();
  if (!sprint) return { po: null, arch: null, dev: null, qa: null, doc: null };
  const result: Record<string, SprintTask | null> = { po: null, arch: null, dev: null, qa: null, doc: null };
  for (const task of sprint.tasks) {
    if (task.status === "working") result[task.agent] = task;
  }
  return result;
}

export function getNextAgentTasks(): Record<string, SprintTask | null> {
  const sprint = loadSprint();
  if (!sprint) return { po: null, arch: null, dev: null, qa: null, doc: null };
  const result: Record<string, SprintTask | null> = { po: null, arch: null, dev: null, qa: null, doc: null };
  for (const task of sprint.tasks) {
    if (task.status === "pending" && !result[task.agent]) result[task.agent] = task;
  }
  return result;
}

async function prepareRepository(): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync(`git config user.email "agent@fabricagents.ai"`, { cwd: REPO_DIR });
    await execAsync(`git config user.name "Fabric Agent"`, { cwd: REPO_DIR });
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (statusOutput.trim()) {
      await execAsync(`git add .`, { cwd: REPO_DIR });
      await execAsync(`git commit -m "🎯 Estado inicial antes del Sprint\n\nAuto-committed by FabricAgents"`, { cwd: REPO_DIR });
    }
    return { success: true, message: "Repositorio preparado" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ✅ FUNCIÓN PRINCIPAL CON FALLBACK
async function executeAgentTask(task: SprintTask): Promise<{ success: boolean; output: string; filesModified?: string[] }> {
  // 1. Intentar con Aider
  try {
    log("AGENT", task.agent, `Intentando con Aider...`);
    const promptFile = path.join(REPO_DIR, ".aider-prompt.txt");
    fs.writeFileSync(promptFile, buildAiderPrompt(task), "utf-8");
    
    // Comando simplificado y más compatible con Windows
    const command = `"${AIDER_PATH}" --model ollama/deepseek-coder-v2:16b --message-file "${promptFile}" --yes --no-auto-commits`;
    
    const { stdout } = await execAsync(command, { 
      cwd: REPO_DIR, timeout: 180000, maxBuffer: 1024 * 1024 * 50, env: { ...process.env }
    });
    
    if (fs.existsSync(promptFile)) fs.unlinkSync(promptFile);
    return { success: true, output: stdout || "Aider completó exitosamente" };
  } catch (aiderError: any) {
    log("WARN", task.agent, `Aider falló: ${aiderError.message}. Activando modo de generación directa con Ollama...`);
    if (fs.existsSync(path.join(REPO_DIR, ".aider-prompt.txt"))) {
      fs.unlinkSync(path.join(REPO_DIR, ".aider-prompt.txt"));
    }
    
    // 2. FALLBACK: Generación directa con Ollama
    return await fallbackToOllama(task);
  }
}

// ✅ FALLBACK: LLAMADA DIRECTA A OLLAMA
async function fallbackToOllama(task: SprintTask): Promise<{ success: boolean; output: string; filesModified?: string[] }> {
  try {
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const prompt = buildAiderPrompt(task) + "\n\nIMPORTANTE: Responde SOLO con el contenido del archivo. En la primera línea pon 'ARCHIVO: nombre_del_archivo.ext' y luego el código.";
    
    log("AGENT", task.agent, `Generando código directamente con Ollama (${model})...`);
    
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.2, num_predict: 2000 } })
    });
    
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    const data = await response.json();
    const generatedText = data.response;
    
    // Parsear nombre del archivo y contenido
    const lines = generatedText.split('\n');
    let fileName = `agent_generated_${task.agent}_${Date.now()}.md`;
    let content = generatedText;
    
    const fileMatch = lines[0].match(/ARCHIVO:\s*(.+)/i) || lines[0].match(/FILE:\s*(.+)/i);
    if (fileMatch) {
      fileName = fileMatch[1].trim().replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitizar nombre
      content = lines.slice(1).join('\n').trim();
    } else {
      const codeBlockMatch = generatedText.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) content = codeBlockMatch[1].trim();
    }
    
    // Escribir el archivo
    const filePath = path.join(REPO_DIR, fileName);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    
    log("INFO", task.agent, `✅ Archivo generado directamente: ${fileName}`);
    return { success: true, output: `Generado por Ollama: ${fileName}`, filesModified: [fileName] };
  } catch (error: any) {
    log("ERROR", task.agent, `Fallback a Ollama también falló: ${error.message}`);
    return { success: false, output: error.message };
  }
}

function buildAiderPrompt(task: SprintTask): string {
  return `Tarea: ${task.title}\nDescripción: ${task.description}\n\nPor favor, implementa esta tarea siguiendo las mejores prácticas. Si es documentación, crea o actualiza el README.md. Si son tests, crea un archivo de prueba.`;
}

async function commitAndPush(task: SprintTask): Promise<{ success: boolean; commitHash?: string }> {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    if (!githubToken || !githubOwner || !githubRepo) throw new Error("Faltan credenciales de GitHub");

    const { stdout: branchOutput } = await execAsync(`git branch --show-current`, { cwd: REPO_DIR });
    const currentBranch = branchOutput.trim() || "master";

    await execAsync(`git add .`, { cwd: REPO_DIR });
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (!statusOutput.trim()) return { success: true };

    const commitMessage = `✨ [${task.agent.toUpperCase()}] ${task.title.replace(/\[.*?\]\s*/, '')}\n\nSprint #1 - Tarea: ${task.id}`;
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: REPO_DIR });
    
    const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
    const commitHash = hashOutput.trim();
    
    const remoteUrl = `https://${githubToken}@github.com/${githubOwner}/${githubRepo}.git`;
    await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: REPO_DIR });
    await execAsync(`git push origin ${currentBranch}`, { cwd: REPO_DIR });
    
    log("AGENT", task.agent, `✅ Commit y push exitoso: ${commitHash.substring(0, 7)}`);
    return { success: true, commitHash };
  } catch (error: any) {
    log("ERROR", task.agent, `Error en commit/push: ${error.message}`);
    return { success: false };
  }
}

export async function startSprintExecution(): Promise<{ success: boolean; message: string }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false, message: "No hay sprint planificado" };
  if (sprint.status === "executing") return { success: false, message: "El sprint ya está en ejecución" };

  const prepResult = await prepareRepository();
  if (!prepResult.success) return { success: false, message: `Error preparando repo: ${prepResult.message}` };

  log("INFO", "executor", `Resetando ${sprint.tasks.length} tareas a "pending"...`);
  for (const task of sprint.tasks) {
    task.status = "pending";
    task.startedAt = undefined; task.completedAt = undefined;
    task.output = undefined; task.commits = undefined; task.filesModified = undefined;
  }
  
  sprint.status = "executing";
  saveSprint(sprint);

  log("SPRINT", "system", `🚀 Sprint #${sprint.sprintNumber} iniciado. ${sprint.tasks.length} tareas en cola.`);
  await sendTelegram(`🚀 ${tg.b("Sprint #" + sprint.sprintNumber + " INICIADO")}\n${sprint.tasks.length} tareas en ejecución.`);

  executeTasksSequentially(sprint).catch((e) => log("ERROR", "executor", `Error en ejecución: ${e?.message}`));
  return { success: true, message: "Sprint iniciado" };
}

async function executeTasksSequentially(sprint: SprintState) {
  const pendingTasks = sprint.tasks.filter((t) => t.status === "pending");
  log("INFO", "executor", `Tareas pendientes encontradas: ${pendingTasks.length}`);
  
  if (pendingTasks.length === 0) {
    sprint.status = "completed"; saveSprint(sprint); return;
  }

  for (const task of pendingTasks) {
    task.status = "working";
    task.startedAt = new Date().toISOString();
    saveSprint(sprint);

    const agentName = task.agent === "po" ? "Product Owner" : task.agent === "arch" ? "Arquitecto" : task.agent === "dev" ? "Developer" : task.agent === "qa" ? "QA Engineer" : "Technical Writer";
    log("AGENT", task.agent, `${agentName} empezó: ${task.title}`);
    await sendTelegram(`⚙️ ${tg.b(agentName)} empezó:\n${tg.i(task.title)}`);

    const startTime = Date.now();
    const result = await executeAgentTask(task);
    
    if (!result.success) {
      task.status = "blocked";
      task.output = `Error: ${result.output}`;
      saveSprint(sprint);
      log("ERROR", task.agent, `Tarea bloqueada: ${task.title}`);
      continue;
    }

    const commitResult = await commitAndPush(task);
    if (commitResult.success && commitResult.commitHash) task.commits = [commitResult.commitHash];
    if (result.filesModified) task.filesModified = result.filesModified;

    task.status = "done";
    task.completedAt = new Date().toISOString();
    task.output = result.output;
    saveSprint(sprint);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("AGENT", task.agent, `${agentName} completó: ${task.title} en ${duration}s`);
    await sendTelegram(`✅ ${tg.b(agentName)} completó:\n${tg.i(task.title)}\n⏱️ ${duration}s${commitResult.commitHash ? `\n🔗 Commit: ${commitResult.commitHash.substring(0, 7)}` : ""}`);
    
    await new Promise((r) => setTimeout(r, 2000));
  }

  sprint.status = "completed";
  saveSprint(sprint);
  log("SPRINT", "system", `🎉 Sprint #${sprint.sprintNumber} COMPLETADO`);
  await sendTelegram(`🎉 ${tg.b("SPRINT #" + sprint.sprintNumber + " COMPLETADO")}`);
}