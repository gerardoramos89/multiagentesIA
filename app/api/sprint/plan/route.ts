import { NextRequest, NextResponse } from "next/server";
import { saveSprint, getNextSprintNumber, getLessonsLearned, type SprintState, type SprintTask } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const text = await req.text();
      if (text && text.trim().length > 0) body = JSON.parse(text);
    } catch {}

    const { agents, brief, vision, customTasks } = body;
    const lessonsLearned = getLessonsLearned();
    const sprintNumber = getNextSprintNumber();

    let tasksData: any[] = [];

    if (customTasks && customTasks.length > 0) {
      for (const t of customTasks) {
        let agent = "dev"; // Por defecto
        let title = t;
        
        // ✅ Detectar prefijos para asignar el agente correcto
        if (t.toUpperCase().startsWith("[QA]")) { agent = "qa"; title = t.substring(4).trim(); }
        else if (t.toUpperCase().startsWith("[DOC]")) { agent = "doc"; title = t.substring(5).trim(); }
        else if (t.toUpperCase().startsWith("[ARCH]")) { agent = "arch"; title = t.substring(6).trim(); }
        else if (t.toUpperCase().startsWith("[PO]")) { agent = "po"; title = t.substring(4).trim(); }
        
        tasksData.push({
          title: `🛠️ [${agent.toUpperCase()}] ${title}`,
          description: `Implementar: ${title}. Contexto: ${vision?.generalObjective || 'Sin contexto específico'}`,
          agent
        });
      }
    } else {
      // Generación dinámica si no hay tareas personalizadas
      const projectName = vision?.name || brief?.projectName || "el proyecto";
      const skills = vision?.targetSkills || brief?.stack?.frameworks?.join(", ") || "tecnologías estándar";
      
      tasksData = [
        { title: `🏗️ [ARCH] Diseñar arquitectura para ${projectName}`, description: `Definir estructura y patrones para ${projectName} usando ${skills}.`, agent: "arch" },
        { title: `💻 [DEV] Implementar funcionalidad principal`, description: `Desarrollar el núcleo de ${projectName}. Objetivo: ${vision?.generalObjective || 'Cumplir requisitos'}.`, agent: "dev" },
      ];
    }

    // ✅ GARANTIZAR QUE DOC Y QA SIEMPRE ACTÚEN AL FINAL DEL SPRINT
    tasksData.push({
      title: "📝 [DOC] Actualizar documentación y README del sprint",
      description: "Actualizar el README.md con los avances, nuevos archivos, cambios de arquitectura y guía de uso de este sprint.",
      agent: "doc"
    });
    tasksData.push({
      title: "🧪 [QA] Revisión de calidad y pruebas del sprint",
      description: "Verificar que el código generado cumpla con los estándares, revisar errores y añadir/actualizar tests unitarios.",
      agent: "qa"
    });

    // Añadir tarea de lecciones aprendidas si aplica
    if (lessonsLearned.length > 0 && sprintNumber > 1) {
      tasksData.unshift({
        title: "📚 [PO] Aplicar lecciones aprendidas del sprint anterior",
        description: `Revisar y asegurar la aplicación de: ${lessonsLearned.slice(0, 2).join(', ')}`,
        agent: "po"
      });
    }

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
      message: `Sprint ${sprintNumber} planificado con ${sprintTasks.length} tareas.`
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error en /api/sprint/plan:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}