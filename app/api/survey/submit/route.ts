import { NextRequest, NextResponse } from "next/server";
import { loadSprint, saveSprint, closeSprint } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json(); // { surveyId: "respuesta" }
    
    const sprint = loadSprint();
    if (!sprint || !sprint.surveys) {
      return NextResponse.json({ success: false, message: "No hay encuestas activas" }, { status: 400 });
    }

    // 1. Actualizar las encuestas con las respuestas del usuario
    sprint.surveys = sprint.surveys.map((s: any) => ({
      ...s,
      answer: answers[s.id] || s.answer
    }));
    saveSprint(sprint);

    // 2. Cerrar el sprint (esto lo mueve al historial y extrae lecciones aprendidas)
    const closeResult = await closeSprint();
    
    return NextResponse.json(closeResult);
  } catch (error: any) {
    console.error("Error al enviar respuestas:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}