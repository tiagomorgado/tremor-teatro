import { withBase } from "~/lib/base";

const small = withBase("/media/logos/logo-lilas-320.webp");
const large = withBase("/media/logos/logo-lilas-800.webp");

/**
 * The lilac Tremor wordmark (raster original from the brand files, served as WebP).
 * pointer-events-none: the surrounding link is always the hover target, so the cursor
 * stays a hand even while the image itself shivers on hover.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={small}
      srcSet={`${small} 320w, ${large} 800w`}
      sizes="160px"
      width={4143}
      height={1663}
      alt="Tremor"
      className={`tremble-char pointer-events-none ${className}`}
      style={{ ["--i" as string]: 0 }}
      draggable={false}
    />
  );
}
