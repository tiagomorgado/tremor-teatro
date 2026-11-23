import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { nav, site } from "~/data/site";
import { Logo } from "./Logo";
import { Tremble } from "./Tremble";
import { useStage } from "./Stage";

export function Nav() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { lockScroll } = useStage();

  // Hide on scroll down, reveal on scroll up. Only flips booleans, no per-frame renders.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const nextHidden = y > 140 && y > prev;
    if (nextHidden !== hidden) setHidden(nextHidden);
    const nextSolid = y > 40;
    if (nextSolid !== solid) setSolid(nextSolid);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    lockScroll(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lockScroll]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-40"
        animate={{ y: hidden && !open ? "-100%" : "0%" }}
        transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ${
            solid && !open ? "opacity-100" : "opacity-0"
          } bg-ink/75 backdrop-blur-md`}
        />
        <nav className="gutter mx-auto flex h-16 max-w-[1600px] items-center justify-between md:h-[72px]" aria-label="Principal">
          <Link
            to="/"
            className="tremble -m-2 flex cursor-pointer items-center p-2 select-none"
            aria-label="Tremor Teatro, página inicial"
            data-curtain-label="Tremor Teatro"
          >
            <Logo className="h-9 w-auto md:h-11" />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  prefetch="intent"
                  data-curtain-label={item.label}
                  className={({ isActive }) =>
                    `tremble text-[15px] tracking-wide transition-colors ${isActive ? "text-lilac" : "text-bone/80 hover:text-bone"}`
                  }
                >
                  <Tremble>{item.label}</Tremble>
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 flex h-11 items-center gap-2 rounded-full px-3 text-sm text-bone lg:hidden"
            aria-expanded={open}
            aria-controls="menu"
          >
            {open ? <X size={22} weight="light" /> : <List size={22} weight="light" />}
            <span>{open ? "Fechar" : "Menu"}</span>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            className="fixed inset-0 z-30 flex flex-col justify-between bg-ink pt-24 pb-10 lg:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="gutter space-y-1">
              {[{ label: "Início", to: "/" }, ...nav].map((item, i) => (
                <li key={item.to} className="overflow-hidden">
                  <motion.div
                    initial={reduce ? false : { y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.8, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <NavLink
                      to={item.to}
                      data-curtain-label={item.label}
                      className={({ isActive }) =>
                        `block py-1 font-display text-5xl leading-tight ${isActive ? "italic text-lilac" : "text-bone"}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                </li>
              ))}
            </ul>
            <div className="gutter flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
              <a href={`mailto:${site.email}`} className="text-bone">
                {site.email}
              </a>
              {site.social.slice(0, 3).map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
