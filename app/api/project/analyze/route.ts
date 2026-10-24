import { NextRequest, NextResponse } from "next/server";
import { startAnalysisJob } from "@/lib/project-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // ✅ USAR VARIABLES DE ENTORNO DIRECTAMENTE
    const owner = process.env.GITHUB_OWNER || body.owner;
    const repo = process.env.GITHUB_REPO || body.repo;
    const token = process.env.GITHUB_TOKEN || body.token;
    
    if (!owner || !repo) {
      return NextResponse.json({ 
        success: false, 
        message: "Faltan GITHUB_OWNER o GITHUB_REPO en .env.local" 
      }, { status: 400 });
    }
    
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: "Falta GITHUB_TOKEN en .env.local" 
      }, { status: 400 });
    }

    // Validar que el token funcione
    const testRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (!testRes.ok) {
      const errorData = await testRes.json().catch(() => ({}));
      return NextResponse.json({ 
        success: false, 
        message: `Error de GitHub (${testRes.status}): ${errorData.message || testRes.statusText}` 
      }, { status: testRes.status });
    }

    // Iniciar el análisis
    const jobId = await startAnalysisJob(owner, repo, token);
    
    return NextResponse.json({ success: true, jobId });
  } catch (error: any) {
    console.error("Error en análisis:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}