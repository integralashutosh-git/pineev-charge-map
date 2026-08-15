import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ className }: { className?: string | undefined }) {
  const { lang, toggleLang } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === "en" ? "Switch to Hindi" : "अंग्रेज़ी में बदलें"}
      className={`inline-flex h-9 items-center gap-1 rounded-full border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted ${className ?? ""}`}
    >
      <span className={lang === "en" ? "text-primary" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={lang === "hi" ? "text-primary" : "text-muted-foreground"}>हिं</span>
    </button>
  );
}
