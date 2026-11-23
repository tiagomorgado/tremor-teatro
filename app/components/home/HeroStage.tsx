import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { featured, STATUS_LABEL } from "~/data/projects";
import { Img } from "../Img";
import { ButtonLink } from "../Button";
import { Magnetic } from "../Magnetic";

/**
 * Home page hero ("Palco", the stage).
 *
 * 1. A velvet curtain parts on arrival (CSS, once per session; see root.tsx).
 * 2. The stage is dark; the word TREMOR is cut out of the darkness, so the production
 *    photos are only visible through the letters. The pointer acts as a torch.
 * 3. Scrolling zooms through the word and dissolves the dark, revealing the full photo,
 *    then the statement and calls to action rise in.
 *
 * The dark layer is `mix-blend-mode: multiply`: ink everywhere, white letters. White
 * multiplied by the photo is the photo; ink multiplied by anything is near-black.
 */

// The show in cartaz leads (bright, colourful stills read best through the letters),
// followed by earlier work.
const NEW_SHOW = { title: "E se o meu coração parar", to: "/e-se-o-meu-coracao-parar/" };
/** First image on screen (the LCP element); preloaded from the home route's links(). */
export const HERO_FIRST_IMAGE = "coracao-cena/coracao-cena-22";
const slides = [
  { src: HERO_FIRST_IMAGE, ...NEW_SHOW },
  { src: "coracao-cena/coracao-cena-19", ...NEW_SHOW },
  { src: "coracao-cena/coracao-cena-12", ...NEW_SHOW },
  { src: "coracao-cena/coracao-cena-08", ...NEW_SHOW },
  { src: "fogo-fatuo/fogo-fatuo-19", title: "Fogo-Fátuo", to: "/fogo-fatuo/" },
  { src: "misc/secretum-54-de-54-scaled", title: "Secretum", to: "/secretum/" },
];
const INTERVAL = 3800;

// After the first time the hero mounts in this tab, in-app returns to "/" skip the curtain.
let introPlayed = false;

export function HeroStage() {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // false during hydration (matches the pre-rendered HTML); true on later client mounts.
  const [skipIntro] = useState(() => typeof window !== "undefined" && introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!ready || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearInterval(id);
  }, [ready, reduce]);

  // Progress through the hero, 0 at the top of the page and 1 when it unpins.
  // Computed from the live page scroll and the section's measured size rather than
  // useScroll({ target }): that one caches the target's offsets and, measured mid-load,
  // could start the page already zoomed in (TREMOR spilling off both edges).
  const { scrollY } = useScroll();
  const start = useMotionValue(0);
  const run = useMotionValue(1);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const measure = () => {
      start.set(el.getBoundingClientRect().top + window.scrollY);
      run.set(Math.max(1, el.offsetHeight - window.innerHeight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [start, run]);
  const progress = useTransform([scrollY, start, run], ([y, s, r]: number[]) => Math.min(1, Math.max(0, (y - s) / r)));
  const p = useSpring(progress, { stiffness: 180, damping: 34, mass: 0.25 });

  const wordScale = useTransform(p, [0, 0.6], [1, 9]);
  const darkness = useTransform(p, [0.18, 0.55], [1, 0]);
  const outline = useTransform(p, [0.04, 0.22], [1, 0]);
  const photoScale = useTransform(p, [0, 1], [1.18, 1]);
  const introFade = useTransform(p, [0, 0.12], [1, 0]);
  const contentFade = useTransform(p, [0.5, 0.72], [0, 1]);
  const contentY = useTransform(p, [0.5, 0.78], [48, 0]);
  const scrim = useTransform(p, [0.45, 0.75], [0, 1]);

  // Only flips a boolean: stage-2 links must not be clickable while invisible.
  useMotionValueEvent(contentFade, "change", (v) => {
    const next = v > 0.5;
    if (next !== revealed) setRevealed(next);
  });

  // Torch: pointer position in px, sprung.
  const tx = useMotionValue(-2000);
  const ty = useMotionValue(-2000);
  const stx = useSpring(tx, { stiffness: 120, damping: 22, mass: 0.6 });
  const sty = useSpring(ty, { stiffness: 120, damping: 22, mass: 0.6 });
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    tx.set(e.clientX);
    ty.set(e.clientY);
  };

  const next = featured;
  const current = slides[index];

  if (reduce) return <StaticStage />;

  return (
    <section ref={section} onPointerMove={onMove} className={`relative h-[260dvh] ${skipIntro ? "stage-skip" : ""}`} aria-label="Apresentação">
      {/* 1. Curtain (pure CSS, hidden after the first visit of the session) */}
      {!skipIntro && (
        <div aria-hidden className="stage-curtain pointer-events-none fixed inset-0 z-[65] flex overflow-hidden">
          <div className="stage-curtain-left h-full w-1/2" />
          <div className="stage-curtain-right h-full w-1/2" />
        </div>
      )}

      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {/* Photos */}
        <motion.div className="absolute inset-0" style={{ scale: photoScale }}>
          {slides.map((s, i) =>
            i === 0 || ready ? (
              <div
                key={s.src}
                className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
                style={{ opacity: i === index ? 1 : 0 }}
                aria-hidden
              >
                <Img src={s.src} alt="" fill priority={i === 0} sizes="100vw" />
              </div>
            ) : null,
          )}
        </motion.div>

        {/* 2. The dark stage with the word cut out of it (SVG mask, see StageMask). */}
        <StageMask darkness={darkness} outline={outline} scale={wordScale} torchX={stx} torchY={sty} />

        {/* Stage 1: framing text around the word */}
        <motion.div style={{ opacity: introFade }} className="gutter pointer-events-none absolute inset-x-0 bottom-0 mx-auto flex max-w-[1600px] items-end justify-between gap-6 pb-8 md:pb-12">
          <p className="stage-fade max-w-[30ch] text-sm leading-relaxed text-bone/70 md:text-base">
            Teatro, performance e cinema. Estrutura de criação artística fundada por Patrícia Moreira.
          </p>
          {next && (
            <Link
              to={`/${next.slug}/`}
              prefetch="intent"
              data-curtain-label={next.short}
              className="stage-fade group pointer-events-auto hidden items-center gap-3 text-sm text-bone/80 transition-colors hover:text-lilac sm:flex"
              tabIndex={revealed ? -1 : 0}
            >
              <span className="text-right leading-tight">
                <span className="block text-lilac">{next.status && STATUS_LABEL[next.status]}</span>
                {next.title}
              </span>
              <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>

        {/* Stage 2: the statement over the revealed photo */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" style={{ opacity: scrim }} />
        <motion.div
          style={{ opacity: contentFade, y: contentY }}
          className={`gutter absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] pb-12 md:pb-16 ${revealed ? "" : "pointer-events-none"}`}
          // Keyboard users tabbing in before scrolling: jump to the revealed state so they see focus.
          onFocusCapture={() => {
            const el = section.current;
            if (!revealed && el) window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight });
          }}
        >
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h1 className="font-display text-[clamp(2.8rem,min(6.6vw,11dvh),7.4rem)] leading-[0.98] tracking-[-0.01em] text-bone">
                Obras que almejam ecoar. <em className="pr-[0.06em] text-lilac">Dentro.</em>
              </h1>
              <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-bone/80 md:mt-8 md:text-xl">
                Estrutura de criação artística pluridisciplinar fundada por Patrícia Moreira. Teatro, performance e cinema entre o verbo e o corpo.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
                <Magnetic>
                  <ButtonLink to="/criacoes/" curtainLabel="Criações">
                    Ver criações
                  </ButtonLink>
                </Magnetic>
                <ButtonLink to="/galeria/" variant="ghost" curtainLabel="Galeria" arrow={false}>
                  Galeria
                </ButtonLink>
              </div>
            </div>
            <div className="hidden text-right text-sm text-mute md:col-span-4 md:block">
              <AnimatePresence mode="wait">
                <motion.div key={current.src} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }}>
                  <Link to={current.to} className="link-underline hover:text-bone" data-curtain-label={current.title}>
                    {current.title}
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The dark stage as ONE viewport-sized SVG: an ink rectangle masked by
 *   white (keep the dark)  minus  the word in black (holes that show the photo)
 *   minus a soft grey torch around the pointer (partial reveal).
 *
 * Why not CSS `mix-blend-mode` + a scaled HTML word: at 9× zoom the word becomes an
 * ~12,000px GPU layer that Chrome tiles, and after scrolling away and back it repaints
 * the blended group from stale tiles (half the letters white, half missing). Here the
 * zoom only changes the mask geometry, so the drawing surface is always one screen.
 */
function StageMask({
  darkness,
  outline,
  scale,
  torchX,
  torchY,
}: {
  darkness: MotionValue<number>;
  outline: MotionValue<number>;
  scale: MotionValue<number>;
  torchX: MotionValue<number>;
  torchY: MotionValue<number>;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <motion.svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: darkness }}>
      <defs>
        <radialGradient id={`${id}-torch`}>
          <stop offset="0%" stopColor="#000" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
          <rect width="100%" height="100%" fill="#fff" />
          {/* Torch (desktop): a soft partial reveal that follows the pointer. */}
          <motion.circle r="35vmax" fill={`url(#${id}-torch)`} style={{ x: torchX, y: torchY }} className="hidden md:inline" />
          <motion.g style={{ scale, transformOrigin: "50% 50%", transformBox: "view-box" }}>
            <WordText fill="#000" className="stage-word" />
          </motion.g>
        </mask>
      </defs>
      <rect width="100%" height="100%" className="fill-ink" mask={`url(#${id}-mask)`} />
      {/* A hairline lilac outline of the word, so its shape reads even over dark photo areas. */}
      <motion.g style={{ scale, opacity: outline, transformOrigin: "50% 50%", transformBox: "view-box" }}>
        <WordText fill="none" stroke="rgb(217 194 242 / 0.45)" strokeWidth={1} vectorEffect="non-scaling-stroke" className="stage-word" />
      </motion.g>
    </motion.svg>
  );
}

/** TREMOR on one line from `sm` up; stacked TRE / MOR on phones so it stays huge. */
function WordText({ className = "", ...props }: React.SVGProps<SVGTextElement>) {
  // font-size goes in `style`: a CSS `font` shorthand would override the attribute.
  const style = (size: string) => ({ fontFamily: "var(--font-sans)", fontWeight: 900, fontSize: size, letterSpacing: "-0.045em" });
  const common = { ...props, x: "50%", textAnchor: "middle" as const, dominantBaseline: "central" as const };
  return (
    <>
      <text {...common} y="50%" className={`${className} hidden sm:inline`} style={style("22vw")}>
        TREMOR
      </text>
      <text {...common} className={`${className} sm:hidden`} style={style("40vw")}>
        <tspan x="50%" y="50%" dy="-0.42em">
          TRE
        </tspan>
        <tspan x="50%" y="50%" dy="0.42em">
          MOR
        </tspan>
      </text>
    </>
  );
}

/** Reduced motion: no curtain, no zoom. The revealed state, straight away. */
function StaticStage() {
  const s = slides[0];
  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden" aria-label="Apresentação">
      <Img src={s.src} alt="" fill priority sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
      <div className="gutter relative mx-auto w-full max-w-[1600px] pb-12 md:pb-16">
        <h1 className="max-w-[16ch] font-display text-[clamp(2.8rem,min(6.6vw,11dvh),7.4rem)] leading-[0.98] text-bone">
          Obras que almejam ecoar. <em className="text-lilac">Dentro.</em>
        </h1>
        <p className="mt-6 max-w-[38ch] text-lg leading-relaxed text-bone/80">
          Estrutura de criação artística pluridisciplinar fundada por Patrícia Moreira. Teatro, performance e cinema entre o verbo e o corpo.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink to="/criacoes/" curtainLabel="Criações">
            Ver criações
          </ButtonLink>
          <ButtonLink to="/galeria/" variant="ghost" curtainLabel="Galeria" arrow={false}>
            Galeria
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
