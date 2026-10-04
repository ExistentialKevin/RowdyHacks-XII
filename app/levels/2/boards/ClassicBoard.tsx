"use client";

import type { ReactNode } from "react";
import type { Direction } from "../SecurityMazeGame";
import PlayerAvatar, { PLAYER_SPRITE } from "./PlayerAvatar";
import type { HeistBoardProps } from "./shared";

const CAMERA_ARROW: Record<Direction, string> = { UP: "▲", DOWN: "▼", LEFT: "◀", RIGHT: "▶" };

/**
 * Theme "classic" — the slate-terminal level 2 board from main, kept as-is.
 * The player stays the glowing "P" tile until a sprite is set in
 * PlayerAvatar.tsx (PLAYER_SPRITE); then the sprite is drawn on that tile.
 */
export default function ClassicBoard(props: HeistBoardProps) {
  const { grid, player, items, cameras, visionCells, moves, collected, total, caught } = props;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border border-line bg-panel-muted px-4 py-3 text-[11px] text-dim">
        <span>MOVES: <b className="ml-1 text-[13px] text-accent-primary">{moves}</b></span>
        <span>ITEMS: <b className="ml-1 text-[13px] text-accent-primary">{collected}/{total}</b></span>
      </div>

      <div className="overflow-x-auto border border-line bg-panel-deep p-3">
        <div
          className="grid min-w-[420px] gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
        >
          {grid.map((row, y) =>
            row.map((cellType, x) => {
              const isPlayerHere = player.x === x && player.y === y;
              const cameraHere = cameras.find(c => c.x === x && c.y === y);
              const itemHere = items.find(i => !i.collected && i.x === x && i.y === y);
              const isVision = visionCells.has(`${x},${y}`);

              let cls = "border border-panel-elevated bg-panel"; // Wall
              let content: ReactNode = null;

              if (cellType === 1) cls = "bg-background"; // Open path
              if (isVision && cellType !== 0) cls = "bg-slate-red/20"; // Camera vision cone
              if (cellType === 2) {
                cls = "border border-accent-primary bg-accent-secondary text-accent-primary";
                content = "EXIT";
              }
              if (itemHere) {
                cls = "bg-slate-yellow text-accent-primary-foreground";
                content = "?";
              }
              if (cameraHere) {
                cls = "bg-slate-red text-accent-primary-foreground";
                content = CAMERA_ARROW[cameraHere.direction];
              }
              if (isPlayerHere) {
                cls = caught
                  ? "bg-slate-red text-accent-primary-foreground ring-2 ring-slate-red/60"
                  : "bg-accent-primary text-accent-primary-foreground shadow-[0_0_12px_rgba(113,246,208,0.55)]";
                // Player character — swap it in boards/PlayerAvatar.tsx
                content = PLAYER_SPRITE ? <PlayerAvatar size={26} caught={caught} /> : "P";
              }

              return (
                <div
                  key={`${x}-${y}`}
                  className={`flex aspect-square items-center justify-center text-[9px] font-bold transition-colors sm:text-[10px] ${cls}`}
                  title={cameraHere ? `camera facing ${cameraHere.direction.toLowerCase()}` : undefined}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
        <div className="mt-2 text-right text-[10px] text-faint">
          grid:// sector_02 · x:{String(player.x).padStart(2, "0")} y:{String(player.y).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
