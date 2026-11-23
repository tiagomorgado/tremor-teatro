/** schema.org structured data (JSON-LD) for each page type. Only facts present in app/data. */
import { site, bio } from "~/data/site";
import type { Project, Gallery } from "~/data/projects";
import type { Article } from "~/data/news";
import { canonicalUrl, excerpt, FOUNDER_ID, ogImageUrl, ORG_ID } from "./seo";

const org = { "@id": ORG_ID };
const founder = { "@id": FOUNDER_ID };

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: canonicalUrl("/"),
    name: site.name,
    inLanguage: "pt-PT",
    publisher: org,
  };
}

const LANG: Record<string, string> = { português: "pt", galego: "gl", espanhol: "es" };
function languages(p: Project) {
  const v = p.facts.find((f) => f.label === "Línguas")?.value.toLowerCase() ?? "";
  return Object.entries(LANG).filter(([k]) => v.includes(k)).map(([, code]) => code);
}

export function projectSchema(p: Project) {
  const url = canonicalUrl(`/${p.slug}`);
  const base = {
    "@id": `${url}#work`,
    url,
    name: p.title,
    description: excerpt(p.synopsis[0], 300),
    image: ogImageUrl(p.hero),
    creator: founder,
    producer: org,
    ...(p.year ? { dateCreated: p.year } : {}),
    ...(languages(p).length ? { inLanguage: languages(p) } : {}),
  };
  if (p.kind === "Curta-metragem") {
    const director = p.facts.find((f) => f.label === "Realização")?.value;
    return {
      "@type": "Movie",
      ...base,
      duration: "PT26M",
      ...(director ? { director: { "@type": "Person", name: director } } : {}),
      productionCompany: org,
    };
  }
  return {
    "@type": "CreativeWork",
    ...base,
    genre: p.kind,
    ...(p.status === "em-criacao" ? { creativeWorkStatus: "Em criação" } : {}),
  };
}

/** One TheaterEvent per venue of the tour (start/end dates), linked to the work. */
export function performancesSchema(p: Project) {
  const work = { "@id": `${canonicalUrl(`/${p.slug}`)}#work` };
  const minutes = p.facts.find((f) => f.label === "Duração")?.value.match(/\d+/)?.[0];
  return (p.performances ?? []).map((v) => {
    const days = [...v.dates].sort();
    return {
      "@type": "TheaterEvent",
      name: `${p.title}, ${v.venue}`,
      url: canonicalUrl(`/${p.slug}`),
      startDate: days[0],
      endDate: days[days.length - 1],
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: v.venue,
        address: { "@type": "PostalAddress", addressLocality: v.city, addressCountry: v.country },
      },
      image: [ogImageUrl(p.hero)],
      description: excerpt(p.synopsis[0], 300),
      organizer: org,
      performer: org,
      workPerformed: work,
      ...(minutes ? { duration: `PT${minutes}M` } : {}),
      inLanguage: languages(p),
    };
  });
}

export function gallerySchema(p: Project, g: Gallery) {
  return {
    "@type": "ImageGallery",
    url: canonicalUrl(`/${g.slug}`),
    name: `${p.title}, ${g.label.toLowerCase()}`,
    about: { "@id": `${canonicalUrl(`/${p.slug}`)}#work` },
    image: g.images.slice(0, 12).map((k) => ogImageUrl(k)),
  };
}

export function articleSchema(a: Article) {
  const url = canonicalUrl(`/${a.slug}`);
  return {
    "@type": a.kind === "Press release" ? "Article" : "NewsArticle",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: (a.seoTitle ?? a.title).slice(0, 110),
    description: a.excerpt,
    datePublished: a.date,
    inLanguage: a.lang === "es" ? "es" : "pt-PT",
    ...(a.cover ? { image: [ogImageUrl(a.cover)] } : {}),
    author: org,
    publisher: org,
    ...(a.project ? { about: { "@id": `${canonicalUrl(`/${a.project}`)}#work` } } : {}),
    ...(a.links.length ? { citation: a.links.map((l) => l.href) } : {}),
  };
}

export function personSchema() {
  return {
    "@type": "Person",
    "@id": FOUNDER_ID,
    name: "Patrícia Moreira",
    url: canonicalUrl("/patricia-biografia"),
    image: ogImageUrl("misc/patriciamoreiraperfil"),
    jobTitle: "Dramaturga, encenadora e produtora",
    description: excerpt(bio[0], 300),
    worksFor: org,
    award: "Prémio literário Belas Letras, Instituto Politécnico de Lisboa (2015)",
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Faculdade de Letras da Universidade de Lisboa" },
      { "@type": "CollegeOrUniversity", name: "Escola Superior de Teatro e Cinema" },
    ],
  };
}
