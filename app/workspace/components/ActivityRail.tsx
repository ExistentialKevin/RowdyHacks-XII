type RailItem = { label: string; active?: boolean; icon: React.ReactNode };

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const items: RailItem[] = [
  {
    label: "Files",
    active: true,
    icon: (
      <svg {...iconProps}>
        <path d="M3 7h6l2 2h10v10H3z" />
      </svg>
    ),
  },
  {
    label: "Commits",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6M12 15v6" />
      </svg>
    ),
  },
  {
    label: "Branches",
    icon: (
      <svg {...iconProps}>
        <circle cx="6" cy="5" r="2" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="8" r="2" />
        <path d="M6 7v10M18 10c0 4-6 3-12 7" />
      </svg>
    ),
  },
  {
    label: "Team",
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 5a3 3 0 0 1 0 6M21 20c0-2-1-4-3-4.5" />
      </svg>
    ),
  },
];

export default function ActivityRail() {
  return (
    <nav
      aria-label="Workspace sections"
      className="hidden lg:flex w-[60px] shrink-0 flex-col items-center gap-2 border-r border-panel-border/70 bg-panel-muted pt-3.5"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          title={item.label}
          className={
            item.active
              ? "flex h-10 w-10 items-center justify-center rounded-[10px] border border-accent-primary/30 bg-accent-secondary text-accent-primary"
              : "flex h-10 w-10 items-center justify-center rounded-[10px] text-muted-foreground transition hover:bg-panel-elevated hover:text-foreground"
          }
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}
