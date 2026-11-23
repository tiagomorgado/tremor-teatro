// Downloads original photography from the current WordPress site into media-src/.
// Run once: `node scripts/fetch-media.mjs`. Files already present are skipped.
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sources = JSON.parse(await readFile(path.join(root, "scripts/sources.json"), "utf8"));

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function grab(item) {
  const ext = path.extname(new URL(item.url).pathname).toLowerCase().replace(".jpeg", ".jpg");
  const dir = path.join(root, "media-src", item.set);
  const file = path.join(dir, item.name + ext);
  if (await exists(file)) return "skip";
  await mkdir(dir, { recursive: true });
  const res = await fetch(item.url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} ${item.url}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return "ok";
}

const queue = [...sources];
const failures = [];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await grab(item); } catch (e) { failures.push(e.message); }
    }
  }),
);
console.log(`done, ${sources.length - failures.length}/${sources.length}`);
failures.forEach((f) => console.warn("FAILED", f));
