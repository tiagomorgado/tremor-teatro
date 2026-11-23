import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { MotionConfig } from "motion/react";

import type { Route } from "./+types/root";
import "@fontsource-variable/geist/wght.css";
// Latin subset only: covers Portuguese, Galician and Spanish.
import "@fontsource/libertinus-serif/latin-400.css";
import "@fontsource/libertinus-serif/latin-400-italic.css";
import "@fontsource/libertinus-serif-display/latin-400.css";
import displayFont from "@fontsource/libertinus-serif-display/files/libertinus-serif-display-latin-400-normal.woff2?url";
import sansFont from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import "./app.css";

import { Stage } from "./components/Stage";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { site } from "./data/site";
import { FOUNDER_ID, ORG_ID } from "./lib/seo";
import { withBase } from "./lib/base";

export const links: Route.LinksFunction = () => [
  // Preload both faces: the display serif sets every headline, Geist sets the menu, body
  // and the TREMOR word in the home hero. Avoids a late swap on first paint.
  { rel: "preload", href: displayFont, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: sansFont, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: withBase("/favicon-32x32.png"), sizes: "32x32", type: "image/png" },
  { rel: "icon", href: withBase("/favicon-16x16.png"), sizes: "16x16", type: "image/png" },
  { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png") },
  { rel: "manifest", href: withBase("/site.webmanifest") },
];

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "PerformingGroup",
  "@id": ORG_ID,
  name: site.name,
  url: site.url + "/",
  description: site.description,
  email: site.email,
  telephone: site.phone,
  foundingDate: "2020",
  knowsAbout: ["Teatro", "Performance", "Cinema", "Dramaturgia", "Teatro físico", "Coprodução ibero-americana"],
  areaServed: ["PT", "ES"],
  contactPoint: [
    { "@type": "ContactPoint", contactType: "programação e digressão", email: site.email, telephone: site.phone, availableLanguage: ["pt", "es", "en"] },
    { "@type": "ContactPoint", contactType: "imprensa", email: site.email, availableLanguage: ["pt", "es", "en"] },
  ],
  founder: { "@type": "Person", "@id": FOUNDER_ID, name: "Patrícia Moreira" },
  logo: site.url + "/media/logos/logo-lilas-800.webp",
  image: site.url + "/og/misc/secretum-54-de-54-scaled.jpg",
  sameAs: site.social.map((s) => s.href),
};

const introScript = `try{if(sessionStorage.getItem("tremor:intro")){var s=document.createElement("style");s.textContent=".stage-curtain{display:none!important}.stage-word,.stage-fade{animation-delay:0s!important;animation-duration:.01s!important}";document.head.appendChild(s)}else{sessionStorage.setItem("tremor:intro","1")}}catch(e){}`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b0a0e" />
        <Meta />
        <Links />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c") }} />
        {/* The home curtain plays once per session: on later visits, skip it before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <a
          href="#conteudo"
          data-no-curtain
          className="fixed top-3 left-3 z-[90] -translate-y-20 rounded-full bg-lilac px-4 py-2 text-sm text-ink focus:translate-y-0"
        >
          Saltar para o conteúdo
        </a>
        {children}
        {/* The grain is 200% of the screen so it can jitter; the frame clips it so it can never
            widen the page (Edge's device mode counts fixed overflow when sizing phone layouts). */}
        <div className="grain-frame" aria-hidden>
          <div className="grain" />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Stage>
        <Nav />
        <main id="conteudo">
          <Outlet />
        </main>
        <Footer />
      </Stage>
    </MotionConfig>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Algo correu mal";
  let details = "Ocorreu um erro inesperado.";
  if (isRouteErrorResponse(error) && error.status === 404) {
    message = "Esta página saiu de cena";
    details = "O endereço que procurou não existe ou mudou de lugar.";
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
  }
  return (
    <main className="gutter mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col justify-center">
      <h1 className="font-display text-5xl md:text-7xl">{message}</h1>
      <p className="mt-6 text-mute">{details}</p>
      <a href={withBase("/")} className="mt-10 text-lilac">
        Voltar ao início
      </a>
    </main>
  );
}
