import type { Metadata } from "next";
import MazeGame from "../MazeGame";

export const metadata: Metadata = {
  title: "Maze Game | HEIST_OS",
  description: "Guide the player through the maze to the exit.",
};

export default function GamePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-16 font-sans text-foreground">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Maze Runner
      </h1>
      <MazeGame />
    </div>
  );
}
