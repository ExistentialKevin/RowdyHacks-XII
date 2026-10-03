import LevelCard from "./LevelCard";
import { initialLevels, type LevelData } from "../data/levels";

interface LevelListProps {
  levels?: LevelData[];
}

export default function LevelList({ levels = initialLevels }: LevelListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {levels.map((lvl) => (
        <LevelCard
          key={lvl.name}
          levelNumber={lvl.levelNumber}
          name={lvl.name}
          description={lvl.description}
          current={lvl.current}
          total={lvl.total}
          difficulty={lvl.difficulty}
          category={lvl.category}
          href={lvl.href}
        />
      ))}
    </div>
  );
}
