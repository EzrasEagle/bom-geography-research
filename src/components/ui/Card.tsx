import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-border bg-surface shadow-[0_1px_0_rgba(28,25,23,0.04),0_8px_24px_rgba(28,25,23,0.04)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
