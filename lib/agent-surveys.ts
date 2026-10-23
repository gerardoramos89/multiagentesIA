import { log } from "./system-log";
import { notifySurveyCreated } from "./telegram";
import { loadBrief, saveBrief } from "./analysis/brief";

export interface SurveyQuestion { id: string; question: string; options: string[]; blocking: boolean; reason: string; }
export interface CreateSurveyInput { agentRole: string; title: string; questions: SurveyQuestion[]; sprintContext: { sprintNumber: number | null; sprintGoal: string; phase: string; stackSummary: string; blockedTasks: string[] }; }
export interface CreateSurveyResult { ok: boolean; cardUrl?: string; cardId?: string; message: string; }

export async function createSurveyWithWriterContext(input: CreateSurveyInput): Promise<CreateSurveyResult> {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  const boardId = process.env.TRELLO_BOARD_ID;
  if (!key || !token || !boardId) return { ok: false, message: "Faltan credenciales de Trello" };

  try {
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`);
    const lists = await listsRes.json();
    const reviewList = lists.find((l: any) => /review/i.test(l.name)) ?? lists[Math.max(0, lists.length - 2)];
    if (!reviewList) return { ok: false, message: "No hay lista Review en Trello" };

    const timestamp = new Date().toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    const cardTitle = `📋 [ENCUESTA] ${input.title}`;
    const questionsBlock = input.questions.map((q, i) => `${i + 1}. **${q.question}** ${q.blocking ? "🔴 BLOQUEANTE" : ""}\n` + q.options.map((o) => `   - [ ] ${o}`).join("\n") + `\n   _Razón: ${q.reason}_`).join("\n\n");
    const cardDesc = [`**Agente que pregunta:** @${input.agentRole}`, `**Creada:** ${timestamp}`, ``, `## Preguntas`, questionsBlock, ``, `---`, `⚠️ **Esta tarjeta NO se cierra sola.** Requiere respuesta humana.`].join("\n");

    const createRes = await fetch("https://api.trello.com/1/cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, token, idList: reviewList.id, name: cardTitle, desc: cardDesc, pos: "top" }) });
    if (!createRes.ok) throw new Error(`Trello ${createRes.status}`);
    const card = await createRes.json();

    const writerComment = buildTechnicalWriterComment(input);
    await fetch(`https://api.trello.com/1/cards/${card.id}/actions/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, token, text: writerComment }) });

    const brief = loadBrief();
    if (brief) { brief.decisionsPending = [...(brief.decisionsPending ?? []), ...input.questions]; saveBrief(brief); }

    log("SURVEY", input.agentRole, `Encuesta creada: ${input.title}`, { cardId: card.id, cardUrl: card.url });
    notifySurveyCreated(input.agentRole, input.title, card.url);
    return { ok: true, cardUrl: card.url, cardId: card.id, message: "Encuesta creada" };
  } catch (e: any) {
    log("ERROR", "surveys", `Error creando encuesta: ${e?.message}`);
    return { ok: false, message: e?.message ?? "Error" };
  }
}

function buildTechnicalWriterComment(input: CreateSurveyInput): string {
  const s = input.sprintContext;
  return [`📚 **Contexto del Sprint Actual**`, ``, `**Sprint:** ${s.sprintNumber != null ? `#${String(s.sprintNumber).padStart(2, "0")}` : "— (aún no definido)"}`, `**Fase:** ${s.phase}`, `**Objetivo:** ${s.sprintGoal || "—"}`, ``, `**¿Por qué se necesita esta decisión?**`, `El agente ${input.agentRole} necesita esta información para continuar.`, ``, `**Impacto en el proyecto:**`, s.blockedTasks.length ? `- Bloquea ${s.blockedTasks.length} tarea(s):\n` + s.blockedTasks.map((t) => `  • ${t}`).join("\n") : `- No bloquea tareas críticas.`, ``, `**Estado del contrato técnico:**`, `- Stack detectado: ${s.stackSummary || "—"}`, ``, `⏳ **Esperando respuesta del humano para continuar.**`].join("\n");
}