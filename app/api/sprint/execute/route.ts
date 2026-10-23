import { NextResponse } from "next/server";
import { startSprintExecution } from "@/lib/agent-executor";

export async function POST() {
  try {
    const result = await startSprintExecution();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}