import { NextResponse } from "next/server";
import { loadSprintHistory, getLessonsLearned } from "@/lib/agent-executor";

export async function GET() {
  try {
    const history = loadSprintHistory();
    const lessons = getLessonsLearned();
    return NextResponse.json({ success: true, history, lessonsLearned: lessons });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}