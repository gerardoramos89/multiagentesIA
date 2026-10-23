import { NextResponse } from "next/server";
import { readLogsFromFile } from "@/lib/system-log";

export async function GET() {
  try {
    const logs = readLogsFromFile(100);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}