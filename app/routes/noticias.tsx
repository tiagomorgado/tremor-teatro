import { useState } from "react";
import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Route } from "./+types/noticias";
import { articles, formatDate, type Article } from "~/data/news";
import { breadcrumbs, seo, slugFrom } from "~/lib/seo";
import { PageHeader } from "~/components/PageHeader";
import { Img } from "~/components/Img";
import { Reveal } from "~/components/Reveal";

const tabs = [
  { id: "all", label: "Tudo" },
  { id: "Notícia", label: "Notícias" },
  { id: "Press release", label: "Press release" },
] as const;

export const meta: Route.MetaFunction = ({ location }) => {
  const press = slugFrom(location.pathname) === "tremor-press-release";
  return seo({
    title: press ? "Press release" : "Notícias",
    description: "Notícias, press releases e menções na imprensa sobre a Tremor Teatro e as suas criações.",
    path: location.pathname,
    image: "misc/nucelo-card",
    jsonLd: [breadcrumbs([{ name: press ? "Press release" : "Notícias", path: location.pathname }])],
  });
};

export default function Noticias() {
  const { pathname } = useLocation();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>(slugFrom(pathname) === "tremor-press-release" ? "Press release" : "all");
  const list = articles.filter((a) => tab === "all" || a.kind === tab);
  const [lead, ...rest] = list;

  return (
    <>
      <PageHeader title="Notícias">
        <div role="tablist" aria-label="Tipo" className="fade-in mt-12 flex flex-wrap gap-2" style={{ ["--d" as string]: "0.5s" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`h-10 rounded-full px-5 text-sm transition-colors ${
                tab === t.id ? "bg-lilac text-ink" : "border border-bone/20 text-bone/80 hover:border-bone"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="gutter mx-auto max-w-[1600px]"
        >
          {lead && <LeadStory a={lead} />}
          <div className="mt-20 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
            {rest.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 2) * 0.08} className={i % 2 === 1 ? "md:mt-24" : ""}>
                <ArticleCard a={a} />
              </Reveal>
            ))}
          </div>
        </motion.section>
      </AnimatePresence>
    </>
  );
}

function LeadStory({ a }: { a: Article }) {
  return (
    <Link to={`/${a.slug}/`} prefetch="intent" data-curtain-label={a.kind} className="group grid grid-cols-1 items-end gap-8 md:grid-cols-12">
      {a.cover && (
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-2 md:col-span-7">
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
            <Img src={a.cover} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" priority />
          </div>
        </div>
      )}
      <div className="md:col-span-5">
        <Meta a={a} />
        <h2 className="mt-4 font-display text-[clamp(2rem,3.4vw,3.4rem)] leading-[1.05] text-bone transition-colors group-hover:text-lilac">{a.title}</h2>
        <p className="mt-5 max-w-[48ch] leading-relaxed text-bone/70">{a.excerpt}</p>
        <span className="mt-8 inline-flex items-center gap-2 text-sm text-lilac">
          Ler
          <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ a }: { a: Article }) {
  return (
    <Link to={`/${a.slug}/`} prefetch="intent" data-curtain-label={a.kind} className="group block">
      {a.cover && (
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
            <Img src={a.cover} alt="" fill sizes="(min-width: 768px) 46vw, 100vw" />
          </div>
        </div>
      )}
      <div className="mt-6">
        <Meta a={a} />
        <h3 className="mt-3 font-display text-3xl leading-[1.1] text-bone transition-colors group-hover:text-lilac">{a.title}</h3>
        <p className="mt-3 max-w-[52ch] leading-relaxed text-bone/65">{a.excerpt}</p>
      </div>
    </Link>
  );
}

function Meta({ a }: { a: Article }) {
  return (
    <p className="text-sm text-mute">
      <time dateTime={a.date}>{formatDate(a.date)}</time>
      <span className="mx-2 text-line">/</span>
      {a.kind}
      {a.source && <span className="text-bone/60">, {a.source}</span>}
    </p>
  );
}
