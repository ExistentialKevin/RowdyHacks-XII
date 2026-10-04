import Navbar from "./components/Navbar";
import MiddleColumn from "./components/MiddleColumn";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <MiddleColumn />
        </div>
      </main>
    </div>
  );
}
