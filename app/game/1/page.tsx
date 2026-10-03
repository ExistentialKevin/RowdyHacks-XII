import type { Metadata } from "next";
import MazeGame from "../MazeGame";

export const metadata: Metadata = {
  title: "Maze Game",
  description: "Guide the player through the maze to the exit.",
};

export default function GamePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-[#090a0f] px-6 py-16 font-sans text-zinc-100">
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Maze Runner
      </h1>
      <MazeGame />
    </div>
  );
}
