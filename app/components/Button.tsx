import { Link } from "react-router";
import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

// Shape system: interactive controls are full pills; media and panels are square-cornered.
const base =
  "group inline-flex h-12 items-center gap-3 whitespace-nowrap rounded-full px-6 text-[15px] transition-[background-color,color,transform] duration-300 active:scale-[0.98]";

const variants = {
  primary: "bg-lilac text-ink hover:bg-bone",
  ghost: "border border-bone/25 text-bone hover:border-bone hover:bg-bone/5",
};

export function ButtonLink({
  to,
  children,
  variant = "primary",
  curtainLabel,
  arrow = true,
}: {
  to: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  curtainLabel?: string;
  arrow?: boolean;
}) {
  const external = /^(https?:|mailto:|tel:)/.test(to);
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          size={18}
          weight="regular"
          className={`transition-transform duration-300 group-hover:translate-x-1 ${external ? "-rotate-45" : ""}`}
        />
      )}
    </>
  );
  if (external) {
    return (
      <a href={to} className={`${base} ${variants[variant]}`} {...(to.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} prefetch="intent" data-curtain-label={curtainLabel} className={`${base} ${variants[variant]}`}>
      {content}
    </Link>
  );
}
