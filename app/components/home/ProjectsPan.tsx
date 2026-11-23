import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { repertoire } from "~/data/projects";
import { Img } from "../Img";
import { MaskedTitle } from "../Reveal";
import { Tremble } from "../Tremble";
import { StatusBadge } from "../StatusBadge";

/**
 * Repertoire as a horizontal pan: vertical scroll drives the track sideways while the
 * section is pinned (desktop, motion allowed). Everywhere else it is a native
 * scroll-snap carousel, which is also what renders before hydration.
 */
export function ProjectsPan() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference) and (pointer: fine)");
    const measure = () => {
      const el = track.current;
      if (!el) return;
      setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    };
    const update = () => {
      setPan(mq.matches);
      measure();
    };
    update();
    mq.addEventListener("change", update);
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => {
      mq.removeEventListener("change", update);
      ro.disconnect();
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const x = useTransform(smooth, (v) => -v * distance);

  return (
    <section
      ref={section}
      className="relative"
      style={pan ? { height: `calc(100dvh + ${distance}px)` } : undefined}
      aria-labelledby="criacoes-title"
    >
      <div className={pan ? "sticky top-0 flex h-[100dvh] flex-col justify-center overflow-hidden pt-16" : "py-10"}>
        <div className="gutter mx-auto mb-10 flex w-full max-w-[1600px] items-end justify-between gap-6 md:mb-14">
          <MaskedTitle
            as="h2"
            id="criacoes-title"
            text="Criações"
            className="font-display text-[clamp(2.8rem,6vw,6rem)] leading-none"
          />
          <Link
            to="/criacoes/"
            prefetch="intent"
            data-curtain-label="Criações"
            className="link-underline hidden pb-3 text-sm text-mute hover:text-bone sm:inline"
          >
            Todas as criações
          </Link>
        </div>

        <motion.div
          ref={track}
          style={pan ? { x } : undefined}
          className={`relative flex gap-5 md:gap-8 ${
            pan ? "w-max pr-[6vw] pl-4 sm:pl-6 lg:pl-10" : "no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-10 lg:px-10"
          }`}
        >
          {repertoire.map((p) => (
            <Link
              key={p.slug}
              to={`/${p.slug}/`}
              prefetch="intent"
              data-curtain-label={p.short}
              className="tremble group w-[82vw] shrink-0 snap-start sm:w-[60vw] md:w-[min(44vw,780px)]"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden bg-ink-2 md:aspect-[16/10] ${
                  p.status === "em-cartaz" ? "ring-2 ring-lilac ring-offset-4 ring-offset-ink" : ""
                }`}
              >
                <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]">
                  <Img src={p.cover} alt={p.title} fill position={p.coverPosition} sizes="(min-width: 768px) 44vw, 82vw" />
                </div>
                <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/20" />
                {/* Real status, not decoration: marks the show that is running now. */}
                {p.status && <StatusBadge status={p.status} className="absolute top-4 left-4 shadow-lg shadow-ink/40" />}
              </div>
              <div className="mt-5 flex items-start justify-between gap-6">
                <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.6rem)] leading-[1.05] text-bone transition-colors group-hover:text-lilac">
                  <Tremble>{p.title}</Tremble>
                </h3>
                <p className="shrink-0 pt-2 text-right text-sm text-mute">
                  {p.kind}
                  {p.year && <span className="block text-bone/60">{p.year}</span>}
                </p>
              </div>
              <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-mute">{p.logline}</p>
            </Link>
          ))}

          <Link
            to="/criacoes/"
            prefetch="intent"
            data-curtain-label="Criações"
            className="group flex w-[60vw] shrink-0 snap-start flex-col justify-center border-l border-line pl-8 sm:w-[36vw] md:w-[24vw]"
          >
            <span className="font-display text-4xl leading-tight text-bone transition-colors group-hover:text-lilac md:text-5xl">
              Todas as criações
            </span>
            <ArrowRight size={36} weight="thin" className="mt-6 text-lilac transition-transform duration-500 group-hover:translate-x-2" />
          </Link>
        </motion.div>

        {pan && (
          <div className="gutter mx-auto mt-12 w-full max-w-[1600px]" aria-hidden>
            <motion.div className="h-px origin-left bg-lilac" style={{ scaleX: smooth }} />
          </div>
        )}
      </div>
    </section>
  );
}
