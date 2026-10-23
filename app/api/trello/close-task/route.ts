import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { testId, toolName } = await request.json();
    const key = process.env.TRELLO_API_KEY;
    const token = process.env.TRELLO_TOKEN;
    const boardId = process.env.TRELLO_BOARD_ID;
    if (!key || !token || !boardId) return NextResponse.json({ success: false, message: "Faltan credenciales de Trello" }, { status: 400 });

    const cardsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`);
    const cards = await cardsRes.json();
    const targetCard = cards.find((card: any) => card.name.includes(`[${testId}]`) || (card.desc && card.desc.includes(`Herramienta: ${toolName}`)));
    if (!targetCard) return NextResponse.json({ success: false, message: `No se encontró una tarjeta para ${toolName}` }, { status: 404 });

    const listsRes = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${key}&token=${token}&filter=open`);
    const lists = await listsRes.json();
    const doneListId = lists[lists.length - 1].id;

    await fetch(`https://api.trello.com/1/cards/${targetCard.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, token, idList: doneListId }) });

    const timestamp = new Date().toLocaleString("es-ES", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
    await fetch(`https://api.trello.com/1/cards/${targetCard.id}/actions/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, token, text: `✅ **TAREA CERRADA AUTOMÁTICAMENTE**\n\nEl Test Pre-Vuelo del ${timestamp} confirmó que **${toolName}** funciona correctamente.\n\n_Cerrado automáticamente por FabricAgents._` })
    });

    return NextResponse.json({ success: true, message: `Tarjeta de ${toolName} movida a Done`, cardUrl: targetCard.url }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Error cerrando tarea" }, { status: 500 });
  }
}