import { NextResponse } from "next/server";
import { getAgentWorkLogs } from "@/lib/agent-executor";

export async function GET() {
  try {
    const logs = getAgentWorkLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}