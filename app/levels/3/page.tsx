import type { Metadata } from "next";
import VaultPuzzle from "./VaultPuzzle";

export const metadata: Metadata = {
  title: "Level 3 — Terminal Access",
  description:
    "Read a one-time access code from a terminal and store it in a variable to unlock the exit.",
};

export default function GamePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <VaultPuzzle />
    </div>
  );
}
