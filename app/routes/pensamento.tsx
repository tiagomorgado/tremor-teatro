import { ArrowUpRight } from "@phosphor-icons/react";
import type { Route } from "./+types/pensamento";
import { site } from "~/data/site";
import { breadcrumbs, seo } from "~/lib/seo";
import { PageHeader } from "~/components/PageHeader";
import { Img } from "~/components/Img";
import { Reveal } from "~/components/Reveal";
import { ButtonLink } from "~/components/Button";

export const meta: Route.MetaFunction = ({ location }) =>
  seo({
    title: "Pensamento",
    description:
      "Espaço de reflexão, artigos de opinião, contos, fragmentos soltos e documentos que acompanham a elaboração dramatúrgica das obras da Tremor Teatro.",
    path: location.pathname,
    image: "misc/dsc0783-copia-medium",
    jsonLd: [breadcrumbs([{ name: "Pensamento", path: "/pensamento" }])],
  });

const posts = [
  {
    title: "Reflexão Fogo-Fátuo",
    text: "Leia a nossa reflexão sobre o Fogo-Fátuo no Substack e subscreva para ficar a par.",
    href: "https://tremorteatro.substack.com/p/reflexaofogo-fatuo",
    cover: "misc/dsc0783-copia-medium",
  },
];

export default function Pensamento() {
  return (
    <>
      <PageHeader
        title="Pensamento"
        intro="Espaço de reflexão, artigos de opinião, contos, fragmentos soltos, documentos iconográficos e textuais que acompanham o processo de elaboração dramatúrgica das obras."
      />
      <section className="gutter mx-auto max-w-[1600px]">
        {posts.map((p) => (
          <Reveal key={p.href}>
            <a href={p.href} target="_blank" rel="noreferrer" className="group grid grid-cols-1 items-end gap-8 md:grid-cols-12">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-2 md:col-span-7">
                <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
                  <Img src={p.cover} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" />
                </div>
              </div>
              <div className="md:col-span-5">
                <p className="text-sm text-mute">Substack</p>
                <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,4rem)] leading-[1.02] text-bone transition-colors group-hover:text-lilac">{p.title}</h2>
                <p className="mt-5 max-w-[44ch] leading-relaxed text-bone/70">{p.text}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm text-lilac">
                  Ler no Substack <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
        <Reveal className="mt-24 flex flex-col gap-6 border-t border-line pt-12 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[40ch] font-serif text-2xl leading-snug text-bone">Receba os próximos textos por email.</p>
          <ButtonLink to={site.substack}>Subscrever</ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
