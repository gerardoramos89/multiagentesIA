import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");

export type DiagStatus = "ok" | "warning" | "error";

export interface DiagResult {
  id: string;
  label: string;
  status: DiagStatus;
  detail: string;
  version?: string;
  timestamp: string;
  durationMs: number;
}

export interface TrelloLogResult {
  ok: boolean;
  message: string;
  url?: string;
  lists?: string[];
  timestamp?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function ollamaJson(path: string, options: RequestInit = {}, timeout = 8000) {
  const res = await fetch(`${OLLAMA_URL}${path}`, {
    ...options,
    signal: AbortSignal.timeout(timeout),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Ollama respondió HTTP ${res.status}`);
  return res.json();
}

export async function runDiagnostics(): Promise<DiagResult[]> {
  const results: DiagResult[] = [];
  let models: string[] = [];

  const check = async (id: string, label: string, fn: () => Promise<{ status: DiagStatus; detail: string; version?: string }>) => {
    const started = Date.now();
    let outcome: { status: DiagStatus; detail: string; version?: string };
    try {
      outcome = await fn();
    } catch (err: any) {
      const code = err?.cause?.code;
      let detail = err?.name === "TimeoutError" || err?.name === "AbortError"
        ? "Tiempo de espera agotado"
        : (err?.message || "Error desconocido");

      if (code === "ECONNREFUSED" && id === "ollama") {
        detail = `Ollama no responde en ${OLLAMA_URL}. Inicia el servicio con: ollama serve`;
      }
      outcome = { status: "error", detail };
    }
    results.push({
      id, label, status: outcome.status, detail: outcome.detail,
      version: outcome.version,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - started,
    });
  };

  await check("ollama", "Ollama (motor local)", async () => {
    const versionData = await ollamaJson("/api/version");
    const tags = await ollamaJson("/api/tags");
    models = (tags.models ?? []).map((m: any) => String(m.name));
    const version = String(versionData.version ?? "desconocida");

    if (models.length === 0) {
      return { status: "warning", detail: "El motor responde, pero no hay modelos. Ejecuta: ollama pull hermes3:8b", version };
    }

    const preferred = process.env.OLLAMA_TEST_MODEL || process.env.HERMES_MODEL || "hermes3:8b";
    const testModel = models.includes(preferred) ? preferred : models[0];

    const inference = await ollamaJson("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: testModel,
        prompt: "Responde solamente con la palabra OK",
        stream: false,
        options: { num_predict: 5, temperature: 0 },
      }),
    }, 30000);

    const answer = String(inference.response ?? "").trim().slice(0, 40);
    return {
      status: "ok",
      detail: `${models.length} modelo(s) · inferencia real en ${testModel} → "${answer || "sin texto"}"`,
      version,
    };
  });

  await check("deepseek", "DeepSeek V2 (código)", async () => {
    const wanted = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const found = models.find((m) => m === wanted || m.startsWith(wanted.split(":")[0]));
    if (!found) return { status: "error", detail: `Modelo no descargado. Ejecuta: ollama pull ${wanted}` };
    return { status: "ok", detail: `Modelo listo para el Arquitecto y Developer: ${found}`, version: found };
  });

  await check("hermes", "Hermes 3 (chat / docs)", async () => {
    const wanted = process.env.HERMES_MODEL || "hermes3:8b";
    const found = models.find((m) => m === wanted || m.startsWith(wanted.split(":")[0]));
    if (!found) return { status: "error", detail: `Modelo no descargado. Ejecuta: ollama pull ${wanted}` };
    return { status: "ok", detail: `Modelo listo para PO y Documentador: ${found}`, version: found };
  });

  await check("aider", "Aider (ejecutor Git)", async () => {
    const bin = process.env.AIDER_PATH || "aider";
    try {
      const { stdout } = await execFileAsync(bin, ["--version"], { timeout: 10000, windowsHide: true });
      const version = stdout.trim().split("\n")[0] || "versión no reportada";
      return { status: "ok", detail: `Ejecutable respondiendo correctamente: ${bin}`, version };
    } catch (err: any) {
      if (err?.code === "ENOENT") {
        return { status: "error", detail: `No se encuentra "${bin}". Instala: pip install aider-chat` };
      }
      if (err?.killed) return { status: "error", detail: "Aider no respondió en 10 segundos" };
      return { status: "error", detail: `Aider falló: ${String(err?.stderr || err?.message).trim()}` };
    }
  });

  await check("github", "GitHub (repositorio)", async () => {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    if (!token || !owner || !repo) {
      return { status: "error", detail: "Faltan GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO en .env.local" };
    }
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (res.status === 401) return { status: "error", detail: "Token inválido o expirado." };
    if (res.status === 403) return { status: "error", detail: "Token sin permisos o límite de peticiones." };
    if (res.status === 404) return { status: "error", detail: `Repositorio ${owner}/${repo} no existe o sin acceso.` };
    if (!res.ok) throw new Error(`GitHub respondió HTTP ${res.status}`);

    const data = await res.json();
    return {
      status: "ok",
      detail: `${owner}/${repo} accesible · rama ${data.default_branch} · ${data.private ? "privado" : "público"}`,
      version: data.default_branch,
    };
  });

  return results;
}

export async function registerInTrello(results: DiagResult[]): Promise<TrelloLogResult> {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  const boardId = process.env.TRELLO_BOARD_ID;

  if (!key || !token || !boardId) {
    return { ok: false, message: "Faltan credenciales de Trello en .env.local" };
  }

  const stamp = new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "medium" });

  try {
    const listsRes = await fetch(
      `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!listsRes.ok) throw new Error(`Trello respondió HTTP ${listsRes.status}`);
    const lists = await listsRes.json();
    if (!lists.length) throw new Error("El tablero no tiene listas abiertas");

    const okCount = results.filter((r) => r.status === "ok").length;
    
    // Descripción Markdown idéntica a lo que se muestra en el UI
    const desc = [
      "## 🩺 Diagnóstico de Pre-Vuelo — FabricAgents",
      `**Fecha:** ${stamp}`,
      `**Estado General:** ${results.every(r => r.status === "ok") ? "✅ LISTO PARA DESPEGAR" : "⚠️ REQUIERE ATENCIÓN"}`,
      "",
      "### 📊 Resultados de Checks",
      ...results.map((r) => {
        const icon = r.status === "ok" ? "✅" : r.status === "warning" ? "⚠️" : "❌";
return `${icon} **${r.label}** (${r.durationMs}ms)\n   _${r.detail}_${r.version ? ` · v/${r.version}` : ""}`;
      }),
      "",
      "### 🔄 Flujo de Bitácora Recorrido",
      lists.map((l: any) => l.name).join(" ➔ "),
      "",
      "_Generado automáticamente por el sistema de diagnóstico de FabricAgents._",
    ].join("\n");

    const createRes = await fetch("https://api.trello.com/1/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key, token,
        idList: lists[0].id,
        name: `🩺 Pre-Vuelo · ${stamp}`,
        desc: desc, // <-- Campo correcto para descripción en Trello
        pos: "top",
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!createRes.ok) throw new Error(`No se pudo crear la tarjeta (HTTP ${createRes.status})`);
    const card = await createRes.json();

    for (const list of lists.slice(1)) {
      await fetch(`https://api.trello.com/1/cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, token, idList: list.id }),
        signal: AbortSignal.timeout(10000),
      });
      await sleep(600);
    }

    return {
      ok: true,
      message: `Bitácora registrada y movida por ${lists.length} listas`,
      url: card.url,
      lists: lists.map((l: any) => String(l.name)),
      timestamp: stamp,
    };
  } catch (err: any) {
    return { ok: false, message: err?.message || "Error registrando la bitácora en Trello" };
  }
}