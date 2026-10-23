import { NextResponse } from "next/server";
import { generateRetrospective } from "@/lib/agent-executor";

export async function POST() {
  try {
    console.log("[API /sprint/retrospective] Generando retrospectiva...");
    const result = await generateRetrospective();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}