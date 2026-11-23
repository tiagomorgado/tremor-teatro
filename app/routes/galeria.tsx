import { useEffect, useMemo, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import type { Route } from "./+types/galeria";
import { getProjectByGallery, projects } from "~/data/projects";
import { breadcrumbs, seo, slugFrom } from "~/lib/seo";
import { gallerySchema } from "~/lib/schema";
import { withBase } from "~/lib/base";
import { PageHeader } from "~/components/PageHeader";
import { MasonryGallery } from "~/components/MasonryGallery";

type Filter = { id: string; label: string; items: { src: string; caption: string }[]; project?: string };

const filters: Filter[] = (() => {
  const perGallery: Filter[] = projects.flatMap((p) =>
    p.galleries.map((g) => ({
      id: g.slug,
      label: p.galleries.length > 1 ? `${p.short}, ${g.label.toLowerCase()}` : p.short,
      project: p.slug,
      items: g.images.map((src) => ({ src, caption: `${p.short}, ${g.label.toLowerCase()}` })),
    })),
  );
  // "Todas" interleaves the shows so the first screen is not a single production.
  const pools = perGallery.map((f) => [...f.items]);
  const all: Filter["items"] = [];
  while (pools.some((p) => p.length)) for (const p of pools) if (p.length) all.push(p.shift()!);
  return [{ id: "galeria", label: "Todas", items: all }, ...perGallery];
})();

export const meta: Route.MetaFunction = ({ location }) => {
  const match = getProjectByGallery(slugFrom(location.pathname));
  return seo({
    title: match ? `Galeria ${match.project.short}, ${match.gallery.label.toLowerCase()}` : "Galeria",
    description: match
      ? `Fotografias de ${match.project.title} (${match.gallery.label.toLowerCase()}), uma criação Tremor Teatro.`
      : "Fotografias de cena e de ensaio de todas as criações da Tremor Teatro.",
    path: location.pathname,
    image: match ? match.gallery.images[0] : "fogo-fatuo/fogo-fatuo-08",
    jsonLd: match
      ? [
          gallerySchema(match.project, match.gallery),
          breadcrumbs([{ name: "Galeria", path: "/galeria" }, { name: match.project.short, path: `/${match.gallery.slug}` }]),
        ]
      : [breadcrumbs([{ name: "Galeria", path: "/galeria" }])],
  });
};

export default function Galeria() {
  // All gallery URLs share this module: remount per URL so the filter follows the address
  // (otherwise going /galeria-secretum/ -> /galeria/ in-app keeps the old selection).
  const { pathname } = useLocation();
  return <GaleriaView key={slugFrom(pathname)} initial={slugFrom(pathname)} />;
}

function GaleriaView({ initial }: { initial: string }) {
  const [active, setActive] = useState(filters.some((f) => f.id === initial) ? initial : "galeria");
  const f = useMemo(() => filters.find((x) => x.id === active)!, [active]);

  return (
    <>
      <PageHeader title="Galeria" intro="Fotografias de cena e de ensaio. Selecione uma criação ou percorra todas.">
        <FilterTabs active={active} onSelect={setActive} />
      </PageHeader>

      <section className="gutter mx-auto max-w-[1600px]" aria-live="polite">
        {f.project && (
          <p className="mb-8 text-sm text-mute">
            Da criação{" "}
            <Link to={`/${f.project}/`} className="link-underline text-bone">
              {projects.find((p) => p.slug === f.project)!.title}
            </Link>
          </p>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <MasonryGallery items={f.items} />
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
}

/**
 * The filter pills. On narrow screens they sit in one row that scrolls sideways; the
 * edges fade and arrow buttons appear while there is more to see, so it reads as a row
 * that continues rather than one that ends at the screen edge. Wider screens wrap them.
 */
function FilterTabs({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  useEffect(() => {
    const el = row.current!;
    const update = () =>
      setMore({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
    // Opened on a specific gallery: bring its pill into view.
    const current = el.querySelector<HTMLElement>('[aria-selected="true"]');
    if (current && current.offsetLeft + current.offsetWidth > el.clientWidth) el.scrollLeft = current.offsetLeft - 16;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  const page = (dir: 1 | -1) => {
    const el = row.current!;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: smooth() });
  };
  const select = (id: string, button: HTMLElement) => {
    onSelect(id);
    // Keep the legacy per-gallery URLs shareable without a navigation.
    window.history.replaceState(window.history.state, "", withBase(id === "galeria" ? "/galeria/" : `/${id}/`));
    const el = row.current!;
    el.scrollTo({ left: button.offsetLeft - (el.clientWidth - button.offsetWidth) / 2, behavior: smooth() });
  };

  // Pills fade out completely before the arrow, so the arrow never sits on top of text.
  const left = more.left ? "transparent 52px, #000 120px" : "#000 0px";
  const right = more.right ? "#000 calc(100% - 120px), transparent calc(100% - 52px)" : "#000 100%";
  const mask = `linear-gradient(to right, ${left}, ${right})`;
  const arrow =
    "absolute top-0 flex h-10 w-10 items-center justify-center rounded-full border border-lilac/60 bg-ink text-lilac transition-opacity duration-300";

  return (
    <div className="fade-in relative -mx-4 mt-12 sm:mx-0" style={{ ["--d" as string]: "0.6s" }}>
      <div
        ref={row}
        role="tablist"
        aria-label="Filtrar por criação"
        className="no-scrollbar relative flex gap-2 overflow-x-auto px-4 pb-2 sm:flex-wrap sm:px-0"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {filters.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === active}
            onClick={(e) => select(x.id, e.currentTarget)}
            className={`h-10 shrink-0 rounded-full px-5 text-sm whitespace-nowrap transition-colors ${
              x.id === active ? "bg-lilac text-ink" : "border border-bone/20 text-bone/80 hover:border-bone"
            }`}
          >
            {x.label}
            <span className={`ml-2 tabular-nums ${x.id === active ? "text-ink/60" : "text-mute"}`}>{x.items.length}</span>
          </button>
        ))}
      </div>
      {/* Pointer/touch shortcuts only: the pills themselves are all reachable by keyboard. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => page(-1)}
        className={`${arrow} left-3 ${more.left ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => page(1)}
        className={`${arrow} right-3 ${more.right ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}
