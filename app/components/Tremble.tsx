/**
 * Splits text into characters that shiver on hover of the nearest `.tremble` ancestor.
 * The company is called Tremor; this is its signature micro-interaction (CSS only).
 * Screen readers get the plain string; the per-letter spans are hidden from them.
 * The wrapper is `relative` so the absolutely-positioned sr-only text stays inside it;
 * otherwise it escapes overflow-clipped scrollers and widens the page on phones.
 */
export function Tremble({ children }: { children: string }) {
  const words = children.split(" ");
  let i = 0;
  return (
    <span className="relative">
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch) => (
              <span key={i} className="tremble-char" style={{ ["--i" as string]: i++ }}>
                {ch}
              </span>
            ))}
            {w < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}
