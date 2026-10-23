import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });
    }

    // Obtener todas las tarjetas del tablero
    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}&filter=open`);
    const cards = await cardsRes.json();

    // Obtener listas para saber en qué lista está cada tarjeta
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`);
    const lists = await listsRes.json();

    // Organizar tarjetas por lista
    const cardsByList: Record<string, any[]> = {};
    for (const list of lists) {
      cardsByList[list.name] = cards.filter((c: any) => c.idList === list.id);
    }

    return NextResponse.json({
      success: true,
      cards: cardsByList,
      totalCards: cards.length,
      lists: lists.map((l: any) => ({ id: l.id, name: l.name }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}