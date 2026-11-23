import sharp from "sharp"; import { readFile } from "node:fs/promises";
const [out, ...keys] = process.argv.slice(2);
const m = JSON.parse(await readFile("app/data/media.json", "utf8"));
const CW = 180, CH = 390; // phone portrait (390x844 scaled down)
async function crop(key, pos) {
  const [set, name] = key.split("/"); const src = `media-src/${set}/${name}.jpg`;
  const { w, h } = m[key]; const scale = Math.max(CW / w, CH / h);
  const sw = Math.round(w * scale), sh = Math.round(h * scale);
  const [px, py] = pos.split(" ").map((v) => parseFloat(v) / 100);
  const buf = await sharp(src).rotate().resize(sw, sh).extract({ left: Math.round((sw - CW) * px), top: Math.round((sh - CH) * py), width: CW, height: CH }).toBuffer();
  return buf;
}
const comps = []; const gap = 8;
for (const [i, key] of keys.entries()) {
  const x0 = i * (CW * 2 + gap * 3);
  comps.push({ input: await crop(key, "50% 50%"), left: x0, top: 24 });
  comps.push({ input: await crop(key, m[key].focus), left: x0 + CW + gap, top: 24 });
  comps.push({ input: Buffer.from(`<svg width="${CW * 2}" height="22"><text x="2" y="16" font-size="13" fill="yellow" font-family="Arial">${key.split("/")[1]}  (${m[key].focus})</text></svg>`), left: x0, top: 0 });
}
await sharp({ create: { width: keys.length * (CW * 2 + gap * 3), height: CH + 30, channels: 3, background: "#222" } }).composite(comps).jpeg({ quality: 75 }).toFile(out);
