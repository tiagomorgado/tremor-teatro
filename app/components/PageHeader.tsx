import type { ReactNode } from "react";
import { MaskedTitle } from "./Reveal";

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <header className="gutter mx-auto max-w-[1600px] pt-36 pb-14 md:pt-44 md:pb-20">
      <MaskedTitle
        text={title}
        animateOnMount
        delay={0.1}
        className="font-display text-[clamp(3.2rem,9vw,9.5rem)] leading-[0.95] tracking-[-0.01em]"
      />
      {intro && (
        <p className="fade-in mt-8 max-w-[52ch] text-lg leading-relaxed text-bone/75" style={{ ["--d" as string]: "0.5s" }}>
          {intro}
        </p>
      )}
      {children}
    </header>
  );
}
