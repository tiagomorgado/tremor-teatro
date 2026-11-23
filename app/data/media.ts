import { withBase } from "../lib/base";
import manifest from "./media.json";

export type MediaEntry = {
  w: number;
  h: number;
  widths: number[];
  lqip: string | null;
  /** Focal point as CSS object-position, from scripts/detect-focus.swift (faces first). */
  focus?: string;
  logo?: boolean;
};

const media = manifest as Record<string, MediaEntry>;

export type MediaKey = string;

export function getMedia(key: MediaKey): MediaEntry {
  const entry = media[key];
  if (!entry) throw new Error(`Unknown media key: ${key}`);
  return entry;
}

export function mediaUrl(key: MediaKey, width: number, ext: "avif" | "webp" = "webp") {
  return withBase(`/media/${key}-${width}.${ext}`);
}

export function srcSet(key: MediaKey, ext: "avif" | "webp") {
  const { widths } = getMedia(key);
  return widths.map((w) => `${mediaUrl(key, w, ext)} ${w}w`).join(", ");
}

/** Closest generated width at or above `target`, falling back to the largest. */
export function pickWidth(key: MediaKey, target: number) {
  const { widths } = getMedia(key);
  return widths.find((w) => w >= target) ?? widths[widths.length - 1];
}

/** Build an ordered list of keys like `nucleo/nucleo-01` … `nucleo/nucleo-31`. */
export function range(set: string, prefix: string, from: number, to: number, skip: number[] = []) {
  const out: string[] = [];
  for (let i = from; i <= to; i++) {
    if (skip.includes(i)) continue;
    out.push(`${set}/${prefix}-${String(i).padStart(2, "0")}`);
  }
  return out;
}
