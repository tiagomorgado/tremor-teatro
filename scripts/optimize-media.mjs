// Turns media-src/ originals into responsive AVIF + WebP in public/media/
// and writes app/data/media.json (dimensions, widths, tiny blur placeholder, focal point).
// Run after adding photos: `npm run media`.
import { readdir, mkdir, writeFile, stat, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "media-src");
const outDir = path.join(root, "public/media");
const WIDTHS = [640, 1280, 1920];

async function isFresh(out, src) {
  try { return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs; } catch { return false; }
}

// Focal points (CSS object-position) found by scripts/detect-focus.swift with Apple Vision
// (faces > people > saliency). Kept in the repo so the build works on any OS; photos
// without an entry fall back to slightly above centre, where heads usually are.
const focusFile = path.join(root, "scripts/focus.json");
const focusMap = await readFile(focusFile, "utf8").then(JSON.parse, () => ({}));

const manifest = {};
for (const set of (await readdir(srcDir)).filter((d) => !d.startsWith("."))) {
  await mkdir(path.join(outDir, set), { recursive: true });
  for (const file of (await readdir(path.join(srcDir, set))).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
    const src = path.join(srcDir, set, file);
    const name = file.replace(/\.\w+$/, "");
    const img = sharp(src).rotate();
    const { width, height } = await img.metadata();
    const isLogo = set === "logos";
    const widths = name === "logo-lilas" ? [320, 800] : isLogo ? [Math.min(width, 1600)] : WIDTHS.filter((w) => w < width).concat(Math.min(width, 2400)).filter((w, i, a) => a.indexOf(w) === i);

    for (const w of widths) {
      const base = path.join(outDir, set, `${name}-${w}`);
      if (await isFresh(base + ".webp", src)) continue;
      const resized = sharp(src).rotate().resize({ width: w, withoutEnlargement: true });
      await resized.clone().webp({ quality: isLogo ? 90 : 74, effort: 5 }).toFile(base + ".webp");
      if (!isLogo) await resized.clone().avif({ quality: 52, effort: 4 }).toFile(base + ".avif");
    }

    const lqip = isLogo
      ? null
      : "data:image/webp;base64," +
        (await sharp(src).rotate().resize(20).blur(1.2).webp({ quality: 40 }).toBuffer()).toString("base64");

    const focus = isLogo ? undefined : (focusMap[`${set}/${name}`]?.focus ?? "50% 40%");
    manifest[`${set}/${name}`] = { w: width, h: height, widths, lqip, focus, logo: isLogo || undefined };
  }
  console.log("optimised", set);
}

await writeFile(path.join(root, "app/data/media.json"), JSON.stringify(manifest));
console.log(Object.keys(manifest).length, "images");
