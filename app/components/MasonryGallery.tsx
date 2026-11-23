import { useState } from "react";
import { getMedia } from "~/data/media";
import { Img } from "./Img";
import { Lightbox, type LightboxItem } from "./Lightbox";

/** Vertical gap between tiles, in grid row units (1 unit = 1% of a column's width). */
const GAP_UNITS = 4;

/**
 * Masonry of photographs, each opening the lightbox.
 *
 * Deliberately not CSS `columns`: browsers mis-paint animated/composited children inside
 * multi-column layout (tiles at the top of later columns vanish or jump while scrolling).
 * Instead this is a grid whose row unit is 1% of the column width (container query units),
 * so each tile spans a fixed number of rows derived from its known aspect ratio. Same
 * masonry look, one DOM, no layout JS, left-to-right reading order.
 */
export function MasonryGallery({ items, columns = 3 }: { items: LightboxItem[]; columns?: 2 | 3 }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <div className="@container">
        <ul className={`masonry ${columns === 3 ? "masonry-3" : "masonry-2"}`}>
          {items.map((it, i) => {
            const m = getMedia(it.src);
            const span = Math.round((100 * m.h) / m.w) + GAP_UNITS;
            const alt = `${it.caption}, fotografia ${i + 1} de ${items.length}`;
            return (
              <li key={it.src + i} className="reveal-view self-start" style={{ gridRowEnd: `span ${span}` }}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className="group relative block w-full overflow-hidden bg-ink-2"
                  aria-label={`Ampliar: ${alt}`}
                >
                  <Img
                    src={it.src}
                    alt={alt}
                    sizes={columns === 3 ? "(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw" : "(min-width: 640px) 48vw, 100vw"}
                    imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-lilac/0 transition-colors duration-500 group-hover:bg-lilac/10" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
