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

    // ✅ Si el usuario proporcionó tareas personalizadas, úsalas
    if (customTasks && customTasks.length > 0) {
      tasksData = customTasks.map((t: string, i: number) => ({
        title: `🛠️ [DEV] ${t}`,
        description: `Implementar: ${t}. Contexto del proyecto: ${vision?.generalObjective || 'Sin contexto'}`,
        agent: "dev"
      }));
    } else {
      // ✅ Generación dinámica basada en la visión del proyecto
      const projectName = vision?.name || brief?.projectName || "el proyecto";
      const skills = vision?.targetSkills || brief?.stack?.frameworks?.join(", ") || "tecnologías estándar";
      
      tasksData = [
        {
          title: `🏗️ [ARCH] Diseñar arquitectura para ${projectName}`,
          description: `Definir la estructura de carpetas y patrones de diseño para ${projectName} usando ${skills}.`,
          agent: "arch"
        },
        {
          title: `💻 [DEV] Implementar funcionalidad principal de ${projectName}`,
          description: `Desarrollar el núcleo de ${projectName}. Objetivo: ${vision?.generalObjective || 'Cumplir con los requisitos'}.`,
          agent: "dev"
        },
        {
          title: `📝 [DOC] Documentar ${projectName} y guías de uso`,
          description: `Crear README detallado con instalación, uso y ejemplos de ${projectName}.`,
          agent: "doc"
        },
        {
          title: `🧪 [QA] Crear pruebas para la funcionalidad principal`,
          description: `Configurar y escribir tests unitarios para validar la funcionalidad principal de ${projectName}.`,
          agent: "qa"
        }
      ];
    }

    // Si hay lecciones aprendidas, añadir una tarea de revisión
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