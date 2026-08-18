import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function PineLogo({ className = "h-8 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <img
      src="/pine.png"
      alt="PineEV"
      loading="eager"
      decoding="async"
      className={cn(
        "transition-filter duration-200",
        className,
        isLight && "invert brightness-0 contrast-150",
      )}
      style={{ filter: isLight ? "invert(1) brightness(0) contrast(150%)" : "none" }}
    />
  );
}
