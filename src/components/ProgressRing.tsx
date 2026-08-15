interface ProgressRingProps {
  progress: number;
  size?: number;
  label?: string | undefined;
  value?: string | undefined;
  sub?: string | undefined;
}

/** SVG circular gauge for live charging sessions. */
export function ProgressRing({
  progress,
  size = 260,
  label,
  value,
  sub,
}: ProgressRingProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--energy)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label ? (
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        ) : null}
        <span className="font-display text-4xl font-bold text-foreground">
          {value ?? `${Math.round(clamped * 100)}%`}
        </span>
        {sub ? <span className="mt-1 text-sm text-muted-foreground">{sub}</span> : null}
      </div>
    </div>
  );
}
