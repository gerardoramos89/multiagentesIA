import { NextRequest, NextResponse } from "next/server";
import { loadBrief, saveBrief } from "@/lib/analysis/brief";

export async function GET() {
  try {
    const brief = loadBrief();
    if (!brief) {
      return NextResponse.json(
        { success: false, message: "No hay brief disponible" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, brief }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userDecisions } = await req.json();
    const brief = loadBrief();
    
    if (!brief) {
      return NextResponse.json(
        { success: false, message: "No hay brief para actualizar" },
        { status: 404 }
      );
    }

    brief.userDecisions = { ...brief.userDecisions, ...userDecisions };
    saveBrief(brief);

    return NextResponse.json({ success: true, brief }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}