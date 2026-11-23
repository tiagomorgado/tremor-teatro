import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { featured } from "~/data/projects";
import { StatusBadge } from "../StatusBadge";
import { Img } from "../Img";
import { MaskedTitle, Reveal } from "../Reveal";
import { ButtonLink } from "../Button";

/** The featured show (in cartaz, or else in creation), opened like a curtain: the image unclips to full-bleed as you scroll. */
export function Upcoming() {
  const p = featured;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const clipPath = useTransform(scrollYProgress, [0, 0.7], ["inset(14% 12% 14% 12%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  if (!p) return null;

  return (
    <section ref={ref} className="relative h-[170dvh]" aria-labelledby="em-criacao-title">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <motion.div className="absolute inset-0" style={reduce ? undefined : { clipPath }}>
          <motion.div className="absolute inset-0" style={reduce ? undefined : { scale }}>
            <Img src={p.hero} alt="" fill position={p.heroPosition} sizes="100vw" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" />
        </motion.div>

        <div className="gutter relative mx-auto flex h-full max-w-[1600px] flex-col justify-end pb-14 md:pb-20">
          {p.status && (
            <Reveal className="mb-7">
              <StatusBadge status={p.status} size="lg" />
            </Reveal>
          )}
          <MaskedTitle
            as="h2"
            id="em-criacao-title"
            text={p.title}
            className="max-w-[14ch] font-display text-[clamp(2.8rem,7vw,7.5rem)] leading-[0.98] text-bone"
          />
          <Reveal delay={0.15} className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-[46ch] text-lg leading-relaxed text-bone/80">{p.logline}</p>
            <ButtonLink to={`/${p.slug}/`} variant="ghost" curtainLabel={p.short}>
              Conhecer o projeto
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
