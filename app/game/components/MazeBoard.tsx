import { MAZE, type Pos } from "../lib/maze";
import { CELL_SIZE } from "../lib/constants";

// Adjust cell colors here to restyle the board.
function cellClassName(cell: number) {
  if (cell === 0) return "bg-zinc-800 dark:bg-black";
  if (cell === 2) return "bg-emerald-400 dark:bg-emerald-500";
  return "bg-zinc-100 dark:bg-zinc-900";
}

export function MazeBoard({ player }: { player: Pos }) {
  return (
    <div
      className="relative border border-black/[.08] bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-900"
      style={{
        width: MAZE[0].length * CELL_SIZE,
        height: MAZE.length * CELL_SIZE,
      }}
    >
      {MAZE.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={cellClassName(cell)}
            style={{
              position: "absolute",
              left: x * CELL_SIZE,
              top: y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              boxSizing: "border-box",
              borderRight: "1px solid rgba(0,0,0,0.05)",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          />
        )),
      )}

      <div
        className="rounded-full bg-sky-500 shadow-md transition-[left,top] duration-100 ease-linear dark:bg-sky-400"
        style={{
          position: "absolute",
          left: player.x * CELL_SIZE + CELL_SIZE * 0.15,
          top: player.y * CELL_SIZE + CELL_SIZE * 0.15,
          width: CELL_SIZE * 0.7,
          height: CELL_SIZE * 0.7,
        }}
      />
    </div>
  );
}
