import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return NextResponse.json({ 
      success: true, 
      repos: repos.map(r => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private: r.private,
      }))
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error listando repos:', error);
    return NextResponse.json({ 
      error: 'Error conectando con GitHub. Verifica GITHUB_TOKEN' 
    }, { status: 500 });
  }
}