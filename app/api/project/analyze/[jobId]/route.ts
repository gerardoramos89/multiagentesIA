import { NextRequest, NextResponse } from "next/server";
import { getAnalysisJob } from "@/lib/analysis/engine";

// ✅ FIX: En Next.js 15+, params es una Promise
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  
  console.log(`[GET /api/project/analyze/${jobId}] Buscando job...`);
  
  if (!jobId) {
    console.error("[GET] No se recibió jobId");
    return NextResponse.json(
      { success: false, message: "Falta jobId" },
      { status: 400 }
    );
  }

  const job = getAnalysisJob(jobId);
  
  if (!job) {
    console.error(`[GET] Job ${jobId} NO encontrado en disco`);
    return NextResponse.json(
      { success: false, message: "Job no encontrado" },
      { status: 404 }
    );
  }

  console.log(`[GET] Job ${jobId} encontrado: status=${job.status}, progress=${job.progress}%`);

  return NextResponse.json({
    success: true,
    jobId: job.id,
    status: job.status,
    phase: job.phase,
    progress: job.progress,
    message: job.message,
    result: job.result ?? null,
    error: job.error ?? null,
    updatedAt: job.updatedAt,
  });
}