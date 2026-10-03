import Navbar from "./components/Navbar";
import LeftColumn from "./components/LeftColumn";
import MiddleColumn from "./components/MiddleColumn";
import RightColumn from "./components/RightColumn";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <LeftColumn />
          <MiddleColumn />
          <RightColumn />
        </div>
      </main>
    </div>
  );
}
