export function PineLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="url(#pineev-grad)" />
      <path d="M23.4 10.5h-6.6l-4.6 10.6h4.9l-1.9 9.7 9.7-12.7h-4.9l3.4-7.6Z" fill="#fff" />
      <defs>
        <linearGradient id="pineev-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#16A34A" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  );
}
