import { NextResponse } from "next/server";
import { loadSprintHistory, getNextSprintNumber } from "@/lib/agent-executor";

export async function POST(req: Request) {
  try {
    const { lessonsLearned } = await req.json();
    
    const history = loadSprintHistory();
    const nextSprintNumber = getNextSprintNumber();
    
    return NextResponse.json({
      success: true,
      nextSprintNumber,
      lessonsLearned: lessonsLearned || [],
      message: `Listo para iniciar Sprint #${nextSprintNumber}`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}