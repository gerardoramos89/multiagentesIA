import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const REPO_DIR = process.cwd();
const GRTEC_DIR = path.join(REPO_DIR, "grtec");

export async function POST() {
  try {
    // 1. Crear carpeta grtec si no existe
    if (!fs.existsSync(GRTEC_DIR)) fs.mkdirSync(GRTEC_DIR, { recursive: true });

    // 2. Copiar archivos de config/ a grtec/
    const configDir = path.join(REPO_DIR, "config");
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          fs.copyFileSync(path.join(configDir, file), path.join(GRTEC_DIR, file));
        }
      }
    }

    // 3. Commit y push
    await execAsync(`git add grtec/`, { cwd: REPO_DIR });
    const { stdout: status } = await execAsync(`git status --porcelain grtec/`, { cwd: REPO_DIR });
    
    if (status.trim()) {
      await execAsync(`git commit -m "💾 Sync automático de datos de fábrica (sprints, historial, retrospectivas)\n\nTimestamp: ${new Date().toISOString()}"`, { cwd: REPO_DIR });
      
      const sshKeyPath = `C:/Users/GERARD/.ssh/id_ed25519`;
      const sshCommand = `ssh -i ${sshKeyPath} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new`;
      await execAsync(`git config core.sshCommand "${sshCommand}"`, { cwd: REPO_DIR });
      await execAsync(`git push`, { cwd: REPO_DIR });
      
      return NextResponse.json({ 
        success: true, 
        message: `✅ Sincronizado con GitHub. Archivos en carpeta /grtec/`,
        files: files
      });
    }
    
    return NextResponse.json({ success: true, message: "✅ Todo actualizado, sin cambios nuevos" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}