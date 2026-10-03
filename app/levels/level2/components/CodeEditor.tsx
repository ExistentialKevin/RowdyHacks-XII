"use client";

export function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        e.preventDefault();
        const target = e.currentTarget;
        const { selectionStart, selectionEnd } = target;
        const next = value.slice(0, selectionStart) + "    " + value.slice(selectionEnd);
        onChange(next);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = selectionStart + 4;
        });
      }}
      spellCheck={false}
      className="h-80 w-full resize-none rounded-lg border border-black/[.08] bg-zinc-900 p-3 font-mono text-sm text-zinc-100 outline-none dark:border-white/[.145]"
    />
  );
}
