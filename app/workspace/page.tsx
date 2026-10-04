import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import ActivityRail from "./components/ActivityRail";
import RepoPanel from "./components/RepoPanel";
import EditorPanel from "./components/EditorPanel";
import TicketBoard from "./components/TicketBoard";

export const metadata: Metadata = {
  title: "Workspace · Heist School",
  description: "Repo, editor and tickets for your team project, all on one page.",
};

// UI shell only — every panel renders placeholder data from ./data/mock.ts.
export default function WorkspacePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:h-screen lg:overflow-hidden">
      <Navbar active="workspace" />
      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <ActivityRail />
        <RepoPanel />
        <EditorPanel />
        <TicketBoard />
      </div>
    </div>
  );
}
