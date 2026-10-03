export type Cell = 0 | 1 | 2;
export type Pos = { x: number; y: number };
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Camera {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  range: number; // Up to 3 blocks
  sprite: string; // e.g., 'camera.jpg'
}

export interface Item {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  sprite: string; // e.g., 'item.png'
}

// Terrain grid layout
export const grid: Cell[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
];

export const START: Pos = { x: 1, y: 1 };

// 3 Collectible Items placed across the maze
export const items: Item[] = [
  { id: 1, x: 5, y: 1, collected: false, sprite: 'item.png' },
  { id: 2, x: 7, y: 7, collected: false, sprite: 'item.png' },
  { id: 3, x: 1, y: 9, collected: false, sprite: 'item.png' },
];

// Cameras with 3-block sight ranges
export const cameras: Camera[] = [
  { id: 'cam1', x: 3, y: 1, direction: 'DOWN', range: 3, sprite: 'camera.jpg' },
  { id: 'cam2', x: 9, y: 5, direction: 'LEFT', range: 3, sprite: 'camera.jpg' },
];

export function isOpen(x: number, y: number): boolean {
  const cell = grid[y]?.[x];
  return cell === 1 || cell === 2;
}

export function isExit(x: number, y: number): boolean {
  return grid[y]?.[x] === 2;
}
