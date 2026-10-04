"use client";

import { useEffect, useRef, useState } from "react";
import type { Camera, Cell, Item, Pos } from "../SecurityMazeGame";

/** Pixel size of one maze tile in every board variant. */
export const TILE = 40;

export interface HeistBoardProps {
  grid: Cell[][];
  player: Pos;
  items: Item[];
  cameras: Camera[];
  visionCells: Set<string>;
  moves: number;
  collected: number;
  total: number;
  caught: boolean;
  won: boolean;
}

export const DIR_DELTA: Record<Camera["direction"], [number, number]> = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
};

/** How many tiles a camera actually sees before a wall blocks it. */
export function cameraReach(cam: Camera, grid: Cell[][]): number {
  const [dx, dy] = DIR_DELTA[cam.direction];
  let reach = 0;
  for (let i = 1; i <= cam.range; i++) {
    if (grid[cam.y + dy * i]?.[cam.x + dx * i] !== 1 && grid[cam.y + dy * i]?.[cam.x + dx * i] !== 2) break;
    reach = i;
  }
  return reach;
}

/**
 * SVG polygon points for a wedge-shaped vision cone. It starts at the camera
 * centre and opens up to exactly one tile wide at the last tile it can see,
 * so the drawn cone matches the tiles that actually trigger the alarm.
 */
export function conePoints(cam: Camera, grid: Cell[][], tile = TILE, startWidth = 0.15): string | null {
  const reach = cameraReach(cam, grid);
  if (reach === 0) return null;
  const [dx, dy] = DIR_DELTA[cam.direction];
  const cx = (cam.x + 0.5) * tile;
  const cy = (cam.y + 0.5) * tile;
  const far = (reach + 0.5) * tile;
  // perpendicular axis
  const px = dy !== 0 ? 1 : 0;
  const py = dx !== 0 ? 1 : 0;
  const w0 = startWidth * tile;
  const w1 = 0.5 * tile;
  const pts = [
    [cx + px * w0, cy + py * w0],
    [cx + dx * far + px * w1, cy + dy * far + py * w1],
    [cx + dx * far - px * w1, cy + dy * far - py * w1],
    [cx - px * w0, cy - py * w0],
  ];
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

/** Rotation (deg) so a right-facing drawing faces the camera's direction. */
export function dirAngle(dir: Camera["direction"]): number {
  return { RIGHT: 0, DOWN: 90, LEFT: 180, UP: 270 }[dir];
}

/** Tracks which way the player is facing plus a waddle frame that flips each step. */
export function useBirdMotion(player: Pos) {
  const prev = useRef(player);
  const [facing, setFacing] = useState<"left" | "right">("right");
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const p = prev.current;
    if (p.x === player.x && p.y === player.y) return;
    if (player.x < p.x) setFacing("left");
    else if (player.x > p.x) setFacing("right");
    setFrame((f) => f + 1);
    prev.current = player;
  }, [player]);

  return { facing, waddle: frame % 2 === 1 };
}

/** Deterministic pseudo-random number in [0,1) for a tile, used for decorative variety. */
export function tileNoise(x: number, y: number, salt = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

export function isWall(grid: Cell[][], x: number, y: number) {
  return grid[y]?.[x] === 0;
}
