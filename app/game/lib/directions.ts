export type Direction = "up" | "down" | "left" | "right";

export const DIRECTION_DELTAS: Record<Direction, [dx: number, dy: number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

export function isDirection(value: string): value is Direction {
  return value in DIRECTION_DELTAS;
}
