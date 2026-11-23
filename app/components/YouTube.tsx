import { useState } from "react";
import { Play } from "@phosphor-icons/react";
import { Img } from "./Img";

/**
 * Click-to-load YouTube player. Nothing from YouTube is requested until the visitor
 * presses play (privacy-enhanced domain), so the page stays light.
 */
export function YouTube({ id, title, poster }: { id: string; title: string; poster: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-ink-2">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          // YouTube refuses to play embeds that send no referrer; the sandbox limits what it can do.
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 block h-full w-full" aria-label={`Reproduzir vídeo: ${title}`}>
          <Img src={poster} alt="" fill sizes="(min-width: 1024px) 80vw, 100vw" imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]" />
          <span className="absolute inset-0 bg-ink/45 transition-colors duration-500 group-hover:bg-ink/30" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lilac text-ink transition-transform duration-500 group-hover:scale-110 md:h-28 md:w-28">
              <Play size={30} weight="fill" />
            </span>
          </span>
          <span className="absolute bottom-5 left-5 text-sm text-bone/85 md:bottom-8 md:left-8">Ver teaser</span>
        </button>
      )}
    </div>
  );
}
