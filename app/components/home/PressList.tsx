import { Link } from "react-router";
import { ArrowRight } from "@phosphor-icons/react";
import { articles, formatDate, type Article } from "~/data/news";
import { Img } from "../Img";
import { MaskedTitle, Reveal } from "../Reveal";

/**
 * Press on the home page: the latest piece as a large lead story, the rest as compact
 * rows. Every item shows its own photo up front, so nothing appears under the pointer
 * and each card is plainly clickable.
 */
export function PressList() {
  const [lead, ...rest] = articles;

  return (
    <section className="gutter mx-auto max-w-[1600px] py-28 md:py-36" aria-labelledby="imprensa">
      <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
        <MaskedTitle as="h2" id="imprensa" text="Na imprensa" className="font-display text-[clamp(2.6rem,5vw,5.2rem)] leading-none" />
        <Link to="/noticias-tremor/" prefetch="intent" data-curtain-label="Notícias" className="link-underline pb-2 text-sm text-mute hover:text-bone">
          Todas as notícias
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {lead && (
          <Reveal className="lg:col-span-7">
            <LeadStory a={lead} />
          </Reveal>
        )}

        <ul className="divide-y divide-line border-y border-line lg:col-span-5 lg:self-start">
          {rest.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={0.08 + i * 0.06}>
              <CompactStory a={a} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Meta({ a }: { a: Article }) {
  return (
    <p className="text-sm text-mute">
      <time dateTime={a.date}>{formatDate(a.date)}</time>
      <span className="mx-2 text-line" aria-hidden>
        /
      </span>
      {a.kind}
      {a.source && <span className="text-bone/70">, {a.source}</span>}
    </p>
  );
}

function LeadStory({ a }: { a: Article }) {
  return (
    <Link to={`/${a.slug}/`} prefetch="intent" data-curtain-label={a.kind} className="group block" lang={a.lang === "es" ? "es" : undefined}>
      {a.cover && (
        <div className="relative aspect-[3/2] overflow-hidden bg-ink-2">
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
            <Img src={a.cover} alt="" fill sizes="(min-width: 1024px) 56vw, 100vw" />
          </div>
        </div>
      )}
      <div className="mt-6">
        <Meta a={a} />
        <h3 className="mt-3 max-w-[22ch] font-display text-[clamp(1.9rem,3.2vw,3.2rem)] leading-[1.05] text-bone transition-colors duration-500 group-hover:text-lilac">
          {a.title}
        </h3>
        <p className="mt-4 max-w-[56ch] leading-relaxed text-bone/70">{a.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm text-lilac">
          Ler
          <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function CompactStory({ a }: { a: Article }) {
  return (
    <Link
      to={`/${a.slug}/`}
      prefetch="intent"
      data-curtain-label={a.kind}
      className="group grid grid-cols-[96px_1fr] items-start gap-5 py-6 sm:grid-cols-[132px_1fr] md:py-7"
      lang={a.lang === "es" ? "es" : undefined}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
        {a.cover && (
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]">
            <Img src={a.cover} alt="" fill sizes="132px" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <Meta a={a} />
        <h3 className="mt-2 font-display text-xl leading-snug text-bone transition-colors duration-500 group-hover:text-lilac md:text-2xl">
          {a.title}
        </h3>
        <span className="mt-3 inline-flex items-center gap-2 text-sm text-mute transition-colors group-hover:text-lilac">
          Ler
          <ArrowRight size={14} className="transition-transform duration-500 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
