import type { Route } from "./+types/biografia";
import { bio } from "~/data/site";
import { breadcrumbs, canonicalUrl, seo } from "~/lib/seo";
import { personSchema } from "~/lib/schema";
import { Img } from "~/components/Img";
import { MaskedTitle, Reveal } from "~/components/Reveal";
import { ButtonLink } from "~/components/Button";

export const meta: Route.MetaFunction = ({ location }) =>
  seo({
    title: "Patrícia Moreira",
    description: "Patrícia Moreira, escritora e criadora, fundadora da Tremor Teatro. Dramaturga, produtora e encenadora.",
    path: location.pathname,
    image: "misc/patriciamoreiraperfil",
    type: "profile",
    jsonLd: [
      { "@type": "ProfilePage", url: canonicalUrl("/patricia-biografia"), mainEntity: personSchema() },
      breadcrumbs([{ name: "Patrícia Moreira", path: "/patricia-biografia" }]),
    ],
  });

// Dates come from the biography and the company's own press material.
const milestones = [
  { year: "2015", text: "Prémio literário Belas Letras do Instituto Politécnico de Lisboa, com o texto Da Seiva e do Sal." },
  { year: "2020", text: "Funda a Tremor Teatro. Estreia Secretum na Estufa Fria de Lisboa." },
  { year: "2021", text: "Estreia Fogo-Fátuo no Centro Cultural Raiano, em Idanha-a-Nova, com apoio IBERESCENA." },
  { year: "2022", text: "Única representante de Portugal no encontro do IBERESCENA e da SEGIB sobre propriedade intelectual, em Madrid." },
  { year: "2023", text: "Há um núcleo estático no interior do caos, a partir de A Casa de Bernarda Alba." },
];

export default function Biografia() {
  return (
    <>
      <section className="gutter mx-auto grid grid-cols-1 max-w-[1600px] gap-12 pt-32 md:grid-cols-12 md:pt-40">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <div className="fade-in relative aspect-[4/5] overflow-hidden bg-ink-2">
              <Img src="misc/patriciamoreiraperfil" alt="Retrato de Patrícia Moreira" fill priority sizes="(min-width: 768px) 40vw, 100vw" imgClassName="grayscale-[0.4]" />
            </div>
          </div>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <MaskedTitle text="Patrícia Moreira" animateOnMount delay={0.1} className="font-display text-[clamp(3rem,7vw,7.4rem)] leading-[0.95]" />
          <p className="fade-in mt-5 text-mute" style={{ ["--d" as string]: "0.4s" }}>
            Fundadora da Tremor Teatro
          </p>
          <div className="mt-14">
            {bio.map((p, i) => (
              <Reveal key={i} y={16}>
                <p className={i === 0 ? "font-serif text-[clamp(1.35rem,2vw,1.8rem)] leading-[1.45] text-bone" : "mt-7 text-lg leading-[1.75] text-bone/80"}>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12">
            <ButtonLink to="/contacto/" curtainLabel="Contacto">
              Contactar
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="gutter mx-auto mt-32 max-w-[1600px]" aria-labelledby="percurso">
        <MaskedTitle as="h2" id="percurso" text="Percurso" className="font-display text-[clamp(2.4rem,4.5vw,4.5rem)] leading-none" />
        <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {milestones.map((m, i) => (
            <Reveal as="li" key={m.year} delay={i * 0.06} className="bg-ink p-7 md:p-8">
              <p className="font-display text-5xl text-lilac">{m.year}</p>
              <p className="mt-6 text-[15px] leading-relaxed text-bone/80">{m.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
