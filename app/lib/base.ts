/**
 * Where the site lives. Normally at the root of tremorteatro.pt; the GitHub Pages preview
 * builds it into a subfolder (BASE_PATH, e.g. "/tremor-teatro/") and sets VITE_PREVIEW_URL.
 */
// import.meta.env is missing when routes.ts loads the data files (no Vite transform there).
export const BASE: string = import.meta.env?.BASE_URL ?? "/";

/** A root-relative path ("/media/x.webp") inside the site's folder. */
export const withBase = (path: string) => BASE + path.replace(/^\//, "");

/** Set only in the preview build: its public address, without a trailing slash. */
export const PREVIEW_URL = (import.meta.env?.VITE_PREVIEW_URL as string | undefined)?.replace(/\/$/, "");
