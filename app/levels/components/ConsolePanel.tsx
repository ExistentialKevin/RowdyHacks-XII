export function ConsolePanel({ error, log }: { error: string | null; log: string[] }) {
  if (!error && log.length === 0) return null;

  return (
    <>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {log.length > 0 && (
        <pre className="max-h-32 overflow-auto rounded-md bg-zinc-100 p-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {log.join("\n")}
        </pre>
      )}
    </>
  );
}
