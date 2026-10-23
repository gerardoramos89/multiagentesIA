type SendResult = { ok: boolean; error?: string };
const queue: Array<{ text: string; resolve: (r: SendResult) => void }> = [];
let processing = false;
let lastSendAt = 0;

function isEnabled() {
  return process.env.TELEGRAM_ENABLED === "true" && !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID;
}

async function sendOne(text: string): Promise<SendResult> {
  if (!isEnabled()) return { ok: false, error: "Telegram disabled" };
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_CHAT_ID!;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const trimmed = text.length > 4000 ? text.slice(0, 3990) + "\n\n…(truncado)" : text;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const now = Date.now();
      const wait = Math.max(0, 1000 - (now - lastSendAt));
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: trimmed, parse_mode: "HTML", disable_web_page_preview: true }),
      });
      lastSendAt = Date.now();
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, Number(res.headers.get("retry-after") ?? "2") * 1000));
        continue;
      }
      if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "network error" };
    }
  }
  return { ok: false, error: "max retries" };
}

async function drain() {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const item = queue.shift()!;
    item.resolve(await sendOne(item.text));
  }
  processing = false;
}

export async function sendTelegram(text: string): Promise<SendResult> {
  return new Promise((resolve) => { queue.push({ text, resolve }); drain(); });
}

export const tg = {
  b: (s: string | number) => `<b>${String(s)}</b>`,
  i: (s: string | number) => `<i>${String(s)}</i>`,
  code: (s: string | number) => `<code>${String(s)}</code>`,
  link: (label: string, url: string) => `<a href="${url}">${label}</a>`,
};

export async function notifyAnalysisStart(repo: string) { await sendTelegram(`🔬 ${tg.b("Análisis iniciado")}\nRepo: ${tg.code(repo)}`); }
export async function notifyAnalysisProgress(repo: string, phase: string, percent: number) { await sendTelegram(`⚙️ ${tg.b("Análisis")} ${percent}%\nRepo: ${tg.code(repo)}\nFase: ${phase}`); }
export async function notifyAnalysisDone(repo: string, briefPath: string) { await sendTelegram(`✅ ${tg.b("Análisis completado")}\nRepo: ${tg.code(repo)}\nBrief: ${tg.code(briefPath)}`); }
export async function notifySurveyCreated(agent: string, title: string, cardUrl: string) { await sendTelegram(`📋 ${tg.b("Encuesta creada")}\nAgente: ${agent}\nTítulo: ${title}\nLink: ${tg.link("Ver en Trello", cardUrl)}`); }
export async function notifyError(context: string, error: string) { await sendTelegram(`🚨 ${tg.b("Error")}\nContexto: ${context}\nDetalle: ${tg.code(error)}`); }