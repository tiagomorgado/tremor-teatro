import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { projects } from "./data/projects";
import { articles } from "./data/news";

// URL slugs mirror the old WordPress site so existing links and search rankings survive.
export default [
  index("routes/home.tsx"),
  route("criacoes", "routes/criacoes.tsx"),
  ...projects.map((p) => route(p.slug, "routes/projeto.tsx", { id: `projeto-${p.slug}` })),

  route("galeria", "routes/galeria.tsx", { id: "galeria" }),
  ...projects.flatMap((p) =>
    p.galleries.map((g) => route(g.slug, "routes/galeria.tsx", { id: `galeria-${g.slug}` })),
  ),

  route("noticias-tremor", "routes/noticias.tsx", { id: "noticias" }),
  route("tremor-press-release", "routes/noticias.tsx", { id: "press-release" }),
  ...articles.map((a) => route(a.slug, "routes/artigo.tsx", { id: `artigo-${a.slug}` })),

  route("patricia-biografia", "routes/biografia.tsx"),
  route("pensamento", "routes/pensamento.tsx"),
  route("contacto", "routes/contacto.tsx"),
  // Plain-text briefing for AI assistants (llms.txt convention), pre-rendered.
  route("llms.txt", "routes/llms.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
