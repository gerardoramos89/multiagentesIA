import { NextResponse } from "next/server";
import { closeSprint } from "@/lib/agent-executor";

export async function POST() {
  try {
    console.log("[API /sprint/close] Cerrando sprint...");
    const result = await closeSprint();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}