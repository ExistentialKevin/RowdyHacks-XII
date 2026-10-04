import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import TutorialLvl from "./TutorialLvl";

export const metadata: Metadata = {
  title: "Tutorial · Heist School",
  description: "Guide the lil-guy to the end of the path.",
};

export default function GamePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <TutorialLvl />
      </main>
    </div>
  );
}
