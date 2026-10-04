import Navbar from "./components/Navbar";
import MiddleColumn from "./components/MiddleColumn";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:py-14">
        <MiddleColumn />
      </main>
    </div>
  );
}
