import { NextResponse } from "next/server";

export async function POST() {
  try {
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    
    if (!key || !token || !boardId) {
      return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });
    }

    // 1. Obtener todas las listas y tarjetas actuales
    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}`);
    const lists = await listsRes.json();

    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}&filter=open`);
    const cards = await cardsRes.json();

    // 2. Archivar tarjetas de "ruido" (Pre-Vuelo, tests viejos, duplicados)
    let archivedCount = 0;
    for (const card of cards) {
      if (/pre-vuelo|diagnóstico|test pre-vuelo/i.test(card.name)) {
        await fetch(`https://api.trello.com/1/cards/${card.id}/closed`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: true, key, token })
        });
        archivedCount++;
      }
    }

    // 3. Definir las listas ideales del flujo Scrum con IA
    const idealLists = [
      "📥 Backlog del Producto",
      "🚀 Sprint Actual (Agentes Trabajando)",
      "⏳ Review Humano (Encuestas/Aprobación)",
      "✅ Done (Desplegado)"
    ];

    const createdLists: any[] = [];

    // 4. Crear las listas si no existen
    for (const listName of idealLists) {
      const exists = lists.find((l: any) => l.name === listName);
      if (!exists) {
        const res = await fetch("https://api.trello.com/1/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key, token, name: listName, idBoard: boardId, pos: "bottom"
          })
        });
        createdLists.push(await res.json());
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tablero organizado. Se archivaron ${archivedCount} tarjetas de ruido y se verificaron las listas Scrum.`,
      archivedCount,
      lists: idealLists
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}