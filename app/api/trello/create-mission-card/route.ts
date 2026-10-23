import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/system-log";

// Tarjeta de misión del análisis (se actualiza, no se duplica).
const MISSION_MARKER = "<!-- mission:analysis -->";

export async function POST(req: NextRequest) {
  try {
    const { jobId, repo, phase, progress, message, result, error } =
      await req.json();

    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    if (!key || !token || !boardId) {
      return NextResponse.json(
        { success: false, message: "Faltan credenciales Trello" },
        { status: 400 }
      );
    }

    // 1. Buscar tarjeta de misión existente
    const cardsRes = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`
    );
    const cards = await cardsRes.json();
    let card = cards.find(
      (c: any) => c.desc && c.desc.includes(MISSION_MARKER)
    );

    // 2. Si no existe, crearla en "Configuración GRTEC"
    if (!card) {
      const listsRes = await fetch(
        `https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`
      );
      const lists = await listsRes.json();
      const grtecList =
        lists.find((l: any) => /grtec|configuraci[oó]n/i.test(l.name)) ?? lists[0];

      const createRes = await fetch("https://api.trello.com/1/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          token,
          idList: grtecList.id,
          name: `🔬 Análisis · ${repo} · ${jobId}`,
          desc: `${MISSION_MARKER}\nJob ID: ${jobId}\nRepo: ${repo}`,
          pos: "top",
        }),
      });
      card = await createRes.json();
    }

    // 3. Actualizar descripción con checklist de fases
    const phases = [
      { key: "auth", label: "Autenticación y rate limit" },
      { key: "metadata", label: "Metadata del repo" },
      { key: "tree", label: "Árbol de archivos" },
      { key: "files", label: "Archivos clave" },
      { key: "frameworks", label: "Frameworks y herramientas" },
      { key: "quality", label: "Calidad y deuda técnica" },
      { key: "decisions", label: "Decisiones pendientes" },
      { key: "brief", label: "Brief del proyecto" },
      { key: "done", label: "Completado" },
    ];

    const checklist = phases
      .map((p) => {
        const done =
          (phase === "done" && p.key !== "done") ||
          (p.key === phase && progress >= 95) ||
          // fases ya pasadas según progreso aproximado
          phaseOrder(p.key) < phaseOrder(phase);
        return `- [${done ? "x" : " "}] ${p.label}`;
      })
      .join("\n");

    const newDesc = [
      MISSION_MARKER,
      `Job ID: ${jobId}`,
      `Repo: ${repo}`,
      ``,
      `**Estado:** ${phase} (${progress}%)`,
      `**Mensaje:** ${message ?? ""}`,
      error ? `**Error:** ${error}` : "",
      ``,
      `## Progreso`,
      checklist,
      ``,
      result
        ? `## Resultado\n- Tipo: ${result.type}\n- Commits: ${result.status?.commits}\n- Stars: ${result.status?.stars}\n- Frameworks: ${(result.stack?.frameworks ?? []).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    await fetch(`https://api.trello.com/1/cards/${card.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, token, desc: newDesc }),
    });

    log("INFO", "mission", `Tarjeta de misión actualizada: ${card.id}`);

    return NextResponse.json({ success: true, cardId: card.id, cardUrl: card.url });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? "Error" },
      { status: 500 }
    );
  }
}

function phaseOrder(p: string): number {
  const order = [
    "queued",
    "auth",
    "metadata",
    "tree",
    "files",
    "frameworks",
    "quality",
    "decisions",
    "brief",
    "done",
    "error",
  ];
  return order.indexOf(p);
}