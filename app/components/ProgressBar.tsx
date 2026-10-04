interface ProgressBarProps {
  current: number;
  total: number;
  fillClass?: string;
  label?: string;
  width?: string;
}

export default function ProgressBar({
  current,
  total,
  fillClass = "bg-accent-primary",
  label,
  width = "w-[70px]",
}: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div>
      <div
        className={`relative h-2.5 ${width} border border-line bg-panel-elevated`}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className={`absolute inset-y-0 left-0 ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-[11px] text-dim">{label ?? `${current}/${total} loot`}</div>
    </div>
  );
}
