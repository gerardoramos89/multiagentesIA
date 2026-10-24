import { NextResponse } from "next/server";

export async function GET() {
  try {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });
    }

    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}&filter=open`);
    const cards = await cardsRes.json();

    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`);
    const lists = await listsRes.json();

    // ✅ AGRUPAR POR NOMBRE DE LISTA (no por ID)
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