export interface LevelData {
  levelNumber: number;
  name: string;
  description: string;
  current: number;
  total: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
  /** Route for the level, or null if it has no playable page yet. */
  href: string | null;
  locked?: boolean;
}

export const initialLevels: LevelData[] = [
  {
    levelNumber: 1,
    name: "Variables",
    description: "Python basics: navigate hallways, discover sensor trips, unlock the perimeter.",
    current: 5,
    total: 5,
    difficulty: "Beginner",
    category: "Tutorial",
    href: null,
  },
  {
    levelNumber: 2,
    name: "Laser Grid Maze",
    description: "Pathfinding loops to outsmart oscillating infrared beams.",
    current: 3,
    total: 6,
    difficulty: "Intermediate",
    category: "Infiltration",
    href: "/levels/2",
  },
  {
    levelNumber: 3,
    name: "Vault Sequence",
    description: "Conditional logic and state inspection to bypass pressure locks.",
    current: 1,
    total: 8,
    difficulty: "Advanced",
    category: "Cracking",
    href: "/levels/3",
  },
  {
    levelNumber: 4,
    name: "Cipher Core",
    description: "Crack dynamic ciphers under a real-time countdown.",
    current: 0,
    total: 10,
    difficulty: "Expert",
    category: "Heist",
    href: null,
    locked: true,
  },
];
