import { NextResponse } from 'next/server';

export async function GET() {
  // DEBUG: Ver qué está leyendo Next.js
  console.log("🔍 LEYENDO .env.local:", {
    trello: !!process.env.TRELLO_API_KEY,
    github: !!process.env.GITHUB_TOKEN,
    deepseek: !!process.env.DEEPSEEK_MODEL,
    hermes: !!process.env.HERMES_MODEL,
    aider: !!process.env.AIDER_PATH,
    ollama: !!process.env.OLLAMA_URL,
  });

  const config = {
    ollama: {
      url: process.env.OLLAMA_URL || 'http://localhost:11434',
      configured: true // Ollama siempre está ON si se asume instalación local
    },
    trello: {
      apiKey: process.env.TRELLO_API_KEY || '',
      token: process.env.TRELLO_TOKEN || '',
      boardId: process.env.TRELLO_BOARD_ID || '',
      configured: !!(process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN && process.env.TRELLO_BOARD_ID)
    },
    github: {
      token: process.env.GITHUB_TOKEN || '',
      owner: process.env.GITHUB_OWNER || '',
      repo: process.env.GITHUB_REPO || '',
      configured: !!(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO)
    },
    deepseek: {
      model: process.env.DEEPSEEK_MODEL || '',
      configured: !!process.env.DEEPSEEK_MODEL
    },
    hermes: {
      model: process.env.HERMES_MODEL || '',
      configured: !!process.env.HERMES_MODEL
    },
    aider: {
      path: process.env.AIDER_PATH || '',
      configured: !!process.env.AIDER_PATH
    }
  };

  return NextResponse.json(config);
}