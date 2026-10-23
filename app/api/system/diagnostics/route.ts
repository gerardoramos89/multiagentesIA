import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { log } from "@/lib/system-log";

const execFileAsync = promisify(execFile);
const OLLAMA_URL = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");

export async function POST() {
  const started = Date.now();
  const results: any[] = [];
  let models: string[] = [];

  const check = async (id: string, label: string, fn: () => Promise<any>) => {
    const start = Date.now();
    try {
      const res = await fn();
      results.push({ id, label, status: res.status, detail: res.detail, version: res.version, timestamp: new Date().toISOString(), durationMs: Date.now() - start });
    } catch (err: any) {
      results.push({ id, label, status: "error", detail: err.message || "Error desconocido", timestamp: new Date().toISOString(), durationMs: Date.now() - start });
    }
  };

  // 1. OLLAMA
  await check("ollama", "Ollama (Motor Local)", async () => {
    try {
      const versionRes = await fetch(`${OLLAMA_URL}/api/version`, { signal: AbortSignal.timeout(5000) });
      if (!versionRes.ok) throw new Error(`Ollama no responde en ${OLLAMA_URL}`);
      const versionData = await versionRes.json();
      const version = versionData.version || "desconocida";

      const tagsRes = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
      const tags = await tagsRes.json();
      models = (tags.models ?? []).map((m: any) => String(m.name));

      if (models.length === 0) {
        return { status: "warning", detail: "Motor responde, pero no hay modelos. Ejecuta: ollama pull hermes3:8b", version };
      }

      const testModel = models.includes("hermes3:8b") ? "hermes3:8b" : models[0];
      const inferenceRes = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: testModel, prompt: "Responde solo OK", stream: false, options: { num_predict: 5, temperature: 0 } }),
        signal: AbortSignal.timeout(30000),
      });
      const inference = await inferenceRes.json();
      const answer = String(inference.response ?? "").trim().slice(0, 40);

      return { status: "ok", detail: `${models.length} modelo(s) · inferencia en ${testModel} → "${answer || "sin texto"}"`, version };
    } catch (err: any) {
      if (err.message?.includes("ECONNREFUSED")) {
        return { status: "error", detail: `Ollama no responde en ${OLLAMA_URL}. Inicia con: ollama serve` };
      }
      return { status: "error", detail: err.message };
    }
  });

  // 2. DEEPSEEK
  await check("deepseek", "DeepSeek V2 (Código)", async () => {
    const wanted = process.env.DEEPSEEK_MODEL || "deepseek-coder-v2:16b";
    const found = models.find((m) => m === wanted || m.startsWith(wanted.split(":")[0]));
    if (!found) return { status: "error", detail: `Modelo no descargado. Ejecuta: ollama pull ${wanted}` };
    return { status: "ok", detail: `Modelo listo: ${found}`, version: found };
  });

  // 3. HERMES
  await check("hermes", "Hermes 3 (Chat/Docs)", async () => {
    const wanted = process.env.HERMES_MODEL || "hermes3:8b";
    const found = models.find((m) => m === wanted || m.startsWith(wanted.split(":")[0]));
    if (!found) return { status: "error", detail: `Modelo no descargado. Ejecuta: ollama pull ${wanted}` };
    return { status: "ok", detail: `Modelo listo: ${found}`, version: found };
  });

  // 4. AIDER
  await check("aider", "Aider (Ejecutor Git)", async () => {
    const bin = process.env.AIDER_PATH || "aider";
    try {
      const { stdout } = await execFileAsync(bin, ["--version"], { timeout: 10000, windowsHide: true });
      const version = stdout.trim().split("\n")[0] || "versión no reportada";
      return { status: "ok", detail: `Ejecutable respondiendo: ${bin}`, version };
    } catch (err: any) {
      if (err.code === "ENOENT") return { status: "error", detail: `No se encuentra "${bin}". Instala: pip install aider-chat` };
      if (err.killed) return { status: "error", detail: "Aider no respondió en 10 segundos" };
      return { status: "error", detail: `Aider falló: ${String(err.stderr || err.message).trim()}` };
    }
  });

  // 5. GITHUB
  await check("github", "GitHub (Repositorios)", async () => {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    if (!token || !owner || !repo) return { status: "error", detail: "Faltan GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO en .env.local" };

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 401) return { status: "error", detail: "Token inválido o expirado" };
      if (res.status === 403) return { status: "error", detail: "Token sin permisos o límite de peticiones" };
      if (res.status === 404) return { status: "error", detail: `Repositorio ${owner}/${repo} no existe o sin acceso` };
      if (!res.ok) throw new Error(`GitHub respondió HTTP ${res.status}`);

      const data = await res.json();
      return { status: "ok", detail: `${owner}/${repo} accesible · rama ${data.default_branch}`, version: data.default_branch };
    } catch (err: any) {
      return { status: "error", detail: err.message };
    }
  });

  // 6. TRELLO
  await check("trello", "Trello (Gestión)", async () => {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    if (!key || !token || !boardId) return { status: "error", detail: "Faltan TRELLO_API_KEY / TRELLO_TOKEN / TRELLO_BOARD_ID en .env.local" };

    try {
      const res = await fetch(`https://api.trello.com/1/boards/${boardId}?key=${key}&token=${token}`, { signal: AbortSignal.timeout(10000) });
      if (res.status === 401) return { status: "error", detail: "Credenciales de Trello inválidas" };
      if (res.status === 404) return { status: "error", detail: `Tablero ${boardId} no existe o sin acceso` };
      if (!res.ok) throw new Error(`Trello respondió HTTP ${res.status}`);

      const data = await res.json();
      return { status: "ok", detail: `Tablero "${data.name}" accesible`, version: boardId };
    } catch (err: any) {
      return { status: "error", detail: err.message };
    }
  });

  const ready = results.filter((r) => ["ollama", "github", "trello"].includes(r.id)).every((r) => r.status === "ok");
  log("INFO", "diagnostics", `Diagnóstico completado. Ready: ${ready}`, { durationMs: Date.now() - started });

  return NextResponse.json({
    ready,
    results,
    trelloLog: { ok: ready, message: "Bitácora registrada", timestamp: new Date().toLocaleString("es-ES") },
    durationMs: Date.now() - started,
  });
}