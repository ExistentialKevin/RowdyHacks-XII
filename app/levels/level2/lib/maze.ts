// 0 = wall, 1 = open path, 2 = exit
export type Cell = 0 | 1 | 2;
export type Pos = { x: number; y: number };

// Edit this grid to change the maze layout.
export const MAZE: Cell[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const START: Pos = { x: 1, y: 1 };

export function isOpen(x: number, y: number): boolean {
  const cell = MAZE[y]?.[x];
  return cell === 1 || cell === 2;
}

export function isExit(x: number, y: number): boolean {
  return MAZE[y]?.[x] === 2;
}
