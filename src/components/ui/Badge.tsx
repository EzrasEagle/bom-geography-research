import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "claim" | "insight" | "accent" | "teal";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        tone === "default" && "bg-chip border-border text-ink-soft",
        tone === "claim" && "bg-sky-50 border-sky-200 text-claim",
        tone === "insight" && "bg-lime-50 border-lime-200 text-insight",
        tone === "accent" && "bg-orange-50 border-orange-200 text-accent",
        tone === "teal" && "bg-teal-soft border-teal/20 text-teal",
        className,
      )}
    >
      {children}
    </span>
  );
}
