import { code, consoleLines, openTabs } from "../data/mock";
import GameView from "./GameView";

// Display-only Python colouring — just enough to make the mock code readable.
const TOKEN =
  /("[^"]*"|'[^']*')|(#.*)|\b(\d+)\b|\b(import|from|as|def|class|while|for|in|if|elif|else|not|and|or|return|break|True|False|None)\b|\b([A-Za-z_]\w*)(?=\()|\b([A-Z][a-z]\w*)\b/g;

const tokenClass = [
  "text-[#e3b341]", // string
  "text-[#7d8a99] italic", // comment
  "text-[#ffa657]", // number
  "text-[#d2a8ff]", // keyword
  "text-accent-primary", // function call
  "text-[#79c0ff]", // class name
];

function highlight(line: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(line.slice(last, idx));
    const group = m.slice(1).findIndex((g) => g !== undefined);
    out.push(
      <span key={idx} className={tokenClass[group]}>
        {m[0]}
      </span>,
    );
    last = idx + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out.length ? out : " ";
}

const lines = code.split("\n");

const toneClass = { muted: "text-muted-foreground", ok: "text-accent-primary" } as const;

export default function EditorPanel() {
  return (
    <section aria-label="Editor" className="flex min-w-0 flex-1 flex-col lg:min-h-0">
      {/* Tabs + run */}
      <div className="flex items-center overflow-x-auto border-b border-panel-border/70 bg-panel-muted font-mono text-[13px]">
        {openTabs.map((tab) => (
          <button
            key={tab.name}
            type="button"
            className={
              tab.active
                ? "shrink-0 border-t-2 border-accent-primary bg-background px-[18px] py-3 text-foreground"
                : "shrink-0 border-t-2 border-transparent px-[18px] py-3 text-muted-foreground transition hover:text-foreground"
            }
          >
            {tab.name}
          </button>
        ))}
        <button
          type="button"
          className="ml-auto mr-3 shrink-0 rounded-lg border border-accent-primary/30 bg-accent-secondary px-3.5 py-1.5 font-bold text-accent-primary transition hover:border-accent-primary/60"
        >
          ▶ Run game
        </button>
      </div>

      {/* Code */}
      <div className="max-h-[480px] flex-1 overflow-auto py-4 font-mono text-sm leading-[1.7] lg:max-h-none lg:min-h-0">
        <pre className="m-0 grid grid-cols-[56px_1fr] font-[inherit]">
          <code aria-hidden className="select-none pr-[18px] text-right text-[#4b5563]">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </code>
          <code>
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre">
                {highlight(line)}
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Bottom dock: game window + console */}
      <div className="flex shrink-0 flex-col gap-4 border-t border-panel-border/70 bg-panel-muted p-3.5 sm:flex-row">
        <div className="flex flex-col gap-2">
          <div className="font-mono text-xs text-foreground">
            <span className="border-b border-accent-primary pb-1">GAME PREVIEW</span>
          </div>
          <div className="pt-1 sm:w-[300px]">
            <GameView />
          </div>
        </div>
        <div className="min-w-0 flex-1 font-mono text-xs">
          <div className="mb-2.5 flex gap-[18px] text-muted-foreground">
            <span className="text-foreground">CONSOLE</span>
            <span>PROBLEMS 0</span>
          </div>
          <div className="flex flex-col gap-1">
            {consoleLines.map((l, i) => (
              <div key={i} className={`break-words ${toneClass[l.tone]}`}>
                {l.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
