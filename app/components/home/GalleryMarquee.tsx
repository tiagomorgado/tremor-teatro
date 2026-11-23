import { getMedia } from "~/data/media";
import { Img } from "../Img";
import { MaskedTitle } from "../Reveal";
import { ButtonLink } from "../Button";

const picks = [
  "coracao-cena/coracao-cena-17",
  "fogo-fatuo/fogo-fatuo-08",
  "secretum/secretum-13",
  "nucleo/nucleo-21",
  "curta/curta-03",
  "fogo-fatuo/fogo-fatuo-18",
  "nucleo/nucleo-04",
  "secretum/secretum-06",
  "fogo-fatuo/fogo-fatuo-27",
  "coracao-cena/coracao-cena-66",
  "nucleo/nucleo-20",
  "curta/curta-08",
  "fogo-fatuo/fogo-fatuo-10",
];

/** The page's single marquee: a slow drift of photographs across all creations. */
export function GalleryMarquee() {
  return (
    <section className="overflow-hidden py-24 md:py-32" aria-labelledby="galeria-title">
      <div className="gutter mx-auto mb-12 flex max-w-[1600px] flex-wrap items-end justify-between gap-6">
        <MaskedTitle as="h2" id="galeria-title" text="Galeria" className="font-display text-[clamp(2.6rem,5vw,5.2rem)] leading-none" />
        <ButtonLink to="/galeria/" variant="ghost" curtainLabel="Galeria">
          Ver galeria
        </ButtonLink>
      </div>
      <div className="marquee" aria-hidden style={{ ["--marquee-duration" as string]: "80s" }}>
        <div className="marquee-track flex w-max gap-4">
          {[...picks, ...picks].map((src, i) => {
            const m = getMedia(src);
            return (
              <div key={i} className="relative h-[38vh] shrink-0 overflow-hidden md:h-[52vh]" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
                <Img src={src} alt="" fill sizes="(min-width: 768px) 40vw, 70vw" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
