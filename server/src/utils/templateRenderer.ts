// server/src/utils/templateRenderer.ts
const Handlebars = require("handlebars");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

/** ---- Helpers ---- */

// {{currency amount "VND" "vi-VN"}}
Handlebars.registerHelper("currency", (v: any, ccy = "VND", locale = "vi-VN") => {
  const n = Number(v ?? 0);
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n.toLocaleString(locale)} ${ccy}`;
  }
});

// {{time "09:00:00"}} -> 09:00
Handlebars.registerHelper("time", (val: any) => {
  const str = String(val ?? "");
  const m = str.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : str;
});

// {{daymask "1111100" "vi"}} -> "T2–T6"
Handlebars.registerHelper("daymask", (mask: any, locale = "vi") => {
  let bits = String(mask ?? "").trim().replace(/[^01]/g, "");
  if (bits.length < 7) bits = bits.padEnd(7, "0");
  bits = bits.slice(0, 7);

  const VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const N = locale?.toString().startsWith("vi") ? VI : EN;

  const onIdx: number[] = [];
  for (let i = 0; i < 7; i++) if (bits[i] === "1") onIdx.push(i);

  if (onIdx.length === 0) return locale.startsWith("vi") ? "-" : "None";
  if (onIdx.length === 7) return locale.startsWith("vi") ? "Cả tuần" : "All week";

  const parts: string[] = [];
  let start = onIdx[0], prev = onIdx[0];
  for (let k = 1; k <= onIdx.length; k++) {
    const cur = onIdx[k];
    const breakSeq = k === onIdx.length || cur !== prev + 1;
    if (breakSeq) {
      if (prev - start + 1 >= 3) parts.push(`${N[start]}–${N[prev]}`);
      else for (let i = start; i <= prev; i++) parts.push(N[i]);
      start = cur;
    }
    prev = cur;
  }
  return parts.join(", ");
});

/** ---- Render markdown with context ---- */
export async function renderTemplate(mdStr: string, context: any): Promise<string> {
  if (!mdStr || typeof mdStr !== "string") return "";
  
  const compiled = Handlebars.compile(mdStr, { noEscape: true });
  const filled = compiled(context);

  return md.render(filled); // markdown -> HTML
}
