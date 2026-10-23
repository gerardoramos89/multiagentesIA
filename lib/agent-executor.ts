import { log } from "./system-log";
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

export interface SprintRetrospective {
  whatWentWell: string[];
  whatWentWrong: string[];
  actionItems: string[];
  generatedAt: string;
  generatedBy: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: "multiple" | "open";
  options?: string[];
  answer?: string;
  trelloCardId?: string;
}

export interface SprintState {
  sprintNumber: number;
  startedAt: string;
  completedAt?: string;
  approvedBy: "human";
  tasks: SprintTask[];
  status: "planned" | "executing" | "review" | "retrospective" | "survey" | "completed";
  retrospective?: SprintRetrospective;
  vision?: any;
  projectContext?: string;
  surveys?: SurveyQuestion[];
  lessonsLearned?: string[];
  filesChanged?: string[];
}

export interface SprintHistoryEntry {
  sprintNumber: number;
  startedAt: string;
  completedAt: string;
  tasks: SprintTask[];
  retrospective?: SprintRetrospective;
  vision?: any;
  lessonsLearned?: string[];
  filesChanged?: string[];
}

export interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
}

export interface ChangeMemory {
  totalCommits: number;
  lastCommitHash?: string;
  filesEverChanged: string[];
  sprintsCompleted: number;
}

const SPRINT_FILE = path.join(process.cwd(), "config", "sprint-active.json");
const SPRINT_HISTORY_FILE = path.join(process.cwd(), "config", "sprints-history.json");
const AGENT_LOGS_FILE = path.join(process.cwd(), "config", "agent-logs.json");
const CHANGE_MEMORY_FILE = path.join(process.cwd(), "config", "change-memory.json");
const REPO_DIR = process.cwd();

// ✅ GESTIÓN DE MEMORIA DE CAMBIOS
export function loadChangeMemory(): ChangeMemory {
  try {
    if (!fs.existsSync(CHANGE_MEMORY_FILE)) {
      return { totalCommits: 0, filesEverChanged: [], sprintsCompleted: 0 };
    }
    return JSON.parse(fs.readFileSync(CHANGE_MEMORY_FILE, "utf-8"));
  } catch {
    return { totalCommits: 0, filesEverChanged: [], sprintsCompleted: 0 };
  }
}

export function saveChangeMemory(memory: ChangeMemory) {
  try {
    const dir = path.dirname(CHANGE_MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHANGE_MEMORY_FILE, JSON.stringify(memory, null, 2), "utf-8");
  } catch (e) {
    console.error("[EXECUTOR] Error guardando memoria de cambios:", e);
  }
}

export function getTotalCommits(): number {
  const memory = loadChangeMemory();
  return memory.totalCommits;
}

// ✅ GESTIÓN DE LOGS DE AGENTES
export function addAgentLog(agent: string, message: string, level: AgentLog["level"] = "info") {
  try {
    let logs: AgentLog[] = [];
    if (fs.existsSync(AGENT_LOGS_FILE)) {
      logs = JSON.parse(fs.readFileSync(AGENT_LOGS_FILE, "utf-8"));
    }
    
    logs.push({
      agent,
      message,
      timestamp: new Date().toISOString(),
      level
    });
    
    if (logs.length > 15) {
      logs = logs.slice(-15);
    }
    
    fs.writeFileSync(AGENT_LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) {
    console.error("[EXECUTOR] Error guardando log de agente:", e);
  }
}

export function getAgentLogs(): Record<string, AgentLog[]> {
  try {
    if (!fs.existsSync(AGENT_LOGS_FILE)) return {};
    const logs: AgentLog[] = JSON.parse(fs.readFileSync(AGENT_LOGS_FILE, "utf-8"));
    
    const grouped: Record<string, AgentLog[]> = {};
    for (const agent of ["po", "arch", "dev", "qa", "doc"]) {
      grouped[agent] = logs.filter(l => l.agent === agent).slice(-3);
    }
    
    return grouped;
  } catch {
    return {};
  }
}

// ✅ GESTIÓN DE SPRINTS
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

export function loadSprintHistory(): SprintHistoryEntry[] {
  try {
    if (!fs.existsSync(SPRINT_HISTORY_FILE)) return [];
    return JSON.parse(fs.readFileSync(SPRINT_HISTORY_FILE, "utf-8"));
  } catch { return []; }
}

export function saveSprintHistory(history: SprintHistoryEntry[]) {
  try {
    const dir = path.dirname(SPRINT_HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SPRINT_HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando historial:", e); }
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

export function getNextSprintNumber(): number {
  const history = loadSprintHistory();
  const currentSprint = loadSprint();
  
  if (currentSprint && currentSprint.status !== "completed") {
    return currentSprint.sprintNumber;
  }
  
  if (history.length === 0) return 1;
  return Math.max(...history.map(h => h.sprintNumber)) + 1;
}

export function getLessonsLearned(): string[] {
  const history = loadSprintHistory();
  if (history.length === 0) return [];
  
  const lastSprint = history[history.length - 1];
  return lastSprint.lessonsLearned || [];
}

export function getFilesChangedInHistory(): string[] {
  const history = loadSprintHistory();
  const allFiles = new Set<string>();
  
  for (const sprint of history) {
    if (sprint.filesChanged) {
      sprint.filesChanged.forEach(f => allFiles.add(f));
    }
  }
  
  return Array.from(allFiles);
}

// ✅ PREPARAR REPOSITORIO
async function prepareRepository(): Promise<{ success: boolean; message: string }> {
  try {
    await execAsync(`git config user.email "agent@fabricagents.ai"`, { cwd: REPO_DIR });
    await execAsync(`git config user.name "Fabric Agent"`, { cwd: REPO_DIR });
    
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (statusOutput.trim()) {
      await execAsync(`git add .`, { cwd: REPO_DIR });
      await execAsync(`git commit -m "🎯 Estado inicial antes del Sprint\n\nAuto-committed by FabricAgents"`, { cwd: REPO_DIR });
      
      const memory = loadChangeMemory();
      memory.totalCommits++;
      const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
      memory.lastCommitHash = hashOutput.trim();
      saveChangeMemory(memory);
    }
    return { success: true, message: "Repositorio preparado" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// ✅ EJECUTAR TAREA DE AGENTE
async function executeAgentTask(task: SprintTask): Promise<{ success: boolean; output: string; filesModified?: string[] }> {
  try {
    addAgentLog(task.agent, `Iniciando: ${task.title}`, "info");
    
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const prompt = `Tarea: ${task.title}\nDescripción: ${task.description}\n\nPor favor, implementa esta tarea siguiendo las mejores prácticas. Responde SOLO con el contenido del archivo. En la primera línea pon 'ARCHIVO: nombre_del_archivo.ext' y luego el código.`;
    
    addAgentLog(task.agent, `Generando código con ${model}...`, "info");
    
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.2, num_predict: 2000 } })
    });
    
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    const data = await response.json();
    const generatedText = data.response;
    
    const lines = generatedText.split('\n');
    let fileName = `agent_generated_${task.agent}_${Date.now()}.md`;
    let content = generatedText;
    
    const fileMatch = lines[0].match(/ARCHIVO:\s*(.+)/i) || lines[0].match(/FILE:\s*(.+)/i);
    if (fileMatch) {
      fileName = fileMatch[1].trim().replace(/[^a-zA-Z0-9._-]/g, '_');
      content = lines.slice(1).join('\n').trim();
    } else {
      const codeBlockMatch = generatedText.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) content = codeBlockMatch[1].trim();
    }
    
    const filePath = path.join(REPO_DIR, fileName);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf-8");
    
    addAgentLog(task.agent, `✅ Archivo creado: ${fileName}`, "success");
    return { success: true, output: `Generado: ${fileName}`, filesModified: [fileName] };
  } catch (error: any) {
    addAgentLog(task.agent, `❌ Error: ${error.message}`, "error");
    return { success: false, output: error.message };
  }
}

// ✅ COMMIT Y PUSH CON ANTI-DUPLICADOS
async function commitAndPush(task: SprintTask): Promise<{ success: boolean; commitHash?: string }> {
  try {
    addAgentLog(task.agent, `Preparando commit...`, "info");
    
    const githubOwner = process.env.GITHUB_OWNER || "gerardoramos89";
    const githubRepo = process.env.GITHUB_REPO || "multiagentesIA";

    const { stdout: branchOutput } = await execAsync(`git branch --show-current`, { cwd: REPO_DIR });
    const currentBranch = branchOutput.trim() || "master";

    await execAsync(`git add .`, { cwd: REPO_DIR });
    
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (!statusOutput.trim()) {
      addAgentLog(task.agent, `⚠️ No hay cambios nuevos (archivo ya existe)`, "warn");
      return { success: true };
    }

    try {
      const { stdout: lastCommitMsg } = await execAsync(`git log -1 --pretty=%B`, { cwd: REPO_DIR });
      const commitMessage = `✨ [Sprint ${task.id.split('-')[0]?.replace('task-', '') || '1'}] [${task.agent.toUpperCase()}] ${task.title.replace(/\[.*?\]\s*/, '')}`;
      
      if (lastCommitMsg.trim().includes(task.title.replace(/\[.*?\]\s*/, ''))) {
        addAgentLog(task.agent, `⚠️ Commit duplicado detectado, omitiendo`, "warn");
        return { success: true };
      }
    } catch {}

    const commitMessage = `✨ [Sprint ${task.id.split('-')[0]?.replace('task-', '') || '1'}] [${task.agent.toUpperCase()}] ${task.title.replace(/\[.*?\]\s*/, '')}\n\nTarea: ${task.id}`;
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: REPO_DIR });
    
    const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
    const commitHash = hashOutput.trim();
    
    const memory = loadChangeMemory();
    memory.totalCommits++;
    memory.lastCommitHash = commitHash;
    if (task.filesModified) {
      task.filesModified.forEach(f => {
        if (!memory.filesEverChanged.includes(f)) {
          memory.filesEverChanged.push(f);
        }
      });
    }
    saveChangeMemory(memory);
    
    const sshUrl = `git@github.com:${githubOwner}/${githubRepo}.git`;
    const sshKeyPath = `C:/Users/GERARD/.ssh/id_ed25519`;
    
    await execAsync(`git remote remove origin`, { cwd: REPO_DIR }).catch(() => {});
    await execAsync(`git remote add origin ${sshUrl}`, { cwd: REPO_DIR });
    
    const sshCommand = `ssh -i ${sshKeyPath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
    await execAsync(`git config core.sshCommand "${sshCommand}"`, { cwd: REPO_DIR });
    
    await execAsync(`git push origin ${currentBranch}`, { cwd: REPO_DIR });
    
    addAgentLog(task.agent, `✅ Push exitoso: ${commitHash.substring(0, 7)}`, "success");
    return { success: true, commitHash };
  } catch (error: any) {
    addAgentLog(task.agent, `❌ Error en push: ${error.message}`, "error");
    return { success: false };
  }
}

// ✅ INICIAR EJECUCIÓN DEL SPRINT
export async function startSprintExecution(vision?: any, projectContext?: string): Promise<{ success: boolean; message: string }> {
  console.log("[EXECUTOR] startSprintExecution llamado");
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
  sprint.vision = vision;
  sprint.projectContext = projectContext;
  sprint.filesChanged = [];
  saveSprint(sprint);

  log("SPRINT", "system", `🚀 Sprint #${sprint.sprintNumber} iniciado. ${sprint.tasks.length} tareas en cola.`);
  
  executeTasksSequentially(sprint, vision, projectContext).catch((e) => log("ERROR", "executor", `Error en ejecución: ${e?.message}`));
  
  return { success: true, message: "Sprint iniciado" };
}

// ✅ EJECUCIÓN SECUENCIAL CON CIERRE AUTOMÁTICO
async function executeTasksSequentially(sprint: SprintState, vision?: any, projectContext?: string) {
  const pendingTasks = sprint.tasks.filter((t) => t.status === "pending");
  log("INFO", "executor", `Tareas pendientes encontradas: ${pendingTasks.length}`);
  
  if (pendingTasks.length === 0) {
    // ✅ TRANSICIÓN AUTOMÁTICA A RETROSPECTIVA
    await transitionToRetrospective(sprint);
    return;
  }

  for (const task of pendingTasks) {
    task.status = "working";
    task.startedAt = new Date().toISOString();
    saveSprint(sprint);

    const agentName = task.agent === "po" ? "Product Owner" : task.agent === "arch" ? "Arquitecto" : task.agent === "dev" ? "Developer" : task.agent === "qa" ? "QA Engineer" : "Technical Writer";
    log("AGENT", task.agent, `${agentName} empezó: ${task.title}`);
    addAgentLog(task.agent, `🎯 Trabajando en: ${task.title}`, "info");

    const startTime = Date.now();
    
    let enhancedTask = { ...task };
    if (task.agent === "doc" && vision && vision.isCompleted) {
      const memory = loadChangeMemory();
      
      enhancedTask.description = `CONTEXTO DEL PROYECTO (OBLIGATORIO):
- Nombre: ${vision.name}
- Objetivo: ${vision.generalObjective}
- Alcance: ${vision.scope}
- Skills: ${vision.targetSkills}
- Contexto adicional: ${projectContext || "No proporcionado"}

ESTADO DEL PROYECTO:
- Total de commits: ${memory.totalCommits}
- Sprints completados: ${memory.sprintsCompleted}
- Archivos modificados históricamente: ${memory.filesEverChanged.length}

TAREA ORIGINAL: ${task.description}

INSTRUCCIÓN: Actualiza el README.md para que sea la GUÍA VIVA del progreso del proyecto.`;
      log("INFO", "doc", "Inyectando contexto completo para README vivo...");
      addAgentLog("doc", "📝 Creando README como guía viva del proyecto...", "info");
    }

    const result = await executeAgentTask(enhancedTask);
    
    if (!result.success) {
      task.status = "blocked";
      task.output = `Error: ${result.output}`;
      saveSprint(sprint);
      log("ERROR", task.agent, `Tarea bloqueada: ${task.title}`);
      addAgentLog(task.agent, `⚠️ Tarea bloqueada`, "error");
      continue;
    }

    const commitResult = await commitAndPush(task);
    if (commitResult.success && commitResult.commitHash) task.commits = [commitResult.commitHash];
    if (result.filesModified) {
      task.filesModified = result.filesModified;
      if (!sprint.filesChanged) sprint.filesChanged = [];
      result.filesModified.forEach(f => {
        if (!sprint.filesChanged!.includes(f)) {
          sprint.filesChanged!.push(f);
        }
      });
    }

    task.status = "done";
    task.completedAt = new Date().toISOString();
    task.output = result.output;
    saveSprint(sprint);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("AGENT", task.agent, `${agentName} completó: ${task.title} en ${duration}s`);
    addAgentLog(task.agent, `✅ Completado en ${duration}s`, "success");
    
    await new Promise((r) => setTimeout(r, 2000));
  }

  // ✅ TODAS LAS TAREAS TERMINARON → TRANSICIÓN AUTOMÁTICA
  await transitionToRetrospective(sprint);
}

// ✅ NUEVA FUNCIÓN: TRANSICIÓN AUTOMÁTICA A RETROSPECTIVA
async function transitionToRetrospective(sprint: SprintState) {
  log("SPRINT", "system", `📋 Sprint #${sprint.sprintNumber} completado. Generando retrospectiva...`);
  addAgentLog("po", "📊 Todas las tareas completadas. Generando retrospectiva...", "info");
  
  sprint.status = "retrospective";
  saveSprint(sprint);
  
  // Generar retrospectiva automáticamente
  const retrospectiveResult = await generateRetrospective();
  if (retrospectiveResult.success && retrospectiveResult.retrospective) {
    sprint.retrospective = retrospectiveResult.retrospective;
    sprint.status = "survey";
    saveSprint(sprint);
    
    log("SPRINT", "system", `✅ Retrospectiva generada. Creando encuestas en Trello...`);
    addAgentLog("po", "📋 Creando encuestas en Trello para feedback humano...", "info");
    
    // Crear encuestas en Trello
    const surveyResult = await createSurveys();
    if (surveyResult.success) {
      log("SPRINT", "system", `✅ Encuestas creadas en Trello. Esperando respuestas del humano...`);
      addAgentLog("po", "✅ Encuestas creadas. Esperando respuestas del humano.", "success");
    } else {
      log("SPRINT", "system", `⚠️ Error creando encuestas. Sprint en estado de revisión manual.`);
      addAgentLog("po", "⚠️ Error creando encuestas en Trello.", "warn");
    }
  } else {
    log("SPRINT", "system", `⚠️ Error generando retrospectiva. Sprint en estado de revisión.`);
    addAgentLog("po", "⚠️ Error generando retrospectiva.", "warn");
    sprint.status = "review";
    saveSprint(sprint);
  }
}

// ✅ GENERAR RETROSPECTIVA
export async function generateRetrospective(): Promise<{ success: boolean; retrospective?: SprintRetrospective }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false };

  try {
    addAgentLog("po", "📊 Generando retrospectiva del sprint...", "info");
    
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    
    const completedTasks = sprint.tasks.filter(t => t.status === "done");
    const blockedTasks = sprint.tasks.filter(t => t.status === "blocked");
    
    const prompt = `Eres el Product Owner de un equipo de desarrollo de software. Acabas de completar el Sprint #${sprint.sprintNumber}.

Tareas completadas: ${completedTasks.length}/${sprint.tasks.length}
Tareas bloqueadas: ${blockedTasks.length}/${sprint.tasks.length}

Tareas completadas:
${completedTasks.map(t => `- ${t.title} (${t.agent})`).join('\n')}

Tareas bloqueadas:
${blockedTasks.map(t => `- ${t.title}: ${t.output}`).join('\n')}

Genera una retrospectiva Scrum profesional en formato JSON con esta estructura exacta:
{
  "whatWentWell": ["punto1", "punto2", "punto3"],
  "whatWentWrong": ["punto1", "punto2"],
  "actionItems": ["acción1", "acción2", "acción3"]
}

Responde SOLO con el JSON, sin texto adicional.`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.3, num_predict: 1000 } })
    });
    
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    const data = await response.json();
    
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer JSON de la retrospectiva");
    
    const retrospective = JSON.parse(jsonMatch[0]);
    
    const result: SprintRetrospective = {
      whatWentWell: retrospective.whatWentWell || [],
      whatWentWrong: retrospective.whatWentWrong || [],
      actionItems: retrospective.actionItems || [],
      generatedAt: new Date().toISOString(),
      generatedBy: "Product Owner Agent"
    };
    
    addAgentLog("po", "✅ Retrospectiva generada", "success");
    
    return { success: true, retrospective: result };
  } catch (error: any) {
    addAgentLog("po", `❌ Error en retrospectiva: ${error.message}`, "error");
    return { success: false };
  }
}

// ✅ CREAR ENCUESTAS EN TRELLO
export async function createSurveys(): Promise<{ success: boolean; surveys?: SurveyQuestion[] }> {
  const sprint = loadSprint();
  if (!sprint || !sprint.retrospective) return { success: false };

  try {
    addAgentLog("po", "📋 Creando encuestas en Trello...", "info");
    
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      throw new Error("Faltan credenciales de Trello");
    }

    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`);
    const lists = await listsRes.json();
    let retroList = lists.find((l: any) => /retrospectiva|survey|encuesta/i.test(l.name));
    
    if (!retroList) {
      const createListRes = await fetch("https://api.trello.com/1/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key, token, name: "📊 Retrospectiva Sprint", idBoard: boardId, pos: "bottom"
        })
      });
      retroList = await createListRes.json();
    }

    const surveys: SurveyQuestion[] = [];

    for (const item of sprint.retrospective.whatWentWrong) {
      const cardRes = await fetch("https://api.trello.com/1/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key, token, idList: retroList.id,
          name: `❓ ${item.substring(0, 100)}`,
          desc: `**Pregunta abierta para el equipo:**\n\n${item}\n\nPor favor, responde en los comentarios con tu análisis.\n\n---\n⏳ Esperando respuesta del humano...`
        })
      });
      const card = await cardRes.json();
      
      surveys.push({
        id: `survey-${Date.now()}-${surveys.length}`,
        question: item,
        type: "open",
        trelloCardId: card.id
      });
    }

    for (const action of sprint.retrospective.actionItems) {
      const cardRes = await fetch("https://api.trello.com/1/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key, token, idList: retroList.id,
          name: `🎯 ${action.substring(0, 100)}`,
          desc: `**Acción propuesta:**\n\n${action}\n\n¿Estás de acuerdo? Responde en los comentarios.\n\n---\n⏳ Esperando respuesta del humano...`
        })
      });
      const card = await cardRes.json();
      
      surveys.push({
        id: `survey-${Date.now()}-${surveys.length}`,
        question: action,
        type: "multiple",
        options: ["SÍ", "NO", "MODIFICAR"],
        trelloCardId: card.id
      });
    }

    sprint.surveys = surveys;
    saveSprint(sprint);
    
    addAgentLog("po", `✅ ${surveys.length} encuestas creadas en Trello`, "success");
    
    return { success: true, surveys };
  } catch (error: any) {
    addAgentLog("po", `❌ Error creando encuestas: ${error.message}`, "error");
    return { success: false };
  }
}

// ✅ VERIFICAR RESPUESTAS DE ENCUESTAS
export async function checkSurveyResponses(): Promise<{ success: boolean; allAnswered: boolean; responses?: any[] }> {
  const sprint = loadSprint();
  if (!sprint || !sprint.surveys) return { success: false, allAnswered: false };

  try {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    
    if (!key || !token) return { success: false, allAnswered: false };

    const responses: any[] = [];
    let allAnswered = true;

    for (const survey of sprint.surveys) {
      if (!survey.trelloCardId) continue;
      
      const commentsRes = await fetch(
        `https://api.trello.com/1/cards/${survey.trelloCardId}/actions?filter=commentCard`,
        { headers: { Accept: "application/json" } }
      );
      
      if (!commentsRes.ok) continue;
      
      const comments = await commentsRes.json();
      
      if (comments.length > 0) {
        survey.answer = comments[comments.length - 1].data.text;
        responses.push({
          question: survey.question,
          answer: survey.answer,
          answeredAt: comments[comments.length - 1].date
        });
      } else {
        allAnswered = false;
      }
    }

    saveSprint(sprint);
    
    return { success: true, allAnswered, responses };
  } catch (error: any) {
    return { success: false, allAnswered: false };
  }
}

// ✅ CERRAR SPRINT
export async function closeSprint(): Promise<{ success: boolean; message: string }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false, message: "No hay sprint activo" };
  if (sprint.status === "completed") return { success: false, message: "El sprint ya está cerrado" };

  addAgentLog("po", "🔒 Cerrando sprint...", "info");
  
  const lessonsLearned: string[] = [];
  if (sprint.surveys) {
    for (const survey of sprint.surveys) {
      if (survey.answer) {
        lessonsLearned.push(`${survey.question} → ${survey.answer}`);
      }
    }
  }
  
  sprint.lessonsLearned = lessonsLearned;
  sprint.completedAt = new Date().toISOString();
  sprint.status = "completed";
  saveSprint(sprint);
  
  const memory = loadChangeMemory();
  memory.sprintsCompleted++;
  if (sprint.filesChanged) {
    sprint.filesChanged.forEach(f => {
      if (!memory.filesEverChanged.includes(f)) {
        memory.filesEverChanged.push(f);
      }
    });
  }
  saveChangeMemory(memory);
  
  const history = loadSprintHistory();
  history.push({
    sprintNumber: sprint.sprintNumber,
    startedAt: sprint.startedAt,
    completedAt: sprint.completedAt,
    tasks: sprint.tasks,
    retrospective: sprint.retrospective,
    vision: sprint.vision,
    lessonsLearned,
    filesChanged: sprint.filesChanged
  });
  saveSprintHistory(history);
  
  try {
    if (fs.existsSync(SPRINT_FILE)) fs.unlinkSync(SPRINT_FILE);
  } catch (e) {
    console.error("[EXECUTOR] Error borrando sprint activo:", e);
  }
  
  addAgentLog("po", "✅ Sprint archivado en historial", "success");
  log("SPRINT", "system", `✅ Sprint #${sprint.sprintNumber} cerrado y archivado`);
  
  return { success: true, message: "Sprint cerrado exitosamente" };
}