import { repo, repoTree } from "../data/mock";

const statusMark = {
  modified: { letter: "M", className: "text-[#e3b341]", label: "modified" },
  added: { letter: "A", className: "text-accent-primary", label: "added" },
} as const;

export default function RepoPanel() {
  return (
    <section
      aria-label="Repository"
      className="flex w-full shrink-0 flex-col border-b border-panel-border/70 bg-panel-muted lg:min-h-0 lg:w-[270px] lg:border-b-0 lg:border-r"
    >
      {/* Repo header */}
      <div className="px-[18px] pb-3 pt-4">
        <div className="text-xs text-muted-foreground">{repo.owner} /</div>
        <div className="mt-0.5 text-[17px] font-bold">{repo.name}</div>
        <div className="mt-3 flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            className="rounded-lg border border-panel-border bg-panel-elevated px-2.5 py-1.5 text-accent-primary transition hover:border-panel-border-hover"
          >
            ⎇ {repo.branch} ▾
          </button>
          <span className="px-1 text-muted-foreground">
            ↑{repo.ahead} ↓{repo.behind}
          </span>
        </div>
      </div>

      {/* File tree */}
      <ul className="flex flex-col gap-px overflow-y-auto px-2.5 py-1 font-mono text-[13px] lg:min-h-0 lg:flex-1">
        {repoTree.map((entry, i) => {
          const indent = { paddingLeft: 8 + entry.depth * 18 };
          if (entry.kind === "folder") {
            return (
              <li key={i} className="py-1 pr-2 text-muted-foreground" style={indent}>
                ▾ {entry.name}
              </li>
            );
          }
          const mark = entry.status ? statusMark[entry.status] : null;
          return (
            <li key={i}>
              <button
                type="button"
                style={indent}
                className={`flex w-full items-center justify-between rounded-md py-1 pr-2 text-left transition ${
                  entry.active
                    ? "bg-panel-elevated text-accent-primary"
                    : "text-foreground hover:bg-panel-elevated/60"
                }`}
              >
                <span>{entry.name}</span>
                {mark && (
                  <span className={mark.className} title={mark.label}>
                    {mark.letter}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Commit box */}
      <div className="mx-3 mb-3.5 mt-3 shrink-0 rounded-xl border border-panel-border bg-panel p-3.5">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          {repo.changedFiles} changed files
        </div>
        <label htmlFor="commit-message" className="sr-only">
          Commit message
        </label>
        <input
          id="commit-message"
          type="text"
          placeholder="Commit message…"
          className="w-full rounded-lg border border-panel-border bg-background px-2.5 py-2 text-[13px] text-foreground placeholder:text-[#7d8a99] focus:border-accent-primary/60 focus:outline-none"
        />
        <button
          type="button"
          className="mt-2.5 w-full rounded-lg bg-accent-primary py-2 text-[13px] font-bold text-accent-primary-foreground transition hover:brightness-110"
        >
          Commit &amp; push
        </button>
      </div>
    </section>
  );
}
