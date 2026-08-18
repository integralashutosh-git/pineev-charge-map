import { useState } from "react";
import { Globe } from "lucide-react";
import { LusionButton } from "@/components/ui/LusionButton";

export function LanguageToggle({ className }: { className?: string | undefined }) {
  const [lang, setLang] = useState<"en" | "hi">("en");

  const toggle = () => setLang((prev) => (prev === "en" ? "hi" : "en"));

  return (
    <LusionButton
      onClick={(e) => {
        if (e && "stopPropagation" in e) e.stopPropagation();
        toggle();
      }}
      className={`size-9 border-none bg-transparent shadow-none px-0 flex-none hover:bg-transparent ${className ?? ""}`}
    >
      <div className="relative flex items-center justify-center size-full">
        <Globe className="size-5" />
        <span className="absolute -bottom-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold uppercase text-primary-foreground">
          {lang}
        </span>
      </div>
    </LusionButton>
  );
}
