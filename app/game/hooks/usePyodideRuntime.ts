"use client";

import { useEffect, useRef, useState } from "react";
import { PYODIDE_INDEX_URL, PYODIDE_SCRIPT_URL } from "../lib/constants";

export interface PyodideInterface {
  globals: { set: (name: string, value: unknown) => void };
  setStdout: (options: { batched: (msg: string) => void }) => void;
  setStderr: (options: { batched: (msg: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export type PyodideStatus = "loading" | "ready" | "error";

/**
 * Loads the Pyodide runtime from /public/pyodide and wires its stdout/stderr
 * to `onOutput`. Returns a ref (stable across renders) holding the live
 * instance once `status` is "ready".
 */
export function usePyodideRuntime(onOutput: (msg: string) => void) {
  const [status, setStatus] = useState<PyodideStatus>("loading");
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const onOutputRef = useRef(onOutput);

  useEffect(() => {
    onOutputRef.current = onOutput;
  }, [onOutput]);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = PYODIDE_SCRIPT_URL;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide script."));
            document.body.appendChild(script);
          });
        }

        if (cancelled || !window.loadPyodide) return;

        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
        pyodide.setStdout({ batched: (msg) => onOutputRef.current(msg) });
        pyodide.setStderr({ batched: (msg) => onOutputRef.current(msg) });

        if (cancelled) return;
        pyodideRef.current = pyodide;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    setup();

    return () => {
      cancelled = true;
    };
  }, []);

  return { pyodide: pyodideRef, status };
}
