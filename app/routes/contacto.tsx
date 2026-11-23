import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { Check, Copy, WarningCircle } from "@phosphor-icons/react";
import type { Route } from "./+types/contacto";
import { site } from "~/data/site";
import { breadcrumbs, seo } from "~/lib/seo";
import { PREVIEW_URL } from "~/lib/base";
import { PageHeader } from "~/components/PageHeader";
import { Reveal } from "~/components/Reveal";
import { clean, cooldownLeft, HONEYPOT, knownCreation, LIMITS, looksLikeBot, markSent, validate, type ContactValues } from "~/lib/contact";

export const meta: Route.MetaFunction = ({ location }) =>
  seo({
    title: "Contacto",
    description: `Programação, digressões, coproduções e imprensa. Escreva para ${site.email} ou ligue ${site.phone}.`,
    path: location.pathname,
    jsonLd: [breadcrumbs([{ name: "Contacto", path: "/contacto" }])],
  });

/**
 * Messages go to /enviar-mensagem.php (public/), a small script on the same hosting that sends
 * them through the hosting's own email, as WordPress did. VITE_FORM_ENDPOINT can point the form
 * at another https service instead. In `npm run dev` there is no PHP, so unless an endpoint is
 * set the form composes an email in the visitor's mail app, as it does in the GitHub Pages
 * preview (no PHP there).
 */
const ENDPOINT = (() => {
  const raw = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
  if (!raw) return import.meta.env.DEV || PREVIEW_URL ? undefined : "/enviar-mensagem.php";
  // Never post personal data over plain HTTP or to a malformed address: fall back to email.
  try {
    return new URL(raw).protocol === "https:" ? raw : undefined;
  } catch {
    return undefined;
  }
})();
const TIMEOUT_MS = 12_000;

// Must match SUBJECTS in public/enviar-mensagem.php.
const subjects = ["Programação e digressão", "Coprodução", "Imprensa", "Formação", "Outro assunto"];

type Status = "idle" | "sending" | "sent" | "error";

export default function Contacto() {
  const [params] = useSearchParams();
  // Pages are pre-rendered without a query string, so read it after hydration.
  const [about, setAbout] = useState<string | null>(null);
  useEffect(() => setAbout(knownCreation(params.get("assunto"))), [params]);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  // When the form became visible; bots tend to submit instantly.
  const shownAt = useRef(Date.now());
  useEffect(() => {
    if (status === "idle") shownAt.current = Date.now();
  }, [status]);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setNotice(null);

    // Bots: pretend it worked so they get no signal to adapt to, and send nothing.
    if (looksLikeBot(form, shownAt.current)) {
      setStatus("sent");
      return;
    }

    const values: ContactValues = {
      nome: clean(form.get("nome"), LIMITS.nome),
      email: clean(form.get("email"), LIMITS.email),
      assunto: clean(form.get("assunto"), 60),
      mensagem: clean(form.get("mensagem"), LIMITS.mensagem, true),
    };
    const next = validate(values, subjects);
    setErrors(next);
    if (Object.keys(next).length) return;

    const wait = cooldownLeft();
    if (wait > 0) {
      setNotice(`Já recebemos uma mensagem sua. Pode enviar outra dentro de ${Math.ceil(wait / 1000)} segundos.`);
      return;
    }

    const subject = `${values.assunto}${about ? `: ${about}` : ""}`;

    if (!ENDPOINT) {
      const body = `${values.mensagem}\n\n${values.nome}\n${values.email}`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      markSent();
      setStatus("sent");
      return;
    }

    setStatus("sending");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // Only whitelisted, cleaned fields, plus how long the form was open (the server repeats
        // the bot checks). `_subject`/`_replyto` are only for a Formspree-style endpoint.
        body: JSON.stringify({
          ...values,
          criacao: about ?? undefined,
          t: Date.now() - shownAt.current,
          _subject: `[Site] ${subject}`,
          _replyto: values.email,
        }),
        signal: ctrl.signal,
        credentials: "omit",
        referrerPolicy: "strict-origin",
      });
      if (res.ok) {
        markSent();
        formEl.reset();
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  return (
    <>
      <PageHeader title="Fala connosco" intro="Programação, digressões, coproduções ou imprensa. Escreva-nos e respondemos com brevidade." />

      <section className="gutter mx-auto grid grid-cols-1 max-w-[1600px] gap-16 md:grid-cols-12">
        <Reveal className="space-y-10 md:col-span-4">
          <div>
            <h2 className="text-sm text-mute">Email</h2>
            <div className="mt-2 flex min-w-0 items-center gap-3">
              <a href={`mailto:${site.email}`} className="link-underline min-w-0 font-display text-2xl break-all text-bone md:text-3xl">
                {site.email}
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(site.email);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  } catch {
                    /* clipboard blocked: the mailto link still works */
                  }
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bone/20 text-bone/80 transition-colors hover:border-lilac hover:text-lilac"
                aria-label={copied ? "Email copiado" : "Copiar email"}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-sm text-mute">Telefone</h2>
            <a href={site.phoneHref} className="link-underline mt-2 inline-block font-display text-2xl text-bone md:text-3xl">
              {site.phone}
            </a>
          </div>
          <div>
            <h2 className="text-sm text-mute">Redes</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-full border border-bone/20 px-4 text-sm text-bone/85 transition-colors hover:border-lilac hover:text-lilac"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
          {status === "sent" ? (
            <div className="border border-line bg-ink-2 p-8 md:p-12" role="status">
              <p className="font-display text-4xl text-lilac">Obrigado.</p>
              <p className="mt-4 max-w-[46ch] leading-relaxed text-bone/80">
                {ENDPOINT
                  ? "A sua mensagem foi enviada. Respondemos assim que possível."
                  : "Abrimos a sua aplicação de email com a mensagem preparada. Se não abriu, escreva diretamente para " + site.email + "."}
              </p>
              <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm text-mute underline underline-offset-4 hover:text-bone">
                Escrever outra mensagem
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="relative grid gap-7">
              {about && (
                <p className="text-sm text-mute">
                  Sobre <span className="text-lilac">{about}</span>
                </p>
              )}
              {/* Honeypot: off-screen and out of the tab order; only bots fill it. */}
              <div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-px w-px overflow-hidden opacity-0 [clip-path:inset(50%)]">
                <label htmlFor={HONEYPOT}>Não preencha este campo</label>
                <input id={HONEYPOT} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
              </div>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
                <Field label="Nome" name="nome" autoComplete="name" maxLength={LIMITS.nome} error={errors.nome} />
                <Field label="Email" name="email" type="email" autoComplete="email" maxLength={LIMITS.email} error={errors.email} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="assunto" className="text-sm text-bone/85">
                  Assunto
                </label>
                <select
                  key={about ?? "geral"}
                  id="assunto"
                  name="assunto"
                  defaultValue={about ? subjects[0] : subjects[subjects.length - 1]}
                  className="h-13 border-b border-bone/30 bg-transparent py-3 text-lg text-bone outline-none focus:border-lilac"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s} className="bg-ink">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Mensagem" name="mensagem" textarea maxLength={LIMITS.mensagem} error={errors.mensagem} />
              {errors.assunto && <p className="text-sm text-[#ffb4b4]">{errors.assunto}</p>}
              {notice && (
                <p className="text-sm text-lilac" role="status">
                  {notice}
                </p>
              )}
              {status === "error" && (
                <p className="flex items-center gap-2 text-[#ffb4b4]" role="alert">
                  <WarningCircle size={18} /> Não foi possível enviar. Tente de novo ou escreva para {site.email}.
                </p>
              )}
              <div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex h-12 items-center rounded-full bg-lilac px-7 text-[15px] text-ink transition-[background-color,transform] duration-300 hover:bg-bone active:scale-[0.98] disabled:opacity-60"
                >
                  {status === "sending" ? "A enviar…" : "Enviar mensagem"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  textarea,
  maxLength,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  textarea?: boolean;
  maxLength?: number;
  error?: string;
}) {
  const cls = `w-full border-b bg-transparent py-3 text-lg text-bone outline-none transition-colors placeholder:text-mute/70 focus:border-lilac ${
    error ? "border-[#ffb4b4]" : "border-bone/30"
  }`;
  const describedBy = error ? `${name}-erro` : undefined;
  return (
    <div className="grid gap-2">
      <label htmlFor={name} className="text-sm text-bone/85">
        {label}
      </label>
      {textarea ? (
        <textarea id={name} name={name} rows={5} maxLength={maxLength} className={`${cls} resize-y`} aria-invalid={!!error} aria-describedby={describedBy} />
      ) : (
        <input id={name} name={name} type={type} autoComplete={autoComplete} maxLength={maxLength} className={cls} aria-invalid={!!error} aria-describedby={describedBy} />
      )}
      {error && (
        <p id={describedBy} className="text-sm text-[#ffb4b4]">
          {error}
        </p>
      )}
    </div>
  );
}
