import { STATUS_LABEL, type ProjectStatus } from "~/data/projects";

/**
 * Lilac pill marking a show's status. "Em cartaz" gets a pulsing dot (a live signal);
 * the pulse is dropped for visitors who prefer reduced motion.
 */
export function StatusBadge({ status, size = "sm", className = "" }: { status: ProjectStatus; size?: "sm" | "lg"; className?: string }) {
  const live = status === "em-cartaz";
  const sizing = size === "lg" ? "gap-2.5 px-4 py-2 text-sm md:text-base" : "gap-2 px-3 py-1.5 text-xs";
  return (
    <span className={`inline-flex items-center rounded-full bg-lilac font-medium tracking-[0.08em] text-ink uppercase ${sizing} ${className}`}>
      <span className="relative flex h-2 w-2" aria-hidden>
        {live && <span className="absolute inline-flex h-full w-full rounded-full bg-ink/60 motion-safe:animate-ping" />}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
      </span>
      {STATUS_LABEL[status]}
    </span>
  );
}
