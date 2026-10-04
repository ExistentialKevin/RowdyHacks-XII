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
    name: "The Casing",
    description: "Scope the place out. Variables 101.",
    current: 5,
    total: 5,
    difficulty: "Beginner",
    category: "Tutorial",
    href: "/levels/1",
  },
  {
    levelNumber: 2,
    name: "The Camera Gauntlet",
    description: "Dodge three cameras, bag three diamonds.",
    current: 3,
    total: 6,
    difficulty: "Intermediate",
    category: "Infiltration",
    href: "/levels/2",
  },
  {
    levelNumber: 3,
    name: "The Inside Job",
    description: "Lift the code off the guard's terminal.",
    current: 1,
    total: 8,
    difficulty: "Advanced",
    category: "Cracking",
    href: "/levels/3",
  },
  {
    levelNumber: 4,
    name: "The Vault",
    description: "The big one. Crack the cipher before the cops show.",
    current: 0,
    total: 10,
    difficulty: "Expert",
    category: "Heist",
    href: null,
    locked: true,
  },
];
