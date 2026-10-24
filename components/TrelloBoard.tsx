"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Archive, RefreshCw, CheckCircle2 } from "lucide-react";

interface TrelloBoardProps {
  apiKey: string;
  token: string;
  boardId: string;
}

export default function TrelloBoard({ apiKey, token, boardId }: TrelloBoardProps) {
  const [cards, setCards] = useState<Record<string, any[]>>({});
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/trello/active-cards");
      const data = await res.json();
      
      if (data.success) {
        setCards(data.cards);
        setLists(data.lists);
      }
    } catch (error) {
      console.error("Error fetching Trello cards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    const interval = setInterval(fetchCards, 10000); // Actualizar cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const archiveOldCards = async () => {
    if (!confirm("¿Archivar tarjetas de sprints completados?")) return;
    
    try {
      setArchiving(true);
      const res = await fetch("/api/trello/archive-old", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ ${data.archivedCount} tarjetas archivadas`);
        fetchCards();
      }
    } catch (error) {
      alert("❌ Error archivando tarjetas");
    } finally {
      setArchiving(false);
    }
  };

  const getListColor = (listName: string) => {
    if (/sprint.*actual|to do|por hacer/i.test(listName)) return "from-blue-600 to-cyan-600";
    if (/in progress|en progreso/i.test(listName)) return "from-purple-600 to-pink-600";
    if (/done|completado|hecho/i.test(listName)) return "from-emerald-600 to-green-600";
    if (/retrospectiva|survey|encuesta/i.test(listName)) return "from-amber-600 to-orange-600";
    return "from-gray-600 to-slate-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <RefreshCw className="animate-spin text-cyan-400" size={20} />
        <span className="ml-2 text-[10px] text-gray-400">Cargando Trello...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white">Tablero Trello</span>
          <a 
            href={`https://trello.com/b/${boardId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
        <button
          onClick={archiveOldCards}
          disabled={archiving}
          className="flex items-center gap-1 px-2 py-1 bg-amber-600/20 border border-amber-500/50 text-amber-400 text-[9px] font-bold rounded hover:bg-amber-600/40 transition-all disabled:opacity-50"
        >
          <Archive size={10} />
          {archiving ? "Archivando..." : "Archivar Viejas"}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
  {lists.map((list) => { // ✅ QUITAR .slice(0, 5) para mostrar TODAS las listas
    const listCards = cards[list.name] || [];
    if (listCards.length === 0) return null;

    return (
      <div key={list.id} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${getListColor(list.name)} px-3 py-1.5`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white">{list.name}</span>
            <span className="text-[9px] text-white/80 bg-black/20 px-1.5 py-0.5 rounded-full">
              {listCards.length}
            </span>
          </div>
        </div>
        <div className="p-2 space-y-1.5">
          {listCards.slice(0, 10).map((card: any) => ( // ✅ Mostrar hasta 10 tarjetas por lista
            <motion.a
              key={card.id}
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="block p-2 bg-gray-800/50 border border-gray-700 rounded hover:border-cyan-500/50 hover:bg-gray-800 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[9px] text-gray-300 group-hover:text-white transition-colors line-clamp-2">
                  {card.name}
                </span>
                <ExternalLink size={10} className="text-gray-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-0.5" />
              </div>
              {card.labels && card.labels.length > 0 && (
                <div className="flex gap-1 mt-1 flex-wrap">
                  {card.labels.slice(0, 3).map((label: any) => (
                    <span
                      key={label.id}
                      className="text-[7px] px-1 py-0.5 rounded-full font-bold"
                      style={{ 
                        backgroundColor: label.color ? `${label.color}33` : "#66666633",
                        color: label.color || "#999"
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </motion.a>
          ))}
          {listCards.length > 10 && (
            <div className="text-center text-[8px] text-gray-500 pt-1">
              +{listCards.length - 10} tarjetas más
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>
    </div>
  );
}