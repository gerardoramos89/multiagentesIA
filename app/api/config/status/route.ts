import { NextResponse } from "next/server";

export async function GET() {
  try {
    const config = {
      github: {
        configured: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO),
        owner: process.env.GITHUB_OWNER || "",
        repo: process.env.GITHUB_REPO || "",
        token: process.env.GITHUB_TOKEN || "" // ✅ Token completo, sin enmascarar
      },
      trello: {
        configured: !!(process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN && process.env.TRELLO_BOARD_ID),
        apiKey: process.env.TRELLO_API_KEY || "",
        token: process.env.TRELLO_TOKEN || "", // ✅ Token completo
        boardId: process.env.TRELLO_BOARD_ID || ""
      },
      deepseek: {
        configured: !!process.env.DEEPSEEK_MODEL,
        model: process.env.DEEPSEEK_MODEL || ""
      }
    };
    
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}