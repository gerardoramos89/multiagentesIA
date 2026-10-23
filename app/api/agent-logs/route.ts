import { NextResponse } from "next/server";
import { getAgentLogs } from "@/lib/agent-executor";

export async function GET() {
  try {
    const logs = getAgentLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}