import { PREVIEW_URL } from "~/lib/base";
import type { MetaDescriptor } from "react-router";
import { site } from "~/data/site";

export function cleanPath(pathname: string) {
  return "/" + pathname.replace(/^\/+|\/+$/g, "");
}

export function slugFrom(pathname: string) {
  return pathname.replace(/^\/+|\/+$/g, "");
}

/** Canonical form of a path: trailing slash, like the original WordPress URLs. */
export function canonicalUrl(path: string) {
  const p = cleanPath(path);
  return site.url + (p === "/" ? "/" : p + "/");
}

/**
 * Social share image. scripts/postbuild.mjs generates /og/<key>.jpg (1200×630 JPEG)
 * for every key referenced here, from the originals in media-src/.
 */
export function ogImageUrl(key: string) {
  // The preview has its own copy of the share images (they are not on the live domain yet).
  return `${PREVIEW_URL ?? site.url}/og/${key}.jpg`;
}

/** Shorten to `max` characters at a word boundary, for meta descriptions. */
export function excerpt(text: string, max = 155) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "") + "…";
}

export const ORG_ID = `${site.url}/#org`;
export const FOUNDER_ID = `${site.url}/patricia-biografia/#person`;

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Início", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: canonicalUrl(it.path),
    })),
  };
}

export function seo({
  title,
  description = site.description,
  path,
  image = "misc/secretum-54-de-54-scaled",
  type = "website",
  jsonLd,
}: {
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "profile";
  /** Extra structured data for this page (the organisation is added site-wide in root.tsx). */
  jsonLd?: Record<string, unknown>[];
}): MetaDescriptor[] {
  const fullTitle = title ? `${title} | ${site.name}` : `${site.name} | Teatro, performance e cinema`;
  const url = canonicalUrl(path);
  const img = ogImageUrl(image);
  const tags: MetaDescriptor[] = [
    { title: fullTitle },
    { name: "description", content: description },
    // The GitHub Pages preview must never compete with the real site in search results.
    { name: "robots", content: PREVIEW_URL ? "noindex, nofollow" : "index, follow, max-image-preview:large" },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: "pt_PT" },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
  if (jsonLd?.length) {
    tags.push({ "script:ld+json": { "@context": "https://schema.org", "@graph": jsonLd } });
  }
  return tags;
}
