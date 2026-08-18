import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { LusionButton } from "@/components/ui/LusionButton";

export function ThemeToggle({ className }: { className?: string | undefined }) {
  const { theme, toggle } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <LusionButton
      onClick={(e) => {
        if (e && "stopPropagation" in e) e.stopPropagation();
        toggle();
      }}
      className={`size-9 border-none bg-transparent shadow-none px-0 flex-none hover:bg-transparent ${className ?? ""}`}
    >
      {ready && theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </LusionButton>
  );
}
