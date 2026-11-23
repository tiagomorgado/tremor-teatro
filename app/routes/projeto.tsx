import { useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import type { Route } from "./+types/projeto";
import { formatDays, getProject, nextProject, STATUS_LABEL, type Project } from "~/data/projects";
import { breadcrumbs, excerpt, seo, slugFrom } from "~/lib/seo";
import { performancesSchema, projectSchema } from "~/lib/schema";
import { Img } from "~/components/Img";
import { MaskedTitle, Reveal } from "~/components/Reveal";
import { MasonryGallery } from "~/components/MasonryGallery";
import { YouTube } from "~/components/YouTube";
import { ButtonLink } from "~/components/Button";
import { Tremble } from "~/components/Tremble";

export const meta: Route.MetaFunction = ({ location }) => {
  const p = getProject(slugFrom(location.pathname));
  if (!p) return [{ title: "Tremor Teatro" }];
  return seo({
    title: p.title,
    description: excerpt(p.synopsis[0]),
    path: location.pathname,
    image: p.hero,
    jsonLd: [projectSchema(p), ...performancesSchema(p), breadcrumbs([{ name: "Criações", path: "/criacoes" }, { name: p.title, path: `/${p.slug}` }])],
  });
};

export default function ProjectPage() {
  const { pathname } = useLocation();
  const p = getProject(slugFrom(pathname))!;
  return <ProjectView key={p.slug} p={p} />;
}

function ProjectView({ p }: { p: Project }) {
  const next = nextProject(p.slug);
  return (
    <article>
      <ProjectHero p={p} />
      <Intro p={p} />
      {p.video && (
        <section className="gutter mx-auto max-w-[1600px] py-16 md:py-24" aria-label="Teaser">
          <Reveal>
            <YouTube id={p.video.id} title={p.video.title} poster={p.cover} />
          </Reveal>
        </section>
      )}
      <ProjectGallery p={p} />
      <Credits p={p} />
      <NextProject p={next} />
    </article>
  );
}

function ProjectHero({ p }: { p: Project }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <header ref={ref} className="relative flex min-h-[100dvh] items-end overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <div className="fade-in absolute inset-0" style={{ ["--d" as string]: "0s" }}>
          <Img src={p.hero} alt={`${p.title}, fotografia de cena`} fill priority position={p.heroPosition} sizes="100vw" />
        </div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />

      <motion.div style={{ opacity: fade }} className="gutter relative mx-auto w-full max-w-[1600px] pb-12 md:pb-20">
        <p className="fade-in mb-6 text-sm text-bone/75" style={{ ["--d" as string]: "0.2s" }}>
          {p.kind}
          {p.year && <span className="text-lilac"> · {p.year}</span>}
          {p.status && <span className="text-lilac"> · {STATUS_LABEL[p.status]}</span>}
        </p>
        <MaskedTitle
          text={p.title}
          animateOnMount
          delay={0.25}
          className="max-w-[16ch] font-display text-[clamp(3rem,8vw,8.5rem)] leading-[0.95] tracking-[-0.01em]"
        />
      </motion.div>
    </header>
  );
}

function Intro({ p }: { p: Project }) {
  const [lead, ...rest] = p.synopsis;
  return (
    <section className="gutter mx-auto grid grid-cols-1 max-w-[1600px] gap-14 py-20 md:grid-cols-12 md:py-32" aria-label="Sinopse">
      <div className="md:col-span-8 md:col-start-5 md:row-start-1">
        <Reveal>
          <p className="font-serif text-[clamp(1.4rem,2.3vw,2.2rem)] leading-[1.38] text-bone">{lead}</p>
        </Reveal>
        {rest.map((t, i) => (
          <Reveal key={i} delay={0.05}>
            <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-bone/75">{t}</p>
          </Reveal>
        ))}
        {p.notes?.map((n) => (
          <Reveal key={n}>
            <p className="mt-8 max-w-[62ch] border-l border-lilac/60 pl-5 text-[15px] leading-relaxed text-mute">{n}</p>
          </Reveal>
        ))}
        {p.performances && p.performances.length > 0 && <Performances list={p.performances} />}
      </div>

      <Reveal className="md:col-span-3 md:row-start-1">
        <dl className="space-y-6">
          {p.facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs tracking-[0.14em] text-mute uppercase">{f.label}</dt>
              <dd className="mt-1.5 leading-snug text-bone">{f.value}</dd>
            </div>
          ))}
        </dl>
        {p.bookable && p.availability && (
          <div className="mt-10 border-t border-line pt-8">
            <p className="text-bone">{p.availability}</p>
            <div className="mt-5">
              <ButtonLink to={`/contacto/?assunto=${encodeURIComponent(p.short)}`} curtainLabel="Contacto">
                Pedir informação
              </ButtonLink>
            </div>
          </div>
        )}
        {p.links && p.links.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2">
            {p.links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  prefetch="intent"
                  className="inline-flex h-10 items-center rounded-full border border-bone/20 px-4 text-sm text-bone/85 transition-colors hover:border-lilac hover:text-lilac"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}

const COUNTRY: Record<string, string> = { PT: "Portugal", ES: "Espanha" };
function Performances({ list }: { list: NonNullable<Project["performances"]> }) {
  return (
    <Reveal className="mt-14 border-t border-line pt-10">
      <h2 className="font-display text-2xl text-lilac">Digressão</h2>
      <ol className="mt-6 divide-y divide-line">
        {list.map((v) => (
          <li key={v.venue + v.dates[0]} className="grid grid-cols-1 gap-1 py-5 sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8">
            <time dateTime={v.dates[0]} className="text-bone">
              {formatDays(v.dates)}
            </time>
            <p className="text-bone/75">
              <span className="text-bone">{v.venue}</span>, {v.city}
              {v.country !== "PT" && `, ${COUNTRY[v.country] ?? v.country}`}
            </p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

function ProjectGallery({ p }: { p: Project }) {
  const [active, setActive] = useState(0);
  const g = p.galleries[active];
  if (!g) return null;
  const items = g.images.map((src) => ({ src, caption: `${p.short}, ${g.label.toLowerCase()}` }));
  return (
    <section className="gutter mx-auto max-w-[1600px] py-16 md:py-24" aria-labelledby="galeria-projeto" id="galeria">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <MaskedTitle as="h2" id="galeria-projeto" text="Galeria" className="font-display text-[clamp(2.4rem,4.5vw,4.5rem)] leading-none" />
        {p.galleries.length > 1 && (
          <div role="tablist" aria-label="Galerias" className="flex gap-2">
            {p.galleries.map((x, i) => (
              <button
                key={x.slug}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`h-10 rounded-full px-5 text-sm transition-colors ${
                  i === active ? "bg-lilac text-ink" : "border border-bone/20 text-bone/80 hover:border-bone"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <MasonryGallery key={g.slug} items={items} />
    </section>
  );
}

function Credits({ p }: { p: Project }) {
  return (
    <section className="gutter mx-auto max-w-[1600px] py-16 md:py-24" aria-labelledby="ficha">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-28">
          <MaskedTitle as="h2" id="ficha" text="Ficha artística e técnica" className="max-w-[12ch] font-display text-[clamp(2.2rem,3.6vw,3.6rem)] leading-[1.02]" />
          </div>
        </div>
        <div className="md:col-span-8">
          {p.credits.length === 0 && <p className="text-lg text-mute">Mais informações em breve.</p>}
          {p.credits.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-16" : ""}>
              {group.heading && <h3 className="mb-8 font-display text-2xl text-lilac">{group.heading}</h3>}
              <dl className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                {group.items.map((c) => (
                  <Reveal key={c.role} y={14}>
                    <dt className="text-sm text-mute">{c.role}</dt>
                    <dd className="mt-1 leading-snug text-bone">{c.names}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          ))}
          {p.partnersLogo && (
            <Reveal className="mt-16 border-t border-line pt-10">
              <Img src={p.partnersLogo} alt="Logótipos das entidades parceiras e apoios" sizes="(min-width: 768px) 60vw, 100vw" className="!bg-none opacity-80" />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function NextProject({ p }: { p: Project }) {
  return (
    <section className="gutter mx-auto max-w-[1600px] pt-16 md:pt-24" aria-label="Criação seguinte">
      <Link to={`/${p.slug}/`} prefetch="intent" data-curtain-label={p.short} className="tremble group relative block overflow-hidden">
        <div className="relative aspect-[16/9] md:aspect-[21/8]">
          <div className="absolute inset-0 scale-105 transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-100">
            <Img src={p.cover} alt="" fill position={p.coverPosition} sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-ink/60 transition-colors duration-700 group-hover:bg-ink/35" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <p className="text-sm text-bone/75">Criação seguinte</p>
            <p className="mt-3 flex items-end justify-between gap-6 font-display text-[clamp(2.2rem,5.5vw,5.5rem)] leading-[1] text-bone">
              <Tremble>{p.title}</Tremble>
              <ArrowRight weight="thin" className="mb-2 shrink-0 text-lilac transition-transform duration-500 group-hover:translate-x-2" size="0.7em" />
            </p>
          </div>
        </div>
      </Link>
    </section>
  );
}
