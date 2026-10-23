import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newBranchName, baseBranch = 'main' } = body;

    if (!newBranchName) {
      return NextResponse.json({ error: 'newBranchName requerido' }, { status: 400 });
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = process.env.GITHUB_OWNER || 'gerardoramos';
    const repo = process.env.GITHUB_REPO || 'Extracto';

    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${baseBranch}`,
    });

    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranchName}`,
      sha: refData.object.sha,
    });

    return NextResponse.json(
      { success: true, message: `Rama '${newBranchName}' creada`, branch: newBranchName },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creando rama:', error);
    if (error.status === 422) {
      return NextResponse.json({ error: 'La rama ya existe' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}