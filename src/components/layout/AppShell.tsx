import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, GitCompare, Home, Layers, Lightbulb, Library, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/framework", label: "Framework", icon: Layers },
  { to: "/reader", label: "Reader", icon: BookOpen },
  { to: "/verses", label: "Verses", icon: BookOpen },
  { to: "/models", label: "Models", icon: Map },
  { to: "/my-models", label: "My Models", icon: Layers },
  { to: "/map-lab", label: "Map Lab", icon: Map },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/sources", label: "Sources", icon: Library },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] bg-accent text-accent-fg font-serif text-lg font-bold">
              G
            </span>
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink leading-tight">BoM Geography Atlas</div>
              <div className="truncate text-xs text-muted">Dual-track evidence · weigh the models</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-2 text-accent font-medium"
                      : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2">
          {nav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs border transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 md:py-10">{children}</main>
      <footer className="border-t border-border bg-surface-2/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>Comparative catalog — model claims and independent insights kept separate.</p>
          <p className="text-xs">GitHub: EzrasEagle/bom-geography-research · Drive backup: BoM Geography Research</p>
        </div>
      </footer>
    </div>
  );
}
