import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, token, boardId } = await request.json();

    if (!apiKey || !token || !boardId) {
      return NextResponse.json({ success: false, message: 'Faltan credenciales' }, { status: 400 });
    }

    // 1. Obtener listas del tablero
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}`);
    if (!listsRes.ok) throw new Error('No se pudo obtener las listas del tablero');
    const lists = await listsRes.json();
    
    if (lists.length < 2) {
      return NextResponse.json({ success: false, message: 'El tablero necesita al menos 2 listas para probar el flujo' }, { status: 400 });
    }

    const firstListId = lists[0].id;
    const lastListId = lists[lists.length - 1].id;
    const progressListId = lists.length > 2 ? lists[1].id : lastListId;

    const timestamp = new Date().toLocaleString('es-ES', { 
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' 
    });
    const cardName = `🚀 Test Pre-Vuelo: ${timestamp}`;

    // 2. Crear tarjeta en la primera lista (Backlog)
    const createRes = await fetch(`https://api.trello.com/1/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cardName, idList: firstListId, key: apiKey, token })
    });
    if (!createRes.ok) throw new Error('No se pudo crear la tarjeta');
    const card = await createRes.json();
    const cardId = card.id;

    // 3. Mover a "En Progreso" (simulando trabajo de agentes)
    await new Promise(r => setTimeout(r, 800)); 
    await fetch(`https://api.trello.com/1/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idList: progressListId, key: apiKey, token })
    });

    // 4. Mover a "Done" (validación completada)
    await new Promise(r => setTimeout(r, 800));
    await fetch(`https://api.trello.com/1/cards/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idList: lastListId, key: apiKey, token })
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Flujo completado: Tarjeta creada y movida a Done',
      lastUse: timestamp
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Error en el flujo de Trello' }, { status: 500 });
  }
}