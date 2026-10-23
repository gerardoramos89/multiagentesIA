import { NextRequest, NextResponse } from "next/server";
import { saveSprint, getNextSprintNumber, getLessonsLearned, type SprintState, type SprintTask } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch {}

    const { agents, brief } = body;
    
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });
    }

    // ✅ Obtener lecciones aprendidas del sprint anterior
    const lessonsLearned = getLessonsLearned();
    const sprintNumber = getNextSprintNumber();

    // Generar tareas con contexto de lecciones aprendidas
    const tasksData = generateSprintTasks(brief, agents, lessonsLearned, sprintNumber);
    const sprintTasks: SprintTask[] = tasksData.map((task, i) => ({
      id: `task-${Date.now()}-${i}`,
      title: task.title,
      description: task.description,
      agent: task.agent,
      status: "pending"
    }));

    const newSprint: SprintState = {
      sprintNumber,
      startedAt: new Date().toISOString(),
      approvedBy: "human",
      tasks: sprintTasks,
      status: "planned",
      lessonsLearned
    };
    
    saveSprint(newSprint);

    // Verificar si ya existe en Trello
    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`);
    const existingCards = await cardsRes.json();
    const sprintAlreadyPlanned = existingCards.some((card: any) => card.name.includes(`🚀 Sprint ${sprintNumber}`));

    if (sprintAlreadyPlanned) {
      return NextResponse.json({ 
        success: true, 
        alreadyExists: true,
        message: `El Sprint ${sprintNumber} ya estaba planificado en Trello.` 
      }, { status: 200 });
    }

    // Crear en Trello
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`);
    const lists = await listsRes.json();
    const sprintList = lists.find((l: any) => /sprint|actual/i.test(l.name)) || lists[0];

    const motherCardRes = await fetch("https://api.trello.com/1/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key, token, idList: sprintList.id,
        name: `🚀 Sprint ${sprintNumber}: Planificación`,
        desc: `Sprint generado automáticamente para el proyecto **${brief.projectName}**.\n\n${lessonsLearned.length > 0 ? `\n📚 Lecciones aprendidas del sprint anterior:\n${lessonsLearned.map(l => `- ${l}`).join('\n')}` : ''}`,
        pos: "top"
      })
    });
    const motherCard = await motherCardRes.json();

    for (const task of tasksData) {
      await fetch("https://api.trello.com/1/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key, token, idList: sprintList.id,
          name: task.title,
          desc: `${task.description}\n\n---\n⚠️ **PENDIENTE DE APROBACIÓN HUMANA**`,
          pos: "bottom"
        })
      });
    }

    return NextResponse.json({ 
      success: true, 
      alreadyExists: false,
      tasksCount: sprintTasks.length,
      motherCardUrl: motherCard.url,
      sprintNumber,
      lessonsLearnedCount: lessonsLearned.length,
      message: `Sprint ${sprintNumber} planificado con éxito.`
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error en /api/sprint/plan:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function generateSprintTasks(brief: any, agents: any[], lessonsLearned: string[], sprintNumber: number) {
  const tasks = [];
  
  // Si hay lecciones aprendidas, añadir tarea de revisión
  if (lessonsLearned.length > 0 && sprintNumber > 1) {
    tasks.push({
      title: "📚 [PO] Revisar lecciones aprendidas del sprint anterior",
      description: `Revisar las lecciones aprendidas del sprint anterior:\n${lessonsLearned.map(l => `- ${l}`).join('\n')}\n\nAsegurar que estas lecciones se apliquen en este sprint.`,
      agent: "po"
    });
  }
  
  if (brief.type === "new" || brief.type === "legacy") {
    tasks.push({
      title: "🏗️ [DEV] Configurar estructura base y dependencias",
      description: `Crear la estructura inicial de carpetas y archivos para ${brief.projectName}.\nStack: ${brief.stack.frameworks.join(", ")}\nCriterios: Estructura de carpetas según convenciones, archivos de configuración básicos, README actualizado.`,
      agent: "dev"
    });
  }
  if (brief.type === "existing") {
    tasks.push({
      title: "🔍 [ARCH] Auditoría de código y propuesta de refactorización",
      description: `Revisar el código existente en ${brief.projectName}.\nAnalizar: Estructura actual, patrones utilizados, deuda técnica (${brief.status.estimatedDebt}).`,
      agent: "arch"
    });
  }
  
  tasks.push({
    title: "📝 [DOC] Documentación inicial y guía de contribución",
    description: `Documentar el proyecto ${brief.projectName}.\nIncluir: README con instalación y uso, Guía de contribución, Documentación de API (si aplica).`,
    agent: "doc"
  });
  
  tasks.push({
    title: "🧪 [QA] Configurar sistema de tests y primer caso de prueba",
    description: `Configurar ${brief.stack.tools.test || "Jest"} para el proyecto.\nIncluir: Configuración inicial, primer test de ejemplo, script en package.json.`,
    agent: "qa"
  });
  
  return tasks;
}