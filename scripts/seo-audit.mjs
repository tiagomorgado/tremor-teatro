// SEO audit of the pre-rendered build: `npm run build && node scripts/seo-audit.mjs`.
// Checks every HTML page for title/description/canonical/robots/h1/heading order/alt/JSON-LD
// and that every internal link and asset resolves to a built file.
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../build/client");
const exists = (p) => access(p).then(() => true, () => false);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!["assets", "media"].includes(e.name)) out.push(...(await walk(p))); }
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function resolveInternal(href) {
  const u = new URL(href, "https://tremorteatro.pt");
  const p = decodeURIComponent(u.pathname);
  if (p === "/") return exists(path.join(root, "index.html"));
  const f = path.join(root, p);
  return (await exists(path.join(f, "index.html"))) || (await exists(f)) || (await exists(f + ".html"));
}

const files = (await walk(root)).sort();
const problems = [];
const rows = [];
const externals = new Set();
for (const file of files) {
  const rel = "/" + path.relative(root, file).replace(/index\.html$/, "").replace(/\.html$/, "");
  const html = await readFile(file, "utf8");
  const p = (m) => problems.push(`${rel}: ${m}`);
  const title = strip(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
  const desc = attr(html.match(/<meta name="description"[^>]*>/)?.[0] ?? "", "content") ?? "";
  const canonical = attr(html.match(/<link rel="canonical"[^>]*>/)?.[0] ?? "", "href");
  const robots = attr(html.match(/<meta name="robots"[^>]*>/)?.[0] ?? "", "content");
  const h1s = [...html.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].length;
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
    try { const j = JSON.parse(m[1]); return [].concat(j["@graph"] ?? j).map((x) => x["@type"]).join("+"); } catch { p("invalid JSON-LD"); return "INVALID"; }
  });
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt="/.test(t)).length;
  const emptyAlt = imgs.filter((t) => /\salt=""/.test(t)).length;
  const ogImage = attr(html.match(/<meta property="og:image"[^>]*>/)?.[0] ?? "", "content");

  if (rel.startsWith("/__spa")) { p("SPA fallback file is published"); continue; }
  const is404 = rel === "/404";
  if (!title) p("missing <title>"); else if (title.length > 65) p(`title ${title.length} chars: "${title}"`);
  if (!desc) p("missing meta description"); else if (desc.length > 160 || desc.length < 50) p(`description ${desc.length} chars`);
  if (!is404 && !canonical) p("missing canonical");
  if (robots && /noindex/.test(robots) && !is404) p(`robots: ${robots}`);
  if (h1s !== 1) p(`${h1s} <h1> elements`);
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) p(`heading skips h${levels[i - 1]} → h${levels[i]}`);
  if (levels[0] !== 1) p(`first heading is h${levels[0]}`);
  if (noAlt) p(`${noAlt} <img> without alt`);
  if (!is404 && !ogImage) p("missing og:image");
  else if (ogImage && !(await exists(path.join(root, new URL(ogImage).pathname)))) p(`og:image file missing: ${ogImage}`);

  for (const m of html.matchAll(/\s(?:href|src)="([^"#][^"]*)"/g)) {
    const href = m[1];
    if (/^(mailto:|tel:|data:|javascript:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) { if (!href.startsWith("https://tremorteatro.pt")) externals.add(href); continue; }
    if (!(await resolveInternal(href))) p(`broken internal link/asset: ${href}`);
  }
  for (const m of html.matchAll(/\ssrcSet="([^"]+)"/gi)) for (const part of m[1].split(",")) {
    const u = part.trim().split(" ")[0]; if (u && !(await resolveInternal(u))) p(`broken srcset: ${u}`);
  }
  rows.push({ page: rel, h1s, title: title.length, desc: desc.length, canonical: canonical ?? "-", jsonld: jsonld.join(", "), imgs: imgs.length, decorative: emptyAlt });
}
console.table(rows);
console.log(`\n${externals.size} external URLs (check with --external)`);
if (process.argv.includes("--external")) {
  for (const u of externals) {
    try {
      const r = await fetch(u, { method: "GET", redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (link check)" }, signal: AbortSignal.timeout(15000) });
      if (r.status >= 400) problems.push(`external ${r.status}: ${u}`);
    } catch (e) { problems.push(`external error (${e.name}): ${u}`); }
  }
}
console.log(problems.length ? `\nPROBLEMS (${problems.length}):\n- ` + problems.join("\n- ") : "\nNo problems found.");
