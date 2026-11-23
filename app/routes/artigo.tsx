import { Link, useLocation } from "react-router";
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react";
import type { Route } from "./+types/artigo";
import { formatDate, getArticle } from "~/data/news";
import { getProject } from "~/data/projects";
import { breadcrumbs, seo, slugFrom } from "~/lib/seo";
import { articleSchema } from "~/lib/schema";
import { Img } from "~/components/Img";
import { MaskedTitle, Reveal } from "~/components/Reveal";

export const meta: Route.MetaFunction = ({ location }) => {
  const a = getArticle(slugFrom(location.pathname));
  if (!a) return [{ title: "Tremor Teatro" }];
  return seo({
    title: a.seoTitle ?? a.title,
    description: a.excerpt,
    path: location.pathname,
    image: a.cover,
    type: "article",
    jsonLd: [articleSchema(a), breadcrumbs([{ name: "Notícias", path: "/noticias-tremor" }, { name: a.seoTitle ?? a.title, path: `/${a.slug}` }])],
  });
};

export default function Artigo() {
  const { pathname } = useLocation();
  const a = getArticle(slugFrom(pathname))!;
  const project = a.project ? getProject(a.project) : undefined;

  return (
    <article lang={a.lang === "es" ? "es" : undefined}>
      <header className="gutter mx-auto max-w-[1600px] pt-32 md:pt-40">
        <Link to="/noticias-tremor/" data-curtain-label="Notícias" className="inline-flex items-center gap-2 text-sm text-mute hover:text-bone">
          <ArrowLeft size={16} />
          Notícias
        </Link>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12">
          <p className="fade-in text-sm text-mute md:col-span-3 md:pt-4" lang="pt-PT">
            <time dateTime={a.date} className="block text-bone">
              {formatDate(a.date)}
            </time>
            {a.kind}
            {a.source && <span className="block">{a.source}</span>}
          </p>
          <MaskedTitle
            text={a.title}
            animateOnMount
            delay={0.1}
            className="font-display text-[clamp(2.4rem,5.4vw,5.6rem)] leading-[1.02] md:col-span-9"
          />
        </div>
      </header>

      {a.cover && (
        <div className="gutter mx-auto mt-16 max-w-[1600px] md:mt-24">
          <div className="fade-in relative aspect-[16/9] overflow-hidden bg-ink-2 md:aspect-[21/9]" style={{ ["--d" as string]: "0.3s" }}>
            <Img src={a.cover} alt={project ? `Fotografia de cena de ${project.title}` : a.title} fill priority sizes="100vw" />
          </div>
        </div>
      )}

      <div className="gutter mx-auto grid grid-cols-1 max-w-[1600px] gap-12 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-7 md:col-start-4">
          {a.body.map((para, i) => (
            <Reveal key={i} y={16}>
              <p className={i === 0 ? "font-serif text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.45] text-bone" : "mt-7 text-lg leading-[1.75] text-bone/80"}>
                {para}
              </p>
            </Reveal>
          ))}

          {a.quote && (
            <Reveal>
              <figure className="my-16 border-l-2 border-lilac pl-6 md:pl-10">
                <blockquote className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.25] text-bone">“{a.quote.text}”</blockquote>
                <figcaption className="mt-5 text-sm text-mute">{a.quote.by}</figcaption>
              </figure>
            </Reveal>
          )}

          <Reveal className="mt-14 border-t border-line pt-10" lang="pt-PT">
            <h2 className="text-sm text-mute">Ler na fonte</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {a.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-bone/20 px-5 text-sm text-bone transition-colors hover:border-lilac hover:text-lilac"
                  >
                    {l.label}
                    <ArrowUpRight size={15} />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      {project && (
        <section className="gutter mx-auto max-w-[1600px]" lang="pt-PT" aria-label="Criação relacionada">
          <Link to={`/${project.slug}/`} prefetch="intent" data-curtain-label={project.short} className="group grid grid-cols-1 items-center gap-8 border-t border-line pt-12 md:grid-cols-12">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-2 md:col-span-4">
              <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]">
                <Img src={project.cover} alt="" fill position={project.coverPosition} sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <p className="text-sm text-mute">Sobre a criação</p>
              <p className="mt-3 font-display text-[clamp(2rem,4vw,4rem)] leading-[1.02] text-bone transition-colors group-hover:text-lilac">{project.title}</p>
              <p className="mt-4 max-w-[48ch] text-bone/70">{project.logline}</p>
            </div>
          </Link>
        </section>
      )}
    </article>
  );
}
