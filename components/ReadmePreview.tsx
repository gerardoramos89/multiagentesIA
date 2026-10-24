"use client";
import { useState, useEffect } from "react";
import { FileText, RefreshCw, X } from "lucide-react";

interface ReadmePreviewProps {
  isVisible: boolean;
  onClose: () => void;
}

// ✅ PARSER DE MARKDOWN NATIVO (SIN DEPENDENCIAS EXTERNAS)
function parseMarkdown(text: string): string {
  let html = text;
  
  // Escapar HTML peligroso
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Bloques de código (```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="bg-black/60 border border-gray-700 rounded p-3 overflow-x-auto my-2"><code class="text-[11px] text-gray-300 font-mono">${code.trim()}</code></pre>`;
  });
  
  // Código inline (`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-cyan-950/50 text-cyan-300 px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>');
  
  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-sm font-bold text-gray-300 mt-2 mb-1">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-base font-bold text-purple-300 mt-2 mb-1">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-lg font-bold text-purple-400 mt-3 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold text-purple-400 mt-3 mb-2">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold text-emerald-400 mt-4 mb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold text-cyan-400 border-b border-cyan-500/30 pb-2 mb-3">$1</h1>');
  
  // Negrita
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold text-white">$1</strong>');
  
  // Itálica
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>');
  html = html.replace(/_(.+?)_/g, '<em class="italic text-gray-300">$1</em>');
  
  // Tachado
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through text-gray-500">$1</del>');
  
  // Imágenes
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-2 border border-gray-700" />');
  
  // Enlaces
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>');
  
  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="border-l-4 border-cyan-500/50 pl-3 italic text-gray-400 my-2">$1</blockquote>');
  
  // Líneas horizontales
  html = html.replace(/^---+$/gm, '<hr class="border-gray-700 my-3" />');
  html = html.replace(/^\*\*\*+$/gm, '<hr class="border-gray-700 my-3" />');
  
  // Listas no ordenadas (- o *)
  html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, '<li class="ml-4 text-gray-300 my-1 list-disc">$1</li>');
  
  // Listas ordenadas (1.)
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="ml-4 text-gray-300 my-1 list-decimal">$1</li>');
  
  // Checkboxes
  html = html.replace(/<li[^>]*>\s*\[x\]\s*/gi, '<li class="ml-4 text-gray-300 my-1 flex items-center gap-2"><input type="checkbox" checked disabled class="accent-cyan-500" />');
  html = html.replace(/<li[^>]*>\s*\[ \]\s*/gi, '<li class="ml-4 text-gray-300 my-1 flex items-center gap-2"><input type="checkbox" disabled class="accent-cyan-500" />');
  
  // Tablas (versión simplificada)
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split('|').map(c => c.trim());
    if (cells.every(c => /^[-:]+$/.test(c))) return ''; // Línea separadora
    const isHeader = false;
    const tag = isHeader ? 'th' : 'td';
    const cellsHtml = cells.map(c => `<${tag} class="border border-gray-700 px-2 py-1 text-[11px]">${c}</${tag}>`).join('');
    return `<tr>${cellsHtml}</tr>`;
  });
  
  // Envolver filas de tabla
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table class="w-full border-collapse my-2">$&</table>');
  
  // Párrafos (líneas vacías)
  html = html.replace(/\n\n+/g, '</p><p class="text-gray-300 text-[12px] leading-relaxed my-2">');
  html = `<p class="text-gray-300 text-[12px] leading-relaxed my-2">${html}</p>`;
  
  // Limpiar párrafos vacíos
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '');
  
  // Saltos de línea simples
  html = html.replace(/\n/g, '<br />');
  
  return html;
}

export default function ReadmePreview({ isVisible, onClose }: ReadmePreviewProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"markdown" | "html" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReadme = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/readme-preview");
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setType(data.type);
      } else {
        setError(data.message || "No se pudo cargar el contenido");
      }
    } catch (error) {
      console.error("Error cargando README:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) fetchReadme();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 w-[500px] h-[600px] bg-gray-950 border-2 border-cyan-500/50 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-b border-cyan-500/30 p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-cyan-400" />
          <span className="text-sm font-bold text-white">
            {type === "html" ? "📄 index.html Preview" : "📖 README.md Preview"}
          </span>
          {type && (
            <span className="text-[9px] font-mono bg-cyan-950/50 text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
              {type.toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchReadme} 
            disabled={loading}
            className="p-1.5 hover:bg-cyan-600/20 rounded transition-all disabled:opacity-50" 
            title="Refrescar"
          >
            <RefreshCw size={14} className={`text-cyan-400 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-red-600/20 rounded transition-all" 
            title="Cerrar"
          >
            <X size={14} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/40">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <RefreshCw className="animate-spin text-cyan-400" size={32} />
            <span className="text-[11px] text-gray-400">Cargando contenido...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">{error}</p>
            <button 
              onClick={fetchReadme}
              className="mt-4 px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 text-[11px] font-bold rounded hover:bg-cyan-600/40 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : type === "html" ? (
          <iframe 
            srcDoc={content}
            className="w-full h-full bg-white rounded"
            title="Preview HTML"
            sandbox="allow-scripts"
          />
        ) : type === "markdown" ? (
          <div 
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        ) : (
          <div className="text-center text-gray-500 py-12">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay README.md ni index.html</p>
            <p className="text-[10px] text-gray-600 mt-2">Crea uno de estos archivos en tu proyecto</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {content && (
        <div className="bg-gray-900/50 border-t border-gray-800 px-3 py-2 text-[9px] text-gray-500 flex items-center justify-between shrink-0">
          <span>{content.length} caracteres · {content.split('\n').length} líneas</span>
          <span>Última actualización: {new Date().toLocaleTimeString("es-ES")}</span>
        </div>
      )}
    </div>
  );
}