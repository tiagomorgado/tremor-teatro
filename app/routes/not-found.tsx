import type { Route } from "./+types/not-found";
import { MaskedTitle } from "~/components/Reveal";
import { ButtonLink } from "~/components/Button";

export const meta: Route.MetaFunction = () => [
  { title: "Página não encontrada | Tremor Teatro" },
  { name: "description", content: "Esta página não existe ou mudou de endereço. Veja as criações, a galeria e as notícias da Tremor Teatro." },
  // A missing page must never be indexed. Served with HTTP 404 by the host (see .htaccess).
  { name: "robots", content: "noindex" },
];

export default function NotFound() {
  return (
    <section className="gutter mx-auto flex min-h-[85dvh] max-w-[1600px] flex-col justify-end pt-32">
      <MaskedTitle text="Esta página saiu de cena." animateOnMount className="max-w-[14ch] font-display text-[clamp(3rem,8vw,8rem)] leading-[0.98]" />
      <p className="fade-in mt-8 max-w-[44ch] text-lg text-bone/75" style={{ ["--d" as string]: "0.5s" }}>
        O endereço que procura não existe ou mudou de lugar.
      </p>
      <div className="fade-in mt-10 flex flex-wrap gap-3" style={{ ["--d" as string]: "0.65s" }}>
        <ButtonLink to="/" curtainLabel="Tremor Teatro">
          Voltar ao início
        </ButtonLink>
        <ButtonLink to="/criacoes/" variant="ghost" curtainLabel="Criações">
          Ver criações
        </ButtonLink>
      </div>
    </section>
  );
}
