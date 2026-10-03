export interface LevelData {
  levelNumber: number;
  name: string;
  description: string;
  current: number;
  total: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
  href: string;
}

export const initialLevels: LevelData[] = [
  {
    levelNumber: 1,
    name: "Variables",
    description: "Initiate Python basics: navigate hallways, discover sensor trips, and unlock the primary perimeter airlock.",
    current: 5,
    total: 5,
    difficulty: "Beginner",
    category: "Tutorial",
    href: "/game/1",
  },
  {
    levelNumber: 2,
    name: "Laser Grid Maze",
    description: "Program algorithmic pathfinding loops to outsmart oscillating infrared beams and reach the server console.",
    current: 3,
    total: 6,
    difficulty: "Intermediate",
    category: "Infiltration",
    href: "/game/2",
  },
  {
    levelNumber: 3,
    name: "Vault Sequence",
    description: "Implement conditioned logic and state inspection to bypass multi-layer pneumatic pressure locks.",
    current: 1,
    total: 8,
    difficulty: "Advanced",
    category: "Cracking",
    href: "/game/3",
  },
  {
    levelNumber: 4,
    name: "Cipher Core",
    description: "Crack dynamic cryptographic ciphers under a real-time watchdog countdown timer before alarm triggers.",
    current: 0,
    total: 10,
    difficulty: "Expert",
    category: "Heist",
    href: "/game/4",
  },
];
