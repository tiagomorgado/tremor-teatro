import { Link } from "react-router";
import { nav, site } from "~/data/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-line bg-ink">
      <div className="gutter mx-auto max-w-[1600px] pt-16 pb-10 md:pt-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" aria-label="Tremor Teatro, página inicial" data-curtain-label="Tremor Teatro" className="tremble inline-flex cursor-pointer select-none">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-mute">
              Estrutura de criação artística pluridisciplinar fundada por Patrícia Moreira em 2020.
            </p>
          </div>

          <nav className="md:col-span-3" aria-label="Rodapé">
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} prefetch="intent" data-curtain-label={n.label} className="link-underline text-bone/85 hover:text-bone">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-sm md:col-span-4">
            <a href={`mailto:${site.email}`} className="link-underline text-bone/85 hover:text-bone">
              {site.email}
            </a>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
              {site.social.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="link-underline text-mute hover:text-bone">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-16 text-xs text-mute">© {new Date().getFullYear()} Tremor Teatro. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
