import { NextRequest, NextResponse } from "next/server";
import { createSurveyWithWriterContext } from "@/lib/agent-surveys";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await createSurveyWithWriterContext({
    agentRole: body.agentRole,
    title: `Corregir error en ${body.toolName}`,
    questions: [{ id: body.testId, question: `¿Cómo resolvemos: ${body.errorDetail}?`, options: ["Aplicar solución sugerida", "Revisar manualmente", "Otro"], blocking: true, reason: "Bloquea el test pre-vuelo" }],
    sprintContext: { sprintNumber: 1, sprintGoal: "Configuración inicial", phase: "Diagnóstico", stackSummary: "Detectando...", blockedTasks: [body.toolName] }
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}