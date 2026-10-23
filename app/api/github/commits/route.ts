import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const token = searchParams.get('token');

    if (!owner || !repo) {
      return NextResponse.json({ 
        success: false, 
        error: 'MISSING_PARAMS',
        message: 'Faltan parámetros: owner o repo' 
      }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'NO_TOKEN',
        message: 'Token de GitHub no proporcionado' 
      }, { status: 401 });
    }

    // Verificar token y obtener info del repo
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `token ${token}` }
    });

    if (!repoResponse.ok) {
      const status = repoResponse.status;
      if (status === 401) {
        return NextResponse.json({ 
          success: false, 
          error: 'INVALID_TOKEN',
          message: 'Token de GitHub inválido o expirado' 
        }, { status: 401 });
      }
      if (status === 404) {
        return NextResponse.json({ 
          success: false, 
          error: 'REPO_NOT_FOUND',
          message: `Repositorio ${owner}/${repo} no encontrado o sin permisos` 
        }, { status: 404 });
      }
      return NextResponse.json({ 
        success: false, 
        error: 'GITHUB_ERROR',
        message: `Error de GitHub: ${repoResponse.statusText}` 
      }, { status: 500 });
    }

    const repoData = await repoResponse.json();

    // Obtener commits
    const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
      headers: { Authorization: `token ${token}` }
    });

    const commits = commitsResponse.ok ? await commitsResponse.json() : [];
    const totalCommits = commitsResponse.headers.get('link') 
      ? parseInt(commitsResponse.headers.get('link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0')
      : commits.length;

    // Verificar si tiene README
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3.raw' }
    });

    const hasReadme = readmeResponse.ok;
    const readmeContent = hasReadme ? await readmeResponse.text() : null;

    // Obtener branches
    const branchesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: { Authorization: `token ${token}` }
    });

    const branches = branchesResponse.ok ? await branchesResponse.json() : [];
    const defaultBranch = repoData.default_branch || 'main';

    // Analizar estructura del proyecto
    const projectAnalysis = {
      hasCommits: totalCommits > 0,
      totalCommits,
      hasReadme,
      readmePreview: readmeContent ? readmeContent.substring(0, 500) : null,
      branches: branches.map((b: any) => b.name),
      defaultBranch,
      isPrivate: repoData.private,
      language: repoData.language,
      lastPush: repoData.pushed_at,
      hasIssues: repoData.has_issues,
      hasProjects: repoData.has_projects
    };

    return NextResponse.json({ 
      success: true, 
      data: projectAnalysis
    }, { status: 200 });

  } catch (error) {
    console.error('Error en análisis de GitHub:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'NETWORK_ERROR',
      message: 'Error de conexión con GitHub' 
    }, { status: 500 });
  }
}