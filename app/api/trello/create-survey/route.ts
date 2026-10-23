import { NextRequest, NextResponse } from "next/server";
import { createSurveyWithWriterContext } from "@/lib/agent-surveys";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = await createSurveyWithWriterContext(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}