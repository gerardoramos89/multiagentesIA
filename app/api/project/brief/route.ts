import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const BRIEF_FILE = path.join(process.cwd(), "config", "project-brief.json");

export async function GET() {
  try {
    if (!fs.existsSync(BRIEF_FILE)) {
      return NextResponse.json({ success: false, message: "Análisis en progreso..." }, { status: 202 });
    }
    
    const brief = JSON.parse(fs.readFileSync(BRIEF_FILE, "utf-8"));
    return NextResponse.json({ success: true, brief });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}