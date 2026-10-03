export function ConsolePanel({ error, log }: { error: string | null; log: string[] }) {
  if (!error && log.length === 0) return null;

  return (
    <>
      {error && (
        <p className="rounded-xl bg-rose-950/40 border border-rose-500/30 px-3 py-2 text-sm text-rose-300">
          {error}
        </p>
      )}

      {log.length > 0 && (
        <pre className="max-h-32 overflow-auto rounded-xl bg-panel-muted border border-panel-border p-2.5 font-mono text-xs text-muted-foreground">
          {log.join("\n")}
        </pre>
      )}
    </>
  );
}
