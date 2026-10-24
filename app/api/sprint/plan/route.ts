import { NextRequest, NextResponse } from "next/server";
import { saveSprint, getNextSprintNumber, getLessonsLearned, type SprintState, type SprintTask } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) body = JSON.parse(text);
    } catch {}

    const { vision, customTasks } = body;
    const lessonsLearned = getLessonsLearned();
    const sprintNumber = getNextSprintNumber();
    const projectName = vision?.name || "el proyecto";

    let tasksData: any[] = [];

    // ✅ 1. PROCESAR TAREAS PERSONALIZADAS CON DETECCIÓN INTELIGENTE DE AGENTES
    if (customTasks && customTasks.length > 0) {
      for (const t of customTasks) {
        const upper = t.toUpperCase();
        let agent = "dev";
        let title = t;
        
        // Detectar prefijos (incluyendo combinados como [ARCH/DEV])
        if (upper.includes("[ARCH")) { agent = "arch"; title = t.replace(/\[ARCH\/?DEV?\]\s*/i, "").trim(); }
        else if (upper.includes("[PO")) { agent = "po"; title = t.replace(/\[PO\/?\w*\]\s*/i, "").trim(); }
        else if (upper.includes("[QA")) { agent = "qa"; title = t.replace(/\[QA\/?\w*\]\s*/i, "").trim(); }
        else if (upper.includes("[DOC")) { agent = "doc"; title = t.replace(/\[DOC\/?\w*\]\s*/i, "").trim(); }
        else if (upper.includes("[DEV")) { agent = "dev"; title = t.replace(/\[DEV\/?\w*\]\s*/i, "").trim(); }
        
        tasksData.push({ title, description: t, agent });
      }
    }

    // ✅ 2. GARANTIZAR QUE TODOS LOS AGENTES PARTICIPEN
    const agentsWithTasks = new Set(tasksData.map(t => t.agent));
    
    // Si el PO no tiene tarea, añadir análisis estratégico
    if (!agentsWithTasks.has("po")) {
      tasksData.unshift({
        title: `📋 [PO] Análisis estratégico y planificación de ${projectName}`,
        description: `Como Product Owner, analiza el estado actual de ${projectName}. Revisa las lecciones aprendidas del sprint anterior (${lessonsLearned.slice(0, 2).join(', ') || 'sin lecciones previas'}) y define los criterios de éxito para este sprint. Genera un documento STRATEGY.md con: 1) Objetivos del sprint, 2) Criterios de aceptación, 3) Riesgos identificados, 4) Métricas de éxito.`,
        agent: "po"
      });
    }
    
    // Si el ARQ no tiene tarea, añadir diseño de arquitectura
    if (!agentsWithTasks.has("arch")) {
      tasksData.push({
        title: `🏗️ [ARCH] Diseño de arquitectura para ${projectName}`,
        description: `Como Arquitecto, revisa el código actual de ${projectName} y propón mejoras de arquitectura. Genera un archivo ARCHITECTURE.md con: 1) Diagrama de componentes (en texto), 2) Patrones de diseño recomendados, 3) Estructura de carpetas óptima, 4) Decisiones técnicas clave (ADR), 5) Deuda técnica identificada y cómo resolverla.`,
        agent: "arch"
      });
    }
    
    // Si DEV no tiene tarea, añadir implementación
    if (!agentsWithTasks.has("dev")) {
      tasksData.push({
        title: `💻 [DEV] Implementación de funcionalidades clave`,
        description: `Como Developer, implementa las funcionalidades principales pendientes de ${projectName}. Revisa ARCHITECTURE.md y STRATEGY.md para seguir los lineamientos. Enfócate en código limpio, modular y bien comentado.`,
        agent: "dev"
      });
    }
    
    // Si QA no tiene tarea, añadir revisión de calidad
    if (!agentsWithTasks.has("qa")) {
      tasksData.push({
        title: `🧪 [QA] Revisión de calidad y pruebas`,
        description: `Como QA Engineer, revisa TODO el código generado en este sprint. Crea un archivo QA_REPORT.md con: 1) Bugs encontrados, 2) Cobertura de tests, 3) Recomendaciones de mejora, 4) Casos de prueba críticos. Si es posible, crea tests unitarios funcionales.`,
        agent: "qa"
      });
    }
    
    // Si DOC no tiene tarea, añadir documentación
    if (!agentsWithTasks.has("doc")) {
      tasksData.push({
        title: `📝 [DOC] Documentación completa del sprint`,
        description: `Como Technical Writer, actualiza el README.md de ${projectName} para que sea la GUÍA VIVA del proyecto. Debe incluir: 1) Descripción actualizada, 2) Estado del desarrollo, 3) Historial de sprints, 4) Guía de instalación y uso, 5) Próximos pasos. Hazlo profesional y estructurado.`,
        agent: "doc"
      });
    }

    // ✅ 3. AÑADIR TAREA FINAL DE RETROSPECTIVA DEL PO
    tasksData.push({
      title: "📊 [PO] Retrospectiva y propuesta de mejora para el próximo sprint",
      description: `Como Product Owner, al finalizar este sprint: 1) Analiza qué se logró vs lo planeado, 2) Identifica patrones de éxito y fracaso, 3) Propón 3-5 mejoras concretas para el próximo sprint, 4) Genera un archivo RETROSPECTIVE_SUGGESTIONS.md con recomendaciones estratégicas basadas en el rendimiento del equipo.`,
      agent: "po"
    });

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
      lessonsLearned,
      vision
    };
    
    saveSprint(newSprint);

    return NextResponse.json({ 
      success: true, 
      tasksCount: sprintTasks.length,
      sprintNumber,
      agentsInvolved: Array.from(new Set(sprintTasks.map(t => t.agent))),
      message: `Sprint ${sprintNumber} planificado con ${sprintTasks.length} tareas para todos los agentes.`
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error en /api/sprint/plan:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}