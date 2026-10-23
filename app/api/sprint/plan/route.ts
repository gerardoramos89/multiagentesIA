import { NextRequest, NextResponse } from "next/server";
import { saveSprint, type SprintState, type SprintTask } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    const { agents, brief } = await req.json();
    
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });
    }

    // 1. Generar las tareas (siempre hacemos esto primero)
    const tasksData = generateSprintTasks(brief, agents);
    const sprintTasks: SprintTask[] = tasksData.map((task, i) => ({
      id: `task-${Date.now()}-${i}`,
      title: task.title,
      description: task.description,
      agent: task.agent,
      status: "pending"
    }));

    // 2. ✅ CREAR EL ESTADO LOCAL SIEMPRE (incluso si Trello ya tiene las tarjetas)
    const newSprint: SprintState = {
      sprintNumber: 1,
      startedAt: new Date().toISOString(),
      approvedBy: "human",
      tasks: sprintTasks,
      status: "planned"
    };
    
    saveSprint(newSprint); // ¡Esto garantiza que el archivo exista!

    // 3. Verificar si ya existe en Trello
    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`);
    const existingCards = await cardsRes.json();
    const sprintAlreadyPlanned = existingCards.some((card: any) => card.name.includes("🚀 Sprint 1: Planificación"));

    if (sprintAlreadyPlanned) {
      return NextResponse.json({ 
        success: true, 
        alreadyExists: true,
        message: "El Sprint ya estaba planificado en Trello. Estado local sincronizado correctamente." 
      }, { status: 200 });
    }

    // 4. Si no existe en Trello, lo creamos
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`);
    const lists = await listsRes.json();
    const sprintList = lists.find((l: any) => /sprint|actual/i.test(l.name)) || lists[0];

    const motherCardRes = await fetch("https://api.trello.com/1/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key, token, idList: sprintList.id,
        name: "🚀 Sprint 1: Planificación y Revisión Humana",
        desc: `Este sprint fue generado automáticamente para el proyecto **${brief.projectName}**.\n\nPor favor, revisa las tareas hijas y aprueba la ejecución.`,
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
      message: `Sprint planificado con éxito.`
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error en /api/sprint/plan:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

function generateSprintTasks(brief: any, agents: any[]) {
  const tasks = [];
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