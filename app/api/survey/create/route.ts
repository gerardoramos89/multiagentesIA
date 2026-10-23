import { NextResponse } from "next/server";
import { createSurveys } from "@/lib/agent-executor";

export async function POST() {
  try {
    console.log("[API /survey/create] Creando encuestas en Trello...");
    const result = await createSurveys();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}