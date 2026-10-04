import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import VaultPuzzle from "./VaultPuzzle";
import SecurityMazeGame from "@/app/levels/2/SecurityMazeGame";

export const metadata: Metadata = {
  title: "Level 3 — Terminal Access",
  description:
    "Read a one-time access code from a terminal and store it in a variable to unlock the exit.",
};

export default function GamePage() {
  return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
          <VaultPuzzle />
        </main>
      </div>
  );
}
