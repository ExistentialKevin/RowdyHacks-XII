import type { ReactNode } from "react";
import { grid, type Pos } from "../lib/security";
import { CELL_SIZE } from "../lib/constants";

// Adjust cell colors here to restyle the board.
function cellClassName(cell: number) {
  if (cell === 0) return "bg-zinc-800 dark:bg-black";
  if (cell === 2) return "bg-emerald-400 dark:bg-emerald-500";
  return "bg-zinc-100 dark:bg-zinc-900";
}

export interface MazeMarker {
  x: number;
  y: number;
  content: ReactNode;
  className?: string;
}

export function MazeBoard({
  player,
  markers = [],
}: {
  player: Pos;
  markers?: MazeMarker[];
}) {
  return (
    <div
      className="relative border border-black/[.08] bg-zinc-100 dark:border-white/[.145] dark:bg-zinc-900"
      style={{
        width: grid[0].length * CELL_SIZE,
        height: grid.length * CELL_SIZE,
      }}
    >
      {grid.map((row, y) =>
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

      {markers.map((marker, i) => (
        <div
          key={`marker-${i}`}
          className={`flex items-center justify-center text-sm ${marker.className ?? ""}`}
          style={{
            position: "absolute",
            left: marker.x * CELL_SIZE,
            top: marker.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
            pointerEvents: "none",
          }}
        >
          {marker.content}
        </div>
      ))}

      <div
        className="rounded-full shadow-md transition-[left,top] duration-100 ease-linear"
        style={{
          position: "absolute",
          left: player.x * CELL_SIZE + CELL_SIZE * 0.1,
          top: player.y * CELL_SIZE + CELL_SIZE * 0.1,
          width: CELL_SIZE * 0.8,
          height: CELL_SIZE * 0.8,
          backgroundImage: "url(/game/lil_guy.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
