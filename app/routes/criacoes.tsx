import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import type { Route } from "./+types/criacoes";
import { projects, STATUS_LABEL } from "~/data/projects";
import { breadcrumbs, canonicalUrl, seo } from "~/lib/seo";
import { PageHeader } from "~/components/PageHeader";
import { Img } from "~/components/Img";
import { Reveal } from "~/components/Reveal";
import { Tremble } from "~/components/Tremble";
import { ButtonLink } from "~/components/Button";

export const meta: Route.MetaFunction = ({ location }) =>
  seo({
    title: "Criações",
    description: "Espetáculos de teatro, performance-instalação e cinema da Tremor Teatro, de Secretum (2020) a E se o meu coração parar.",
    path: location.pathname,
    image: "fogo-fatuo/fogo-fatuo-19",
    jsonLd: [
      breadcrumbs([{ name: "Criações", path: "/criacoes" }]),
      {
        "@type": "ItemList",
        itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: canonicalUrl(`/${p.slug}`) })),
      },
    ],
  });

/**
 * Index of works. Desktop: titles on the left, a pinned image on the right that
 * follows hover/focus. Mobile: each title carries its own image.
 */
export default function Criacoes() {
  const [active, setActive] = useState(0);
  const current = projects[active];

  return (
    <>
      <PageHeader title="Criações" intro="Teatro, performance e cinema. Obras que cruzam a memória, o ritual e o corpo." />

      <section className="gutter mx-auto grid grid-cols-1 max-w-[1600px] gap-10 md:grid-cols-12">
        <ol className="md:col-span-7">
          {projects.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.04} className="border-t border-line last:border-b">
              <Link
                to={`/${p.slug}/`}
                prefetch="intent"
                data-curtain-label={p.short}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="tremble group block py-8 md:py-10"
              >
                <div className="relative mb-5 aspect-[16/10] overflow-hidden md:hidden">
                  <Img src={p.cover} alt="" fill position={p.coverPosition} sizes="100vw" />
                </div>
                <div className="flex items-baseline justify-between gap-6">
                  <h2
                    className={`min-w-0 font-display text-[clamp(2rem,4.2vw,4.4rem)] leading-[1.02] transition-colors duration-500 ${
                      i === active ? "md:text-lilac" : "text-bone"
                    } group-hover:text-lilac`}
                  >
                    <Tremble>{p.title}</Tremble>
                  </h2>
                  <ArrowRight
                    size={28}
                    weight="thin"
                    className="hidden shrink-0 text-mute transition-[transform,color] duration-500 group-hover:translate-x-2 group-hover:text-lilac min-[340px]:block"
                  />
                </div>
                <p className="mt-3 text-sm text-mute">
                  {p.kind}
                  {p.year ? `, ${p.year}` : ""}
                  {p.status && <span className="text-lilac">, {STATUS_LABEL[p.status].toLowerCase()}</span>}
                </p>
              </Link>
            </Reveal>
          ))}
        </ol>

        <div className="hidden md:col-span-5 md:block">
          <div className="sticky top-28">
            <div className="relative aspect-[4/5] overflow-hidden bg-ink-2">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.slug}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={{ clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.3 } }}
                  transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                >
                  <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}>
                    <Img src={current.cover} alt="" fill position={current.coverPosition} sizes="40vw" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={current.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-mute"
              >
                {current.logline}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="gutter mx-auto mt-32 max-w-[1600px]">
        <Reveal className="grid grid-cols-1 gap-8 border-t border-line pt-14 md:grid-cols-12">
          <h2 className="font-display text-4xl md:col-span-5 md:text-5xl">Pensamento</h2>
          <div className="md:col-span-7">
            <p className="max-w-[52ch] text-lg leading-relaxed text-bone/80">
              Reflexões, fragmentos e documentos que acompanham a elaboração dramatúrgica das obras.
            </p>
            <div className="mt-8">
              <ButtonLink to="/pensamento/" variant="ghost" curtainLabel="Pensamento">
                Ler o blog
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
