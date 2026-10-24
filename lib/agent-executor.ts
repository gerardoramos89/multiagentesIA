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
  whatWasAchieved: string[];
  whatWentWell: string[];
  whatWentWrong: string[];
  whatNeedsDefinition: string[];
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

export interface AgentWorkLog {
  agent: string;
  taskId: string;
  taskTitle: string;
  prompt: string;
  response: string;
  status: "working" | "done" | "error";
  startedAt: string;
  completedAt?: string;
  fileName?: string;
  duration?: number;
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
const AGENT_WORK_LOGS_FILE = path.join(process.cwd(), "config", "agent-work-logs.json");
const CHANGE_MEMORY_FILE = path.join(process.cwd(), "config", "change-memory.json");
const REPO_DIR = process.cwd();

// ✅ GESTIÓN DE MEMORIA DE CAMBIOS
export function loadChangeMemory(): ChangeMemory {
  try {
    if (!fs.existsSync(CHANGE_MEMORY_FILE)) return { totalCommits: 0, filesEverChanged: [], sprintsCompleted: 0 };
    return JSON.parse(fs.readFileSync(CHANGE_MEMORY_FILE, "utf-8"));
  } catch { return { totalCommits: 0, filesEverChanged: [], sprintsCompleted: 0 }; }
}

export function saveChangeMemory(memory: ChangeMemory) {
  try {
    const dir = path.dirname(CHANGE_MEMORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHANGE_MEMORY_FILE, JSON.stringify(memory, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando memoria:", e); }
}

// ✅ GESTIÓN DE LOGS DE AGENTES
export function addAgentLog(agent: string, message: string, level: AgentLog["level"] = "info") {
  try {
    let logs: AgentLog[] = [];
    if (fs.existsSync(AGENT_LOGS_FILE)) logs = JSON.parse(fs.readFileSync(AGENT_LOGS_FILE, "utf-8"));
    logs.push({ agent, message, timestamp: new Date().toISOString(), level });
    if (logs.length > 50) logs = logs.slice(-50);
    fs.writeFileSync(AGENT_LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando log:", e); }
}

export function getAgentLogs(): Record<string, AgentLog[]> {
  try {
    if (!fs.existsSync(AGENT_LOGS_FILE)) return {};
    const logs: AgentLog[] = JSON.parse(fs.readFileSync(AGENT_LOGS_FILE, "utf-8"));
    const grouped: Record<string, AgentLog[]> = {};
    for (const agent of ["po", "arch", "dev", "qa", "doc"]) {
      grouped[agent] = logs.filter(l => l.agent === agent).slice(-5);
    }
    return grouped;
  } catch { return {}; }
}

// ✅ GESTIÓN DE LOGS DE TRABAJO (PROMPTS Y RESPUESTAS)
export function saveAgentWorkLog(workLog: AgentWorkLog) {
  try {
    let logs: AgentWorkLog[] = [];
    if (fs.existsSync(AGENT_WORK_LOGS_FILE)) logs = JSON.parse(fs.readFileSync(AGENT_WORK_LOGS_FILE, "utf-8"));
    const existingIndex = logs.findIndex(l => l.taskId === workLog.taskId);
    if (existingIndex >= 0) logs[existingIndex] = workLog;
    else logs.push(workLog);
    if (logs.length > 30) logs = logs.slice(-30);
    fs.writeFileSync(AGENT_WORK_LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) { console.error("[EXECUTOR] Error guardando work log:", e); }
}

export function getAgentWorkLogs(): AgentWorkLog[] {
  try {
    if (!fs.existsSync(AGENT_WORK_LOGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(AGENT_WORK_LOGS_FILE, "utf-8"));
  } catch { return []; }
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
  if (currentSprint && currentSprint.status !== "completed") return currentSprint.sprintNumber;
  if (history.length === 0) return 1;
  return Math.max(...history.map(h => h.sprintNumber)) + 1;
}

export function getLessonsLearned(): string[] {
  const history = loadSprintHistory();
  if (history.length === 0) return [];
  return history[history.length - 1].lessonsLearned || [];
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
    
    const rolePrompts: Record<string, string> = {
      po: `Eres un Product Owner experto. Tu trabajo es ESTRATÉGICO. No generes código. Genera documentos de planificación. Enfócate en: objetivos claros, criterios de aceptación, riesgos y propuestas de mejora.`,
      arch: `Eres un Arquitecto de Software senior. Tu trabajo es DISEÑAR y ESTRUCTURAR. Enfócate en: patrones de diseño, estructura de carpetas, decisiones técnicas (ADR), escalabilidad y reducción de deuda técnica.`,
      dev: `Eres un Developer senior experto en código limpio. Tu trabajo es IMPLEMENTAR. Genera código funcional, modular y bien comentado. Enfócate en: principios SOLID, manejo de errores y código testeable.`,
      qa: `Eres un QA Engineer experto. Tu trabajo es VALIDAR y MEJORAR. Genera reportes de calidad y tests funcionales. Enfócate en: encontrar bugs reales, cobertura de tests y recomendaciones accionables.`,
      doc: `Eres un Technical Writer experto. Tu trabajo es DOCUMENTAR. Genera documentación clara y profesional. Enfócate en: README actualizado, guías de instalación y documentación que sea la FUENTE DE VERDAD.`
    };

    const rolePrompt = rolePrompts[task.agent] || rolePrompts.dev;
    const prompt = `${rolePrompt}\n\nCONTEXTO DEL PROYECTO:\n- Nombre: ${task.title}\n- Descripción: ${task.description}\n\nINSTRUCCIÓN: Genera UN SOLO archivo importante. Responde SOLO con el contenido. Primera línea: 'ARCHIVO: nombre.ext' y luego el código.`;

    // ✅ GUARDAR TIMESTAMP DE INICIO
    const startedAt = new Date().toISOString();
    const startTime = Date.now();

    saveAgentWorkLog({ 
      agent: task.agent, 
      taskId: task.id, 
      taskTitle: task.title, 
      prompt: prompt.substring(0, 500) + "...", 
      response: "", 
      status: "working", 
      startedAt 
    });

    addAgentLog(task.agent, `Generando con ${model}...`, "info");
    
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.3, num_predict: 2500 } })
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
    
    // ✅ CALCULAR DURACIÓN REAL
    const completedAt = new Date().toISOString();
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    saveAgentWorkLog({ 
      agent: task.agent, 
      taskId: task.id, 
      taskTitle: task.title, 
      prompt: prompt.substring(0, 500) + "...", 
      response: content.substring(0, 800) + (content.length > 800 ? "..." : ""), 
      status: "done", 
      startedAt,
      completedAt,
      fileName,
      duration // ✅ AHORA SÍ TIENE LA DURACIÓN REAL
    });
    
    addAgentLog(task.agent, `✅ Archivo creado: ${fileName} en ${duration}s`, "success");
    return { success: true, output: `Generado: ${fileName}`, filesModified: [fileName] };
  } catch (error: any) {
    const completedAt = new Date().toISOString();
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    saveAgentWorkLog({ 
      agent: task.agent, 
      taskId: task.id, 
      taskTitle: task.title, 
      prompt: "", 
      response: `Error: ${error.message}`, 
      status: "error", 
      startedAt: new Date().toISOString(),
      completedAt,
      duration
    });
    
    addAgentLog(task.agent, `❌ Error: ${error.message}`, "error");
    return { success: false, output: error.message };
  }
}

// ✅ COMMIT Y PUSH
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
      addAgentLog(task.agent, `⚠️ No hay cambios nuevos`, "warn");
      return { success: true };
    }

    const commitMessage = `✨ [Sprint ${task.id.split('-')[0]?.replace('task-', '') || '1'}] [${task.agent.toUpperCase()}] ${task.title.replace(/\[.*?\]\s*/, '')}\n\nTarea: ${task.id}`;
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: REPO_DIR });
    
    const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
    const commitHash = hashOutput.trim();
    
    const memory = loadChangeMemory();
    memory.totalCommits++;
    memory.lastCommitHash = commitHash;
    if (task.filesModified) {
      task.filesModified.forEach(f => { if (!memory.filesEverChanged.includes(f)) memory.filesEverChanged.push(f); });
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

// ✅ INICIAR EJECUCIÓN
let isExecuting = false;
export async function startSprintExecution(vision?: any, projectContext?: string): Promise<{ success: boolean; message: string }> {
  if (isExecuting) return { success: false, message: "El sprint ya se está iniciando..." };
  const sprint = loadSprint();
  if (!sprint) return { success: false, message: "No hay sprint planificado" };
  if (sprint.status === "executing") return { success: false, message: "El sprint ya está en ejecución" };

  isExecuting = true;
  try {
    const prepResult = await prepareRepository();
    if (!prepResult.success) { isExecuting = false; return { success: false, message: prepResult.message }; }

    log("INFO", "executor", `Resetando ${sprint.tasks.length} tareas a "pending"...`);
    for (const task of sprint.tasks) {
      task.status = "pending"; task.startedAt = undefined; task.completedAt = undefined;
      task.output = undefined; task.commits = undefined; task.filesModified = undefined;
    }
    sprint.status = "executing"; sprint.vision = vision; sprint.projectContext = projectContext; sprint.filesChanged = [];
    saveSprint(sprint);

    log("SPRINT", "system", `🚀 Sprint #${sprint.sprintNumber} iniciado. ${sprint.tasks.length} tareas en cola.`);
    sprint.tasks.forEach((task, i) => {
      const agentIcon = task.agent === "po" ? "📋" : task.agent === "arch" ? "🏗️" : task.agent === "dev" ? "🛠️" : task.agent === "qa" ? "🧪" : "📝";
      log("SPRINT", "system", `  ${i + 1}. ${agentIcon} [${task.agent.toUpperCase()}] ${task.title}`);
    });
    executeTasksSequentially(sprint, vision, projectContext).catch((e) => log("ERROR", "executor", `Error: ${e?.message}`));
    return { success: true, message: "Sprint iniciado" };
  } finally {
    setTimeout(() => { isExecuting = false; }, 5000);
  }
}

async function executeTasksSequentially(sprint: SprintState, vision?: any, projectContext?: string) {
  const pendingTasks = sprint.tasks.filter((t) => t.status === "pending");
  log("INFO", "executor", `Tareas pendientes: ${pendingTasks.length}`);
  
  if (pendingTasks.length === 0) {
    await transitionToRetrospective(sprint);
    return;
  }

  for (const task of pendingTasks) {
    task.status = "working"; task.startedAt = new Date().toISOString(); saveSprint(sprint);
    const agentName = task.agent === "po" ? "Product Owner" : task.agent === "arch" ? "Arquitecto" : task.agent === "dev" ? "Developer" : task.agent === "qa" ? "QA Engineer" : "Technical Writer";
    log("AGENT", task.agent, `${agentName} empezó: ${task.title}`);
    addAgentLog(task.agent, `🎯 Trabajando en: ${task.title}`, "info");

    const startTime = Date.now();
    let enhancedTask = { ...task };
    if (task.agent === "doc" && vision && vision.isCompleted) {
      const memory = loadChangeMemory();
      enhancedTask.description = `CONTEXTO DEL PROYECTO:\n- Nombre: ${vision.name}\n- Objetivo: ${vision.generalObjective}\n- Skills: ${vision.targetSkills}\n- Commits totales: ${memory.totalCommits}\n\nTAREA: ${task.description}\n\nINSTRUCCIÓN: Actualiza el README.md para que sea la GUÍA VIVA del proyecto.`;
      addAgentLog("doc", "📝 Inyectando contexto para README vivo...", "info");
    }

    const result = await executeAgentTask(enhancedTask);
    if (!result.success) {
      task.status = "blocked"; task.output = `Error: ${result.output}`; saveSprint(sprint);
      addAgentLog(task.agent, `⚠️ Tarea bloqueada`, "error");
      continue;
    }

    const commitResult = await commitAndPush(task);
    if (commitResult.success && commitResult.commitHash) task.commits = [commitResult.commitHash];
    if (result.filesModified) {
      task.filesModified = result.filesModified;
      if (!sprint.filesChanged) sprint.filesChanged = [];
      result.filesModified.forEach(f => { if (!sprint.filesChanged!.includes(f)) sprint.filesChanged!.push(f); });
    }

    task.status = "done"; task.completedAt = new Date().toISOString(); task.output = result.output; saveSprint(sprint);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log("AGENT", task.agent, `${agentName} completó: ${task.title} en ${duration}s`);
    addAgentLog(task.agent, `✅ Completado en ${duration}s`, "success");
    await new Promise((r) => setTimeout(r, 2000));
  }

  await transitionToRetrospective(sprint);
}

async function transitionToRetrospective(sprint: SprintState) {
  log("SPRINT", "system", `📋 Sprint #${sprint.sprintNumber} completado. Generando retrospectiva...`);
  addAgentLog("po", "📊 Todas las tareas completadas. Generando retrospectiva...", "info");
  sprint.status = "retrospective"; saveSprint(sprint);
  
  const retrospectiveResult = await generateRetrospective();
  if (retrospectiveResult.success && retrospectiveResult.retrospective) {
    sprint.retrospective = retrospectiveResult.retrospective;
    sprint.status = "survey"; saveSprint(sprint);
    log("SPRINT", "system", `✅ Retrospectiva generada. Creando encuestas en Trello...`);
    addAgentLog("po", "📋 Creando encuestas en Trello...", "info");
    const surveyResult = await createSurveys();
    if (surveyResult.success) {
      log("SPRINT", "system", `✅ Encuestas creadas en Trello. Esperando respuestas del humano...`);
      addAgentLog("po", "✅ Encuestas creadas. Esperando respuestas.", "success");
    } else {
      log("SPRINT", "system", `⚠️ Error creando encuestas.`);
      addAgentLog("po", "⚠️ Error creando encuestas.", "warn");
    }
  } else {
    log("SPRINT", "system", `⚠️ Error generando retrospectiva.`);
    sprint.status = "review"; saveSprint(sprint);
  }
}

export async function generateRetrospective(): Promise<{ success: boolean; retrospective?: SprintRetrospective }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false };
  try {
    addAgentLog("po", "📊 Generando retrospectiva...", "info");
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const completedTasks = sprint.tasks.filter(t => t.status === "done");
    const blockedTasks = sprint.tasks.filter(t => t.status === "blocked");
    
    const prompt = `Eres un Product Owner experto. Acabas de completar el Sprint #${sprint.sprintNumber}.
Tareas completadas: ${completedTasks.map(t => `- ${t.title} (${t.agent})`).join('\n') || 'Ninguna'}
Tareas bloqueadas: ${blockedTasks.map(t => `- ${t.title}: ${t.output}`).join('\n') || 'Ninguna'}
Genera una retrospectiva Scrum REALISTA en formato JSON:
{
  "whatWasAchieved": ["logro1", "logro2"],
  "whatWentWell": ["punto1", "punto2"],
  "whatWentWrong": ["punto1", "punto2"],
  "whatNeedsDefinition": ["aspecto1", "aspecto2"],
  "actionItems": ["acción1", "acción2"]
}
Responde SOLO con el JSON.`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.4, num_predict: 1500 } })
    });
    if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);
    const data = await response.json();
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No se pudo extraer JSON");
    const retrospective = JSON.parse(jsonMatch[0]);
    
    const result: SprintRetrospective = {
      whatWasAchieved: retrospective.whatWasAchieved || ["Tareas completadas según lo planificado"],
      whatWentWell: retrospective.whatWentWell || ["Ejecución fluida"],
      whatWentWrong: retrospective.whatWentWrong || ["Se requiere mayor definición"],
      whatNeedsDefinition: retrospective.whatNeedsDefinition || ["Próximos pasos de la arquitectura"],
      actionItems: retrospective.actionItems || ["Revisar código generado"],
      generatedAt: new Date().toISOString(),
      generatedBy: "Product Owner Agent"
    };
    addAgentLog("po", "✅ Retrospectiva completa generada", "success");
    return { success: true, retrospective: result };
  } catch (error: any) {
    addAgentLog("po", `❌ Error: ${error.message}`, "error");
    return { success: false };
  }
}

export async function createSurveys(): Promise<{ success: boolean; surveys?: SurveyQuestion[] }> {
  const sprint = loadSprint();
  if (!sprint || !sprint.retrospective) return { success: false };
  try {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    if (!key || !token || !boardId) throw new Error("Faltan credenciales de Trello");

    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`);
    if (!listsRes.ok) throw new Error(`Error obteniendo listas: ${listsRes.status}`);
    const lists = await listsRes.json();
    let reviewList = lists.find((l: any) => /review humano|encuesta|retrospectiva/i.test(l.name));
    
    if (!reviewList) {
      const createListRes = await fetch("https://api.trello.com/1/lists", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, token, name: "⏳ Review Humano (Encuestas)", idBoard: boardId, pos: "bottom" })
      });
      if (!createListRes.ok) throw new Error(`Error creando lista: ${createListRes.status}`);
      reviewList = await createListRes.json();
    }

    const surveys: SurveyQuestion[] = [];
    const itemsToSurvey = [
      ...sprint.retrospective.whatNeedsDefinition.map(item => ({ type: "open" as const, text: `Definir: ${item}`, question: item })),
      ...sprint.retrospective.actionItems.map(item => ({ type: "multiple" as const, text: `Acción: ${item}`, question: item }))
    ];

    if (itemsToSurvey.length === 0) {
      itemsToSurvey.push({ type: "open" as const, text: "Revisar y aprobar el cierre del sprint", question: "¿Estás listo para cerrar este sprint?" });
    }

    for (const item of itemsToSurvey) {
      const cardRes = await fetch("https://api.trello.com/1/cards", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key, token, idList: reviewList.id,
          name: `⚠️ [ACCIÓN REQUERIDA] ${item.text.substring(0, 80)}`,
          desc: `**🤖 El sistema está PAUSADO esperando tu respuesta.**\n\n**Contexto:**\n"${item.question}"\n\n**Instrucciones:**\nPor favor, escribe un comentario en esta tarjeta con tu decisión. En cuanto comentes, el sistema continuará.\n\n---\n⏳ *Estado: Esperando respuesta del humano...*`
        })
      });
      if (!cardRes.ok) throw new Error(`Error creando tarjeta: ${cardRes.status}`);
      const card = await cardRes.json();
      surveys.push({ id: `survey-${Date.now()}-${surveys.length}`, question: item.question, type: item.type, options: item.type === "multiple" ? ["SÍ", "NO", "MODIFICAR"] : undefined, trelloCardId: card.id });
    }

    sprint.surveys = surveys; sprint.status = "survey"; saveSprint(sprint);
    addAgentLog("po", `✅ ${surveys.length} encuestas creadas en Trello`, "success");
    return { success: true, surveys };
  } catch (error: any) {
    addAgentLog("po", `❌ Error creando encuestas: ${error.message}`, "error");
    return { success: false };
  }
}

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
      const commentsRes = await fetch(`https://api.trello.com/1/cards/${survey.trelloCardId}/actions?filter=commentCard`, { headers: { Accept: "application/json" } });
      if (!commentsRes.ok) continue;
      const comments = await commentsRes.json();
      if (comments.length > 0) {
        survey.answer = comments[comments.length - 1].data.text;
        responses.push({ question: survey.question, answer: survey.answer, answeredAt: comments[comments.length - 1].date });
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

export async function closeSprint(): Promise<{ success: boolean; message: string }> {
  const sprint = loadSprint();
  if (!sprint) return { success: false, message: "No hay sprint activo" };
  if (sprint.status === "completed") return { success: false, message: "El sprint ya está cerrado" };

  addAgentLog("po", "🔒 Cerrando sprint...", "info");
  const lessonsLearned: string[] = [];
  if (sprint.surveys) {
    for (const survey of sprint.surveys) {
      if (survey.answer) lessonsLearned.push(`${survey.question} → ${survey.answer}`);
    }
  }
  
  sprint.lessonsLearned = lessonsLearned;
  sprint.completedAt = new Date().toISOString();
  sprint.status = "completed";
  saveSprint(sprint);
  
  const memory = loadChangeMemory();
  memory.sprintsCompleted++;
  if (sprint.filesChanged) {
    sprint.filesChanged.forEach(f => { if (!memory.filesEverChanged.includes(f)) memory.filesEverChanged.push(f); });
  }
  saveChangeMemory(memory);
  
  const history = loadSprintHistory();
  history.push({ sprintNumber: sprint.sprintNumber, startedAt: sprint.startedAt, completedAt: sprint.completedAt, tasks: sprint.tasks, retrospective: sprint.retrospective, vision: sprint.vision, lessonsLearned, filesChanged: sprint.filesChanged });
  saveSprintHistory(history);
  
  try { if (fs.existsSync(SPRINT_FILE)) fs.unlinkSync(SPRINT_FILE); } catch (e) { console.error("[EXECUTOR] Error borrando sprint:", e); }
  
  addAgentLog("po", "✅ Sprint archivado en historial", "success");
  log("SPRINT", "system", `✅ Sprint #${sprint.sprintNumber} cerrado y archivado`);
  return { success: true, message: "Sprint cerrado exitosamente" };
}