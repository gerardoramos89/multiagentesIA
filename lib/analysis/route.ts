import { NextRequest, NextResponse } from "next/server";
import { startAnalysisJob } from "@/lib/analysis/engine";
import { log } from "@/lib/system-log";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, token, branch, force } = body ?? {};

    if (!owner || !repo || !token) {
      return NextResponse.json(
        { success: false, message: "Faltan owner, repo o token" },
        { status: 400 }
      );
    }

    const { jobId } = await startAnalysisJob({
      owner,
      repo,
      token,
      branch,
      force: !!force,
    });

    log("INFO", "api", `Análisis encolado: ${jobId} para ${owner}/${repo}`);

    return NextResponse.json({ success: true, jobId }, { status: 202 });
  } catch (e: any) {
    log("ERROR", "api", `Error en /api/project/analyze: ${e?.message}`);
    return NextResponse.json(
      { success: false, message: e?.message ?? "Error" },
      { status: 500 }
    );
  }
}