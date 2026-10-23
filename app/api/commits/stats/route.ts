import { NextResponse } from "next/server";
import { getTotalCommits, loadChangeMemory } from "@/lib/agent-executor";

export async function GET() {
  try {
    const memory = loadChangeMemory();
    return NextResponse.json({
      success: true,
      totalCommits: memory.totalCommits,
      lastCommitHash: memory.lastCommitHash,
      filesEverChanged: memory.filesEverChanged.length,
      sprintsCompleted: memory.sprintsCompleted
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}