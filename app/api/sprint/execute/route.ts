import { NextRequest, NextResponse } from "next/server";
import { startSprintExecution } from "@/lib/agent-executor";

export async function POST(req: NextRequest) {
  try {
    console.log("[API /sprint/execute] Iniciando solicitud...");
    
    let body: any = {};
    try {
      // ✅ FIX: Leer como texto primero para evitar el crash si el body está vacío
      const text = await req.text();
      if (text && text.trim().length > 0) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.warn("[API /sprint/execute] Body vacío o inválido, continuando sin visión.");
    }
    
    console.log("[API /sprint/execute] Body procesado:", body);
    
    const result = await startSprintExecution(body?.vision);
    console.log("[API /sprint/execute] Resultado:", result);
    
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    console.error("❌ [API /sprint/execute] ERROR CRÍTICO:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}