import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Img } from "../Img";
import { MaskedTitle, Reveal } from "../Reveal";
import { ButtonLink } from "../Button";

export function Founder() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section className="gutter mx-auto grid grid-cols-1 max-w-[1600px] items-center gap-12 py-28 md:grid-cols-12 md:py-40">
      <div ref={ref} className="group relative aspect-[4/5] overflow-hidden bg-ink-2 md:col-span-5">
        <motion.div
          className="absolute -inset-y-[10%] inset-x-0 brightness-[0.82] contrast-[1.08] grayscale transition-[filter] duration-1000 group-hover:grayscale-0"
          style={{ y }}
        >
          <Img src="misc/patriciamoreiraperfil" alt="Retrato de Patrícia Moreira" fill sizes="(min-width: 768px) 40vw, 100vw" />
        </motion.div>
      </div>

      <div className="md:col-span-6 md:col-start-7">
        <MaskedTitle as="h2" text="Patrícia Moreira" className="font-display text-[clamp(2.6rem,5vw,5.2rem)] leading-none" />
        <Reveal delay={0.1}>
          <p className="mt-4 text-mute">Escritora, dramaturga, encenadora e produtora</p>
          <p className="mt-10 max-w-[52ch] font-serif text-xl leading-relaxed text-bone/90 md:text-2xl">
            Fundou a Tremor Teatro em 2020. Em 2022, o Programa IBERESCENA e a DGArtes escolheram-na como única representante
            de Portugal num encontro ibero-americano sobre propriedade intelectual, em Madrid.
          </p>
          <div className="mt-10">
            <ButtonLink to="/patricia-biografia/" variant="ghost" curtainLabel="Patrícia Moreira">
              Biografia
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
