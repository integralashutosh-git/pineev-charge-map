import logoAsset from "@/assets/pineev-logo.jpeg.asset.json";

export function PineLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="PineEV"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
