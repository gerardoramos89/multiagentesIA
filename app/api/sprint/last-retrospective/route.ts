import { NextResponse } from "next/server";
import { loadSprintHistory } from "@/lib/agent-executor";

export async function GET() {
  try {
    const history = loadSprintHistory();
    
    if (history.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No hay sprints completados aún" 
      });
    }
    
    const lastSprint = history[history.length - 1];
    
    return NextResponse.json({
      success: true,
      sprintNumber: lastSprint.sprintNumber,
      retrospective: lastSprint.retrospective,
      completedAt: lastSprint.completedAt
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}