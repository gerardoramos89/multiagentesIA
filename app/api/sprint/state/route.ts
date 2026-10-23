import { NextResponse } from "next/server";
import { loadSprint, getCurrentAgentTasks, getNextAgentTasks } from "@/lib/agent-executor";

export async function GET() {
  try {
    const sprint = loadSprint();
    
    if (!sprint) {
      console.log("[API /sprint/state] No hay sprint activo");
      return NextResponse.json({ 
        success: false, 
        message: "No hay sprint activo",
        sprint: null,
        currentTasks: {},
        nextTasks: {}
      }, { status: 200 }); // ✅ Cambiado a 200 para que el frontend no lo trate como error
    }

    const currentTasks = getCurrentAgentTasks();
    const nextTasks = getNextAgentTasks();
    
    console.log("[API /sprint/state] Sprint encontrado:", {
      status: sprint.status,
      tasksCount: sprint.tasks.length,
      currentTasks: Object.keys(currentTasks).filter(k => currentTasks[k]),
      nextTasks: Object.keys(nextTasks).filter(k => nextTasks[k])
    });

    return NextResponse.json({
      success: true,
      sprint,
      currentTasks,
      nextTasks,
    });
  } catch (error: any) {
    console.error("[API /sprint/state] Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message,
      sprint: null,
      currentTasks: {},
      nextTasks: {}
    }, { status: 500 });
  }
}