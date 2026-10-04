"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";

export function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="h-80 overflow-auto rounded-lg border border-black/[.08] dark:border-white/[.145]">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={tokyoNight}
        extensions={[python()]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
        }}
        className="h-full text-sm"
      />
    </div>
  );
}
