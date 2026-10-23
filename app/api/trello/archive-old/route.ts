import { NextResponse } from "next/server";

export async function POST() {
  try {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });
    }

    // Obtener todas las tarjetas abiertas
    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}&filter=open`);
    const cards = await cardsRes.json();

    // Obtener listas
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`);
    const lists = await listsRes.json();

    // Encontrar listas de sprints completados o retrospecivas viejas
    const oldLists = lists.filter((l: any) => 
      /completado|archivado|retrospectiva.*sprint\s*[1-9]/i.test(l.name) ||
      /sprint\s*\d+.*complet/i.test(l.name)
    );

    let archivedCount = 0;

    // Archivar tarjetas de listas viejas
    for (const list of oldLists) {
      const oldCards = cards.filter((c: any) => c.idList === list.id);
      
      for (const card of oldCards) {
        await fetch(`https://api.trello.com/1/cards/${card.id}/closed`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: true, key, token })
        });
        archivedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      archivedCount,
      message: `${archivedCount} tarjetas archivadas`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}