import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.16, 1, 0.3, 1] as const;

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
  ...rest
}: { children: ReactNode; delay?: number; y?: number; as?: "div" | "li" | "section" | "p" } & HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/**
 * Headline whose words rise out of a mask, staggered.
 * `animateOnMount` for above-the-fold titles, otherwise triggers in view.
 */
export function MaskedTitle({
  text,
  className = "",
  as = "h1",
  delay = 0,
  animateOnMount = false,
  italicLast = false,
  id,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  animateOnMount?: boolean;
  italicLast?: boolean;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  // The trigger lives on the heading: IntersectionObserver treats the masked (clipped)
  // word spans as invisible, so they could never fire `whileInView` themselves.
  const Tag = (animateOnMount ? as : motion[as]) as "h1";
  const motionProps = animateOnMount
    ? {}
    : { initial: reduce ? false : "hidden", whileInView: "show", viewport: { once: true, amount: 0.4 } };
  return (
    <Tag id={id} className={className} aria-label={text} {...motionProps}>
      {words.map((w, i) => {
        const cls = `inline-block ${italicLast && i === words.length - 1 ? "italic text-lilac pr-[0.06em]" : ""}`;
        return (
          <span key={i} aria-hidden className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
            {animateOnMount ? (
              // Above the fold: pure CSS so the title animates before (and without) hydration.
              <span className={`${cls} rise-word`} style={{ ["--d" as string]: `${delay + i * 0.06}s` }}>
                {w}
              </span>
            ) : (
              <motion.span
                className={cls}
                variants={{
                  hidden: { y: "110%" },
                  show: { y: "0%", transition: { duration: 1.05, delay: delay + i * 0.06, ease } },
                }}
              >
                {w}
              </motion.span>
            )}
            {i < words.length - 1 ? "\u00a0" : null}
          </span>
        );
      })}
    </Tag>
  );
}
