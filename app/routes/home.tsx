import type { Route } from "./+types/home";
import { seo } from "~/lib/seo";
import { websiteSchema } from "~/lib/schema";
import { HERO_FIRST_IMAGE, HeroStage } from "~/components/home/HeroStage";
import { srcSet } from "~/data/media";
import { Manifesto } from "~/components/home/Manifesto";
import { ProjectsPan } from "~/components/home/ProjectsPan";
import { Upcoming } from "~/components/home/Upcoming";
import { Founder } from "~/components/home/Founder";
import { PressList } from "~/components/home/PressList";
import { GalleryMarquee } from "~/components/home/GalleryMarquee";

// Start fetching the hero photo with the HTML, before the JS and CSS are parsed (faster LCP).
// Same AVIF srcset and sizes as the <picture>, so the browser reuses it rather than re-downloading.
export const links: Route.LinksFunction = () => [
  { rel: "preload", as: "image", type: "image/avif", imageSrcSet: srcSet(HERO_FIRST_IMAGE, "avif"), imageSizes: "100vw", fetchPriority: "high" },
];

export const meta: Route.MetaFunction = ({ location }) => seo({ path: location.pathname, jsonLd: [websiteSchema()] });

export default function Home() {
  return (
    <>
      <HeroStage />
      <Manifesto />
      <ProjectsPan />
      <Upcoming />
      <Founder />
      <PressList />
      <GalleryMarquee />
    </>
  );
}
