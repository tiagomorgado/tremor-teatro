import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import { Img } from "./Img";
import { useStage } from "./Stage";

export type LightboxItem = { src: string; caption: string };

/** Full-screen viewer: keyboard (← → Esc), swipe, and focus kept inside while open. */
export function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const { lockScroll } = useStage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const direction = useRef(1);
  const open = index !== null;

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      direction.current = delta;
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockScroll(false);
      previouslyFocused?.focus();
    };
  }, [open, go, onClose, lockScroll]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de imagens"
          className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-ink/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="gutter flex h-16 shrink-0 items-center justify-between text-sm text-mute md:h-20">
            <p aria-live="polite">
              <span className="text-bone">{item.caption}</span>
              <span className="ml-4 tabular-nums">
                {index! + 1} / {items.length}
              </span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="-mr-2 flex h-11 items-center gap-2 rounded-full px-3 text-bone hover:text-lilac"
            >
              <X size={22} weight="light" />
              <span>Fechar</span>
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            <AnimatePresence initial={false} custom={direction.current} mode="popLayout">
              <motion.div
                key={item.src}
                custom={direction.current}
                className="absolute inset-0 px-4 pb-4 md:px-24 md:pb-10"
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 60 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -60 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                drag={reduce ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70 || info.velocity.x < -400) go(1);
                  else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
                }}
              >
                <div className="relative h-full w-full">
                  <Img src={item.src} alt={`${item.caption}, fotografia ${index! + 1} de ${items.length}`} fill contain sizes="100vw" priority />
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Imagem anterior"
              className="absolute top-1/2 left-3 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-lilac hover:text-lilac md:flex"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Imagem seguinte"
              className="absolute top-1/2 right-3 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:border-lilac hover:text-lilac md:flex"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
