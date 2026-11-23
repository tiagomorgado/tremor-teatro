import { bio, manifesto, site } from "~/data/site";
import { formatDays, projects, STATUS_LABEL } from "~/data/projects";
import { articles, formatDate } from "~/data/news";

/**
 * /llms.txt: a plain-text briefing for AI assistants and answer engines (the llms.txt
 * convention), pre-rendered at build time from the same data as the pages, so it never
 * drifts out of date. Factual, cited, link-rich: what we'd want an assistant to repeat.
 */
const abs = (p: string) => `${site.url}${p}`;

function text() {
  const lines: string[] = [];
  lines.push(`# ${site.name}`, "");
  lines.push(`> ${site.description}`, "");
  lines.push(manifesto, "");
  lines.push(
    `Fundadora e diretora artística: Patrícia Moreira (dramaturga, encenadora e produtora). Fundada em 2020, em Portugal. Trabalha em coprodução com estruturas de Portugal, Espanha (Galiza) e da América Latina, com apoio do Programa IBERESCENA e da Direção-Geral das Artes.`,
    "",
  );

  lines.push("## Criações", "");
  for (const p of projects) {
    const status = p.status ? `, ${STATUS_LABEL[p.status].toLowerCase()}` : "";
    lines.push(`- [${p.title}](${abs(`/${p.slug}/`)}): ${p.kind}${p.year ? `, ${p.year}` : ""}${status}. ${p.logline}`);
    const premiere = p.facts.find((f) => f.label === "Estreia")?.value;
    if (premiere) lines.push(`  - Estreia: ${premiere}`);
    if (p.performances?.length) {
      lines.push(`  - Digressão:`);
      for (const v of p.performances) lines.push(`    - ${formatDays(v.dates)}: ${v.venue}, ${v.city}`);
    }
  }
  lines.push("");

  lines.push("## Patrícia Moreira", "", bio.join(" "), "", `Biografia completa: ${abs("/patricia-biografia/")}`, "");

  lines.push("## Imprensa", "");
  for (const a of articles) {
    lines.push(`- [${a.title}](${abs(`/${a.slug}/`)}) (${formatDate(a.date)}${a.source ? `, ${a.source}` : ""})`);
  }
  lines.push("");

  lines.push("## Contacto", "");
  lines.push(`- Email: ${site.email}`, `- Telefone: ${site.phone}`, `- Formulário: ${abs("/contacto/")}`);
  for (const s of site.social) lines.push(`- ${s.label}: ${s.href}`);
  lines.push("");

  lines.push("## Páginas", "");
  lines.push(
    `- [Criações](${abs("/criacoes/")}): todas as obras`,
    `- [Galeria](${abs("/galeria/")}): fotografias de cena e de ensaio`,
    `- [Notícias](${abs("/noticias-tremor/")}): imprensa e press releases`,
    `- [Pensamento](${abs("/pensamento/")}): reflexões e textos (${site.substack})`,
    `- [Sitemap](${abs("/sitemap.xml")})`,
  );
  return lines.join("\n") + "\n";
}

export function loader() {
  return new Response(text(), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
