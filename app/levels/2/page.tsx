import type { Metadata } from "next";
import SecurityMazeGame from "./SecurityMazeGame";

export const metadata: Metadata = {
  title: "Security Maze Game",
  description: "Guide the player through the maze to the exit.",
};

export default function GamePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <SecurityMazeGame />
    </div>
  );
}
