// After `react-router build`:
//  1. publishes the not-found page as 404.html (served with HTTP 404 by the host),
//  2. removes the SPA fallback page (every route is pre-rendered, so it is never needed),
//  3. generates the 1200×630 JPEG share images referenced by each page's og:image,
//  4. locks each page's inline scripts with a hash-based Content-Security-Policy,
//  5. adds an outside form endpoint (if configured) to the .htaccess CSP connect-src,
//  6. writes sitemap.xml (pages + their photographs) from the pre-rendered pages.
import { createHash } from "node:crypto";
import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "..");
const root = path.join(projectRoot, "build/client");
const SITE = "https://tremorteatro.pt";
const exists = (p) => access(p).then(() => true, () => false);
const media = JSON.parse(await readFile(path.join(projectRoot, "app/data/media.json"), "utf8"));

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (["media", "assets", "og"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

// 0. GitHub Pages preview (BASE_PATH="/<repo>/"): React Router writes the pages into
//    build/client/<repo>/, but Pages already serves the whole folder at /<repo>/, so they
//    move up next to assets/ and media/. The PHP form script and .htaccess only work on the
//    real hosting, so the preview drops them (its form opens the visitor's email app).
const basePath = (process.env.BASE_PATH || "/").replace(/^\/|\/$/g, "");
if (basePath) {
  const nested = path.join(root, basePath);
  await cp(nested, root, { recursive: true });
  await rm(nested, { recursive: true });
  await rm(path.join(root, "enviar-mensagem.php"), { force: true });
  await rm(path.join(root, ".htaccess"), { force: true });
}

// 1 + 2
await copyFile(path.join(root, "404/index.html"), path.join(root, "404.html"));
await rm(path.join(root, "404"), { recursive: true });
await rm(path.join(root, "__spa-fallback.html"), { force: true });
await rm(path.join(root, "llms.txt.data"), { force: true }); // client data twin of a text-only route

const pages = await walk(root);

// 3. Share images (WebP is not accepted everywhere for link previews, so JPEG), cropped on
//    the photo's detected focal point like the rest of the site.
const ogKeys = new Set();
for (const f of pages) {
  const html = await readFile(f, "utf8");
  for (const m of html.matchAll(/https:\/\/[^"]*?\/og\/([^"]+)\.jpg/g)) ogKeys.add(m[1]); // live or preview origin
}
for (const key of ogKeys) {
  const out = path.join(root, "og", key + ".jpg");
  const [set, name] = key.split("/");
  const src = ["jpg", "jpeg", "png"].map((ext) => path.join(projectRoot, "media-src", set, `${name}.${ext}`));
  const found = (await Promise.all(src.map(exists))).findIndex(Boolean);
  if (found === -1) throw new Error(`og:image source missing for ${key}`);
  const { w, h, focus = "50% 40%" } = media[key];
  const [fx, fy] = focus.split(" ").map((v) => parseFloat(v) / 100);
  const scale = Math.max(1200 / w, 630 / h);
  const sw = Math.round(w * scale), sh = Math.round(h * scale);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(src[found])
    .rotate()
    .resize(sw, sh)
    .extract({ left: Math.round((sw - 1200) * fx), top: Math.round((sh - 630) * fy), width: 1200, height: 630 })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(out);
}

// 4. Per-page CSP for scripts. The .htaccess policy is site-wide, so it has to allow
//    'unsafe-inline' for React Router's inline hydration scripts. Each page also gets a
//    <meta> policy listing the SHA-256 of exactly its own inline scripts; browsers enforce
//    both, so on the live site only those scripts (and same-origin files) can run, and an
//    injected <script> would be blocked.
const htmlFiles = [...pages, path.join(root, "404.html")];
for (const f of htmlFiles) {
  let html = await readFile(f, "utf8");
  const hashes = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/ld\+json"/.test(m[1])) continue; // data, never executed
    hashes.add(`'sha256-${createHash("sha256").update(m[2], "utf8").digest("base64")}'`);
  }
  const policy = `script-src 'self' ${[...hashes].join(" ")}; object-src 'none'; base-uri 'self'`;
  html = html.replace("<head>", `<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`);
  await writeFile(f, html);
}

// 5. Form endpoint → CSP connect-src. By default the form posts to our own
//    /enviar-mensagem.php ('self'); an outside https endpoint gets its origin added.
async function readEnv(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.production.local", ".env.local", ".env.production", ".env"]) {
    const text = await readFile(path.join(projectRoot, file), "utf8").catch(() => "");
    const m = text.match(new RegExp(`^\\s*${name}\\s*=\\s*["']?([^"'\\n]+)`, "m"));
    if (m) return m[1].trim();
  }
}
const endpoint = await readEnv("VITE_FORM_ENDPOINT");
let connectOrigin = "";
if (endpoint) {
  try {
    const u = new URL(endpoint);
    if (u.protocol === "https:" && u.origin !== SITE) connectOrigin = u.origin;
  } catch {}
}
const htaccessPath = path.join(root, ".htaccess");
if (connectOrigin && (await exists(htaccessPath))) {
  const ht = await readFile(htaccessPath, "utf8");
  await writeFile(htaccessPath, ht.replace("connect-src 'self';", `connect-src 'self' ${connectOrigin};`));
}

// 6. Sitemap (canonical URLs end with "/", like the pages' <link rel="canonical">), with the
//    photographs that carry alt text on each page, for image search.
const entries = [];
for (const f of pages) {
  const p = "/" + path.relative(root, path.dirname(f)).split(path.sep).join("/");
  const loc = p === "/" ? "/" : p + "/";
  const html = await readFile(f, "utf8");
  const images = new Set();
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const alt = m[0].match(/\salt="([^"]*)"/)?.[1];
    const src = m[0].match(/\ssrc="(\/media\/[^"]+)"/)?.[1];
    if (alt && src && !src.includes("/logos/")) images.add(SITE + src);
  }
  entries.push({ loc, images: [...images].slice(0, 1000) });
}
entries.sort((a, b) => (a.loc === "/" ? -1 : b.loc === "/" ? 1 : a.loc.localeCompare(b.loc)));
const today = new Date().toISOString().slice(0, 10);
const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
  entries
    .map(
      (e) =>
        `  <url><loc>${SITE}${e.loc}</loc><lastmod>${today}</lastmod>` +
        e.images.map((i) => `<image:image><image:loc>${i}</image:loc></image:image>`).join("") +
        `</url>`,
    )
    .join("\n") +
  `\n</urlset>\n`;
await writeFile(path.join(root, "sitemap.xml"), xml);
const imageCount = entries.reduce((n, e) => n + e.images.length, 0);
console.log(`404.html, ${ogKeys.size} share images, CSP hashes on ${htmlFiles.length} pages, form → ${basePath ? "visitor's email app (preview)" : connectOrigin || "/enviar-mensagem.php"}, sitemap.xml: ${entries.length} URLs / ${imageCount} images`);
