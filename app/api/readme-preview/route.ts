import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  try {
    const repoDir = process.cwd();
    
    // Buscar index.html primero
    const indexPath = path.join(repoDir, "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      return NextResponse.json({ success: true, type: "html", content });
    }
    
    // Luego README.md
    const readmePath = path.join(repoDir, "README.md");
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, "utf-8");
      return NextResponse.json({ success: true, type: "markdown", content });
    }
    
    return NextResponse.json({ success: false, message: "No hay README.md ni index.html" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}