import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const basePath = process.env.LOCAL_PROJECTS_PATH;

    if (!basePath) {
      return NextResponse.json({ error: 'LOCAL_PROJECTS_PATH no configurada' }, { status: 500 });
    }

    const resolvedPath = path.resolve(basePath);
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });

    const projects = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        id: entry.name,
        name: entry.name.toUpperCase(),
        path: path.join(resolvedPath, entry.name),
        status: 'Activo',
        branch: 'main',
        color: 'text-cyan-400'
      }));

    return NextResponse.json({ success: true, projects }, { status: 200 });
  } catch (error) {
    console.error('Error leyendo proyectos:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}