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

// ✅ RUTA DE AIDER DESDE EL ENTORNO VIRTUAL
const AIDER_PATH = process.env.AIDER_PATH || "C:/Users/GERARD/Documents/Proyectos/fabric-agents-grtec/venv-aider/Scripts/aider.exe";

export function loadSprint(): SprintState | null {
  try {
    if (!fs.existsSync(SPRINT_FILE)) {
      console.log("[EXECUTOR] loadSprint: El archivo NO existe aún en:", SPRINT_FILE);
      return null;
    }
    const data = JSON.parse(fs.readFileSync(SPRINT_FILE, "utf-8"));
    console.log("[EXECUTOR] loadSprint: Archivo cargado exitosamente. Estado:", data.status);
    return data;
  } catch (e) {
    console.error("[EXECUTOR] Error leyendo sprint:", e);
    return null;
  }
}

export function saveSprint(sprint: SprintState) {
  try {
    const dir = path.dirname(SPRINT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SPRINT_FILE, JSON.stringify(sprint, null, 2), "utf-8");
    console.log("[EXECUTOR] saveSprint: Archivo guardado exitosamente en:", SPRINT_FILE);
  } catch (e) {
    console.error("[EXECUTOR] Error guardando sprint:", e);
  }
}

export function getCurrentAgentTasks(): Record<string, SprintTask | null> {
  const sprint = loadSprint();
  if (!sprint) return { po: null, arch: null, dev: null, qa: null, doc: null };

  const result: Record<string, SprintTask | null> = {
    po: null, arch: null, dev: null, qa: null, doc: null,
  };

  for (const task of sprint.tasks) {
    if (task.status === "working") {
      result[task.agent] = task;
    }
  }

  return result;
}

export function getNextAgentTasks(): Record<string, SprintTask | null> {
  const sprint = loadSprint();
  if (!sprint) return { po: null, arch: null, dev: null, qa: null, doc: null };

  const result: Record<string, SprintTask | null> = {
    po: null, arch: null, dev: null, qa: null, doc: null,
  };

  for (const task of sprint.tasks) {
    if (task.status === "pending" && !result[task.agent]) {
      result[task.agent] = task;
    }
  }

  return result;
}

// ✅ DETECTAR RAMA ACTUAL AUTOMÁTICAMENTE
async function getCurrentBranch(): Promise<string> {
  try {
    const { stdout } = await execAsync(`git branch --show-current`, { cwd: REPO_DIR });
    return stdout.trim() || "master";
  } catch {
    return "master";
  }
}

// ✅ PREPARAR EL REPOSITORIO ANTES DE EJECUTAR
async function prepareRepository(): Promise<{ success: boolean; message: string }> {
  try {
    log("INFO", "executor", "Preparando repositorio...");
    
    // Configurar Git
    await execAsync(`git config user.email "agent@fabricagents.ai"`, { cwd: REPO_DIR });
    await execAsync(`git config user.name "Fabric Agent"`, { cwd: REPO_DIR });
    
    // Verificar si hay cambios pendientes
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    
    if (statusOutput.trim()) {
      log("INFO", "executor", "Hay cambios pendientes. Haciendo commit inicial...");
      
      // Añadir todos los cambios
      await execAsync(`git add .`, { cwd: REPO_DIR });
      
      // Commit inicial
      await execAsync(`git commit -m "🎯 Estado inicial antes del Sprint #1\n\nAuto-committed by FabricAgents"`, { cwd: REPO_DIR });
      
      log("INFO", "executor", "Commit inicial realizado");
    }
    
    return { success: true, message: "Repositorio preparado" };
  } catch (error: any) {
    log("ERROR", "executor", `Error preparando repositorio: ${error.message}`);
    return { success: false, message: error.message };
  }
}

// ✅ EJECUTAR AIDER CON MANEJO ROBUSTO DE ERRORES
async function executeAider(task: SprintTask): Promise<{ success: boolean; output: string }> {
  try {
    const model = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const prompt = buildAiderPrompt(task);
    
    log("AGENT", task.agent, `Ejecutando Aider para: ${task.title}`);
    log("INFO", "executor", `Usando modelo: ${model}`);
    
    // Crear archivo temporal con el prompt (evita problemas con comillas)
    const promptFile = path.join(REPO_DIR, ".aider-prompt.txt");
    fs.writeFileSync(promptFile, prompt, "utf-8");
    
    // Ejecutar Aider con el archivo de prompt
    const command = `"${AIDER_PATH}" --model ollama/${model} --message-file "${promptFile}" --yes --no-pretty`;
    
    const { stdout, stderr } = await execAsync(command, { 
      cwd: REPO_DIR,
      timeout: 180000, // 3 minutos máximo
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      env: { ...process.env }
    });
    
    // Limpiar archivo temporal
    if (fs.existsSync(promptFile)) {
      fs.unlinkSync(promptFile);
    }
    
    if (stderr && !stderr.includes("warning") && !stderr.includes("INFO")) {
      log("WARN", task.agent, `Aider stderr: ${stderr.substring(0, 200)}`);
    }
    
    const output = stdout || "Código generado exitosamente";
    log("INFO", task.agent, `Aider completó. Output length: ${output.length}`);
    
    return { success: true, output };
  } catch (error: any) {
    log("ERROR", task.agent, `Error ejecutando Aider: ${error.message}`);
    
    // Limpiar archivo temporal si existe
    const promptFile = path.join(REPO_DIR, ".aider-prompt.txt");
    if (fs.existsSync(promptFile)) {
      fs.unlinkSync(promptFile);
    }
    
    return { success: false, output: error.message };
  }
}

function buildAiderPrompt(task: SprintTask): string {
  const basePrompt = `Eres un agente de desarrollo trabajando en la siguiente tarea:\n\nTítulo: ${task.title}\nDescripción: ${task.description}\n\n`;
  
  switch (task.agent) {
    case "dev":
      return basePrompt + `
Por favor:
1. Crea o modifica los archivos necesarios para implementar esta funcionalidad
2. Sigue las mejores prácticas de Clean Code
3. Añade comentarios claros en el código
4. Asegúrate de que el código compile sin errores
5. Si es un proyecto Next.js, usa App Router
`;
    
    case "arch":
      return basePrompt + `
Por favor:
1. Analiza la estructura actual del proyecto
2. Propón mejoras arquitectónicas
3. Crea un documento de arquitectura en /docs/architecture.md
4. Sugiere patrones de diseño apropiados
5. Documenta las decisiones técnicas
`;
    
    case "qa":
      return basePrompt + `
Por favor:
1. Crea tests unitarios para la funcionalidad descrita
2. Usa el framework de testing configurado en el proyecto
3. Asegúrate de que los tests cubran casos edge
4. Ejecuta los tests para verificar que pasan
5. Reporta la cobertura de tests
`;
    
    case "doc":
      return basePrompt + `
Por favor:
1. Actualiza el README.md con información sobre esta funcionalidad
2. Crea documentación en /docs/ si es necesario
3. Añade comentarios JSDoc/TSDoc al código relevante
4. Incluye ejemplos de uso
5. Asegúrate de que la documentación sea clara y completa
`;
    
    case "po":
      return basePrompt + `
Por favor:
1. Analiza los requisitos de la tarea
2. Crea criterios de aceptación claros
3. Documenta las dependencias con otras tareas
4. Estima la complejidad de la tarea
5. Prioriza la tarea en el backlog
`;
    
    default:
      return basePrompt + "Implementa la tarea según las mejores prácticas.";
  }
}

// ✅ COMMIT Y PUSH CON MANEJO DE ERRORES
async function commitAndPush(task: SprintTask): Promise<{ success: boolean; commitHash?: string }> {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const githubRepo = process.env.GITHUB_REPO;
    
    if (!githubToken || !githubOwner || !githubRepo) {
      throw new Error("Faltan credenciales de GitHub en .env.local");
    }
    
    // Detectar rama actual
    const currentBranch = await getCurrentBranch();
    log("INFO", task.agent, `Rama actual: ${currentBranch}`);
    
    // Añadir todos los cambios
    await execAsync(`git add .`, { cwd: REPO_DIR });
    
    // Verificar si hay cambios para commitear
    const { stdout: statusOutput } = await execAsync(`git status --porcelain`, { cwd: REPO_DIR });
    if (!statusOutput.trim()) {
      log("INFO", task.agent, "No hay cambios para commitear");
      return { success: true };
    }
    
    // Crear mensaje de commit descriptivo
    const commitMessage = buildCommitMessage(task);
    
    // Hacer commit
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: REPO_DIR });
    
    // Obtener el hash del commit
    const { stdout: hashOutput } = await execAsync(`git rev-parse HEAD`, { cwd: REPO_DIR });
    const commitHash = hashOutput.trim();
    
    // Configurar remoto con token
    const remoteUrl = `https://${githubToken}@github.com/${githubOwner}/${githubRepo}.git`;
    await execAsync(`git remote set-url origin ${remoteUrl}`, { cwd: REPO_DIR });
    
    // Hacer push
    await execAsync(`git push origin ${currentBranch}`, { cwd: REPO_DIR });
    
    log("AGENT", task.agent, `✅ Commit y push exitoso: ${commitHash.substring(0, 7)}`);
    
    return { success: true, commitHash };
  } catch (error: any) {
    log("ERROR", task.agent, `Error en commit/push: ${error.message}`);
    return { success: false };
  }
}

function buildCommitMessage(task: SprintTask): string {
  const agentEmoji: Record<string, string> = {
    dev: "🛠️",
    arch: "🏗️",
    qa: "🧪",
    doc: "📝",
    po: "📋"
  };
  
  const emoji = agentEmoji[task.agent] || "✨";
  const taskTitle = task.title.replace(/\[.*?\]\s*/, "");
  
  return `${emoji} ${taskTitle}\n\nSprint #1 - Tarea: ${task.id}\nAgente: ${task.agent}\n\nAuto-generated by FabricAgents`;
}

export async function startSprintExecution(): Promise<{ success: boolean; message: string }> {
  console.log("[EXECUTOR] startSprintExecution llamado");
  
  const sprint = loadSprint();
  if (!sprint) {
    console.log("[EXECUTOR] No hay sprint planificado");
    return { success: false, message: "No hay sprint planificado" };
  }
  if (sprint.status === "executing") {
    console.log("[EXECUTOR] Sprint ya está en ejecución");
    return { success: false, message: "El sprint ya está en ejecución" };
  }

  console.log("[EXECUTOR] Sprint cargado:", {
    status: sprint.status,
    tasksCount: sprint.tasks.length,
    tasksStatus: sprint.tasks.map(t => `${t.title}: ${t.status}`)
  });

  // ✅ PREPARAR REPOSITORIO
  const prepResult = await prepareRepository();
  if (!prepResult.success) {
    return { success: false, message: `Error preparando repositorio: ${prepResult.message}` };
  }

  // ✅ CRÍTICO: RESETEAR TODAS LAS TAREAS A "pending"
  console.log("[EXECUTOR] Resetando todas las tareas a 'pending'...");
  for (const task of sprint.tasks) {
    console.log(`[EXECUTOR]   - ${task.title}: ${task.status} → pending`);
    task.status = "pending";
    task.startedAt = undefined;
    task.completedAt = undefined;
    task.output = undefined;
    task.commits = undefined;
  }
  saveSprint(sprint);

  sprint.status = "executing";
  saveSprint(sprint);

  console.log("[EXECUTOR] Sprint actualizado:", {
    status: sprint.status,
    tasksStatus: sprint.tasks.map(t => `${t.title}: ${t.status}`)
  });

  log("SPRINT", "system", `🚀 Sprint #${sprint.sprintNumber} iniciado. ${sprint.tasks.length} tareas en cola.`);
  await sendTelegram(`🚀 ${tg.b("Sprint #" + sprint.sprintNumber + " INICIADO")}\n${sprint.tasks.length} tareas en ejecución.`);

  executeTasksSequentially(sprint).catch((e) => {
    log("ERROR", "executor", `Error en ejecución: ${e?.message}`);
  });

  return { success: true, message: "Sprint iniciado" };
}
async function executeTasksSequentially(sprint: SprintState) {
  log("INFO", "executor", `=== INICIANDO EJECUCIÓN SECUENCIAL ===`);
  log("INFO", "executor", `Total de tareas en sprint: ${sprint.tasks.length}`);
  
  const pendingTasks = sprint.tasks.filter((t) => t.status === "pending");
  log("INFO", "executor", `Tareas pendientes encontradas: ${pendingTasks.length}`);
  
  if (pendingTasks.length === 0) {
    log("WARN", "executor", `⚠️ NO HAY TAREAS PENDIENTES. Estados actuales:`);
    for (const task of sprint.tasks) {
      log("WARN", "executor", `  - ${task.title}: ${task.status}`);
    }
    sprint.status = "completed";
    saveSprint(sprint);
    return;
  }

  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    log("INFO", "executor", `--- Tarea ${i + 1}/${pendingTasks.length}: ${task.title} ---`);
    
    task.status = "working";
    task.startedAt = new Date().toISOString();
    saveSprint(sprint);

    const agentName = getAgentName(task.agent);
    log("AGENT", task.agent, `${agentName} empezó: ${task.title}`);
    await sendTelegram(`⚙️ ${tg.b(agentName)} empezó:\n${tg.i(task.title)}`);

    const startTime = Date.now();

    // ✅ EJECUTAR AIDER
    log("INFO", "executor", `Llamando a executeAider para ${task.agent}...`);
    const aiderResult = await executeAider(task);
    log("INFO", "executor", `executeAider retornó: success=${aiderResult.success}`);
    
    if (!aiderResult.success) {
      task.status = "blocked";
      task.output = `Error en Aider: ${aiderResult.output}`;
      saveSprint(sprint);
      log("ERROR", task.agent, `Tarea bloqueada: ${task.title}`);
      await sendTelegram(`❌ ${tg.b(agentName)} bloqueado:\n${tg.i(task.title)}`);
      continue;
    }

    // ✅ COMMIT Y PUSH
    log("INFO", "executor", `Llamando a commitAndPush para ${task.agent}...`);
    const commitResult = await commitAndPush(task);
    log("INFO", "executor", `commitAndPush retornó: success=${commitResult.success}`);
    
    if (commitResult.success && commitResult.commitHash) {
      task.commits = [commitResult.commitHash];
    }

    task.status = "done";
    task.completedAt = new Date().toISOString();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    task.output = aiderResult.output;
    saveSprint(sprint);

    log("AGENT", task.agent, `${agentName} completó: ${task.title} en ${duration}s`);
    await sendTelegram(`✅ ${tg.b(agentName)} completó:\n${tg.i(task.title)}\n⏱️ ${duration}s${commitResult.commitHash ? `\n🔗 Commit: ${commitResult.commitHash.substring(0, 7)}` : ""}`);

    await new Promise((r) => setTimeout(r, 2000));
  }

  sprint.status = "completed";
  saveSprint(sprint);
  log("SPRINT", "system", `🎉 Sprint #${sprint.sprintNumber} COMPLETADO`);
  await sendTelegram(`🎉 ${tg.b("SPRINT #" + sprint.sprintNumber + " COMPLETADO")}\nTodas las tareas finalizadas.`);
}

function getAgentName(agent: string): string {
  const names: Record<string, string> = {
    po: "Product Owner",
    arch: "Arquitecto",
    dev: "Developer",
    qa: "QA Engineer",
    doc: "Technical Writer",
  };
  return names[agent] || agent;
}