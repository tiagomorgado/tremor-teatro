/**
 * Contact form checks in the browser: they stop casual bots and malformed input before
 * anything is sent. Anything in the browser can be bypassed, so public/enviar-mensagem.php
 * enforces the same rules again on the server, plus a rate limit.
 */
import { projects } from "~/data/projects";

export const LIMITS = { nome: 100, email: 254, mensagem: 4000 } as const;
/** Submissions faster than this after the form appeared are treated as bots. */
export const MIN_FILL_MS = 3000;
/** One message per visitor per this window (per browser tab session). */
export const COOLDOWN_MS = 60_000;
const MAX_LINKS = 3;
const COOLDOWN_KEY = "tremor:contact:last";

/** Hidden field real people never see or fill. `_gotcha` is also Formspree's own honeypot name. */
export const HONEYPOT = "_gotcha";

export type ContactValues = { nome: string; email: string; assunto: string; mensagem: string };

// Control characters (except tab/newline), zero-width and bidi-override characters.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;

export function clean(value: unknown, max: number, multiline = false) {
  let s = String(value ?? "").replace(CONTROL, "");
  s = multiline ? s.replace(/\r\n?/g, "\n").replace(/\n{4,}/g, "\n\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export function validate(v: ContactValues, subjects: readonly string[]) {
  const errors: Partial<Record<keyof ContactValues, string>> = {};
  if (v.nome.length < 2) errors.nome = "Indique o seu nome.";
  else if (/https?:|www\.|<|>/i.test(v.nome)) errors.nome = "O nome não pode conter ligações nem símbolos < >.";
  if (!EMAIL.test(v.email)) errors.email = "Indique um email válido.";
  if (!subjects.includes(v.assunto)) errors.assunto = "Escolha um assunto da lista.";
  if (v.mensagem.length < 10) errors.mensagem = "Escreva uma mensagem com pelo menos 10 caracteres.";
  else if ((v.mensagem.match(/https?:\/\/|www\./gi) ?? []).length > MAX_LINKS)
    errors.mensagem = `A mensagem tem demasiadas ligações (máximo ${MAX_LINKS}).`;
  return errors;
}

/** Only accept a `?assunto=` that names one of our creations, so the URL can't inject text. */
export function knownCreation(raw: string | null) {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  return projects.find((p) => p.short.toLowerCase() === v || p.slug === v)?.short ?? null;
}

export function looksLikeBot(form: FormData, shownAt: number) {
  return Boolean(String(form.get(HONEYPOT) ?? "")) || Date.now() - shownAt < MIN_FILL_MS;
}

export function cooldownLeft() {
  try {
    const last = Number(sessionStorage.getItem(COOLDOWN_KEY) ?? 0);
    return Math.max(0, COOLDOWN_MS - (Date.now() - last));
  } catch {
    return 0;
  }
}

export function markSent() {
  try {
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    /* storage blocked: the provider's own rate limit still applies */
  }
}
