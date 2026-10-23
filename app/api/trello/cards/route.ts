import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const token = searchParams.get('token');
    const boardId = searchParams.get('boardId');

    if (!apiKey || !token || !boardId) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales' }, { status: 400 });
    }

    // 1. Obtener las listas del tablero
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`);
    if (!listsRes.ok) throw new Error('No se pudo acceder al tablero');
    const lists = await listsRes.json();

    // 2. Obtener las tarjetas de cada lista
    const cardsByList: Record<string, any[]> = {};
    for (const list of lists) {
      const cardsRes = await fetch(`https://api.trello.com/1/lists/${list.id}/cards?key=${apiKey}&token=${token}`);
      if (cardsRes.ok) {
        const cards = await cardsRes.json();
        cardsByList[list.name] = cards.map((card: any) => ({
          id: card.id,
          title: card.name,
          status: mapListToStatus(list.name) // Mapeamos el nombre de tu lista a nuestro estado interno
        }));
      }
    }

    return NextResponse.json({ success: true, data: cardsByList }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error conectando con Trello' }, { status: 500 });
  }
}

// Función auxiliar para mapear tus listas de Trello a los estados del Dashboard
function mapListToStatus(listName: string): string {
  const name = listName.toLowerCase();
  if (name.includes('backlog') || name.includes('idea')) return 'backlog';
  if (name.includes('progreso') || name.includes('progress') || name.includes('haciendo')) return 'progress';
  if (name.includes('review') || name.includes('revisión')) return 'review';
  if (name.includes('done') || name.includes('hecho') || name.includes('completado')) return 'done';
  if (name.includes('producción') || name.includes('production') || name.includes('deploy')) return 'production';
  return 'backlog'; // Por defecto
}