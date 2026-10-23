import { NextResponse } from "next/server";
import { checkSurveyResponses } from "@/lib/agent-executor";

export async function GET() {
  try {
    const result = await checkSurveyResponses();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, allAnswered: false, message: error.message }, { status: 500 });
  }
}