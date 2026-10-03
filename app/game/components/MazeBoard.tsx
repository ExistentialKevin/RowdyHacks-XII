import { MAZE, type Pos } from "../lib/maze";
import { CELL_SIZE } from "../lib/constants";

function cellClassName(cell: number) {
  if (cell === 0) return "bg-[#090d13]"; // Wall
  if (cell === 2) return "bg-accent-primary"; // Exit goal
  return "bg-panel-muted"; // Pathway
}

export function MazeBoard({ player }: { player: Pos }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-panel-border bg-panel shadow-2xl shadow-black/40"
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
              borderRight: "1px solid rgba(113, 246, 208, 0.05)",
              borderBottom: "1px solid rgba(113, 246, 208, 0.05)",
            }}
          />
        )),
      )}

      {/* Player marker */}
      <div
        className="rounded-full bg-accent-primary shadow-[0_0_12px_rgba(113,246,208,0.8)] transition-[left,top] duration-100 ease-linear border border-white/60"
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
