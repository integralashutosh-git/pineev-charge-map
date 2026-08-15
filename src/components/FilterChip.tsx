import type { ReactNode } from "react";

export function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
        active
          ? "border-primary bg-primary text-primary-foreground elev-2"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
