import type { Metadata } from "next";
import MazeGame from "./MazeGame";

export const metadata: Metadata = {
  title: "Maze Game",
  description: "Guide the player through the maze to the exit.",
};

export default function GamePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Maze Runner
      </h1>
      <MazeGame />
    </div>
  );
}
