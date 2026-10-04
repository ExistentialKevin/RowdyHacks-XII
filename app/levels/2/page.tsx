import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import SecurityMazeGame from "./SecurityMazeGame";

export const metadata: Metadata = {
  title: "The Camera Gauntlet · Heist School",
  description: "Guide the player through the maze to the exit.",
};

export default function GamePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar active="heistmap"/>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <SecurityMazeGame />
      </main>
    </div>
  );
}
