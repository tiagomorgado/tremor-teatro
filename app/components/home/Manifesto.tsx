import { Fragment } from "react";
import { manifesto } from "~/data/site";
import { Reveal } from "../Reveal";

// The statement is split for reading: the first sentence becomes the lead, the rest is body
// text in two paragraphs (the break falls before "Procura romper…").
const [lead, ...restSentences] = manifesto.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/);
const rest = restSentences.join(" ");
const breakAt = rest.indexOf("Procura romper");
const paragraphs = breakAt > 0 ? [rest.slice(0, breakAt).trim(), rest.slice(breakAt).trim()] : [rest];

/**
 * The founder's statement. The lead lights up word by word as it scrolls in (pure CSS
 * scroll timeline, see .scroll-words); the body sits beside it at reading size, so the
 * whole statement fits in about one screen.
 */
export function Manifesto() {
  return (
    <section className="gutter mx-auto grid grid-cols-1 max-w-[1600px] gap-12 py-24 md:grid-cols-12 md:gap-10 md:py-36" aria-label="Sobre a Tremor Teatro">
      <div className="md:col-span-5">
        <p className="scroll-words font-display text-[clamp(2rem,3.4vw,3.4rem)] leading-[1.1] text-bone">
          {lead.split(" ").map((w, i) => (
            <Fragment key={i}>
              <span>{w}</span>{" "}
            </Fragment>
          ))}
        </p>
        <Reveal className="mt-10 flex items-center gap-5">
          <span className="h-px w-16 bg-lilac" aria-hidden />
          <p className="text-sm text-mute">
            Patrícia Moreira, <span className="text-bone/80">fundadora</span>
          </p>
        </Reveal>
      </div>

      <div className="md:col-span-6 md:col-start-7 md:pt-3">
        {paragraphs.map((text, i) => (
          <Reveal key={i} delay={i * 0.08} y={18}>
            <p className={`max-w-[58ch] font-serif text-[1.2rem] leading-[1.65] text-bone/80 md:text-[1.35rem] ${i > 0 ? "mt-6" : ""}`}>
              {text.endsWith("Dentro.") ? (
                <>
                  {text.slice(0, -"Dentro.".length)}
                  <em className="text-lilac">Dentro.</em>
                </>
              ) : (
                text
              )}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
