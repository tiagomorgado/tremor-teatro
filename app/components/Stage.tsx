import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { animate, motion, useReducedMotion, useMotionValue } from "motion/react";
import type Lenis from "lenis";
import { BASE } from "~/lib/base";

/**
 * App-wide "stage": smooth scrolling (Lenis) and the curtain page transition.
 *
 * Internal link clicks are intercepted in the capture phase: the curtain falls,
 * the route changes underneath it, and the curtain rises on the new page.
 * Modifier-clicks, new tabs, hashes and external links are left alone.
 */

type StageCtx = { lockScroll: (locked: boolean) => void };
const Ctx = createContext<StageCtx>({ lockScroll: () => {} });
export const useStage = () => useContext(Ctx);

export function Stage({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);
  const busy = useRef(false);
  const [label, setLabel] = useState("");
  // Curtain position: "-101%" raised out of view, "0%" covering, "101%" waiting below.
  const y = useMotionValue("-101%");

  // Smooth scroll, loaded lazily so it never delays first paint.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    let lenis: Lenis | null = null;
    let cancelled = false;
    import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;
      lenis = new LenisCtor({ lerp: 0.11, wheelMultiplier: 1, anchors: true });
      lenisRef.current = lenis;
      const loop = (t: number) => {
        lenis!.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [reduce]);

  const lockScroll = useCallback((locked: boolean) => {
    const l = lenisRef.current;
    if (l) locked ? l.stop() : l.start();
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, []);

  // Intercept internal navigations.
  useEffect(() => {
    if (reduce) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noCurtain !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page / hash links
      // The router adds the base folder itself (GitHub Pages preview), so hand it the path
      // without it; anything outside the site's folder is a normal page load.
      if (!url.pathname.startsWith(BASE)) return;
      const to = "/" + url.pathname.slice(BASE.length);
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      setLabel(a.dataset.curtainLabel ?? "");
      y.set("101%");
      animate(y, "0%", { duration: 0.55, ease: [0.76, 0, 0.24, 1] }).then(() => {
        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
        window.scrollTo(0, 0);
        navigate(to + url.search + url.hash);
      });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduce, navigate, y]);

  // Raise the curtain once the new route has rendered.
  useEffect(() => {
    if (!busy.current) return;
    const id = requestAnimationFrame(() => {
      animate(y, "-101%", { duration: 0.75, ease: [0.76, 0, 0.24, 1], delay: 0.08 }).then(() => {
        busy.current = false;
        setLabel("");
      });
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname, y]);

  return (
    <Ctx.Provider value={{ lockScroll }}>
      {children}
      <motion.div
        aria-hidden
        style={{ y }}
        className="pointer-events-none fixed inset-0 z-[60] flex items-end bg-ink-2"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-lilac/60" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-lilac/60" />
        <p className="gutter pb-10 font-display text-4xl text-lilac md:text-6xl">{label}</p>
      </motion.div>
    </Ctx.Provider>
  );
}
