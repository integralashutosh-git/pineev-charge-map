import { useI18n } from "@/lib/i18n";

export type PineStatus = "available" | "charging" | "busy" | "offline";

export function normalizeStatus(status: string): PineStatus {
  if (status === "available") return "available";
  if (status === "charging") return "charging";
  if (status === "busy") return "busy";
  return "offline";
}

export function StatusIndicator({
  status,
  className,
}: {
  status: string;
  className?: string | undefined;
}) {
  const { t } = useI18n();
  const state = normalizeStatus(status);

  const dot =
    state === "available"
      ? "bg-energy"
      : state === "charging"
        ? "bg-amber animate-soft-pulse"
        : state === "busy"
          ? "bg-amber"
          : "bg-offline";

  const label =
    state === "available"
      ? t("status.available")
      : state === "charging"
        ? t("status.charging")
        : state === "busy"
          ? t("status.busy")
          : t("status.offline");

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-card/85 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur ${className ?? ""}`}
    >
      <span className={`size-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
