import { gameHud } from "../data/mock";

// Static mock of the pygame window. Each character is one 20px tile:
// # wall · . floor · C coin · P player · G guard · V vault exit
const LEVEL = [
  "################",
  "#P....#........#",
  "#.##..#..####..#",
  "#.#C..#..#..C..#",
  "#.#...G..#.....#",
  "#.####...#.##..#",
  "#......C.#..#..#",
  "###.######..#..#",
  "#.......G...#C.#",
  "#.####..###.#..#",
  "#C.........G..V#",
  "################",
];

const T = 20; // tile size
const W = LEVEL[0].length * T;
const H = LEVEL.length * T;

type Tile = { x: number; y: number; ch: string };
const tiles: Tile[] = LEVEL.flatMap((row, y) => row.split("").map((ch, x) => ({ x: x * T, y: y * T, ch })));

export default function GameView() {
  return (
    <div className="flex w-full max-w-[400px] shrink-0 flex-col overflow-hidden rounded-lg border border-panel-border bg-black shadow-lg shadow-black/30">
      {/* fake window title bar */}
      <div className="flex items-center justify-between bg-panel-elevated px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-accent-primary" />
          {gameHud.title}
        </span>
        <span>
          {gameHud.fps} FPS · {W}×{H}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H + 18}`} className="block w-full" role="img" aria-label="Game preview: the player in a vault maze with guards and coins">
        {/* HUD */}
        <rect x="0" y="0" width={W} height="18" fill="#0d1117" />
        <text x="6" y="13" fill="#71f6d0" fontSize="10" fontFamily="monospace">
          SCORE {gameHud.score}
        </text>
        <text x={W / 2} y="13" fill="#e3b341" fontSize="10" fontFamily="monospace" textAnchor="middle">
          COINS {gameHud.coins}
        </text>
        <text x={W - 6} y="13" fill="#ff7b72" fontSize="10" fontFamily="monospace" textAnchor="end">
          {"♥".repeat(gameHud.lives)}
        </text>

        <g transform="translate(0 18)">
          {tiles.map((t, i) =>
            t.ch === "#" ? (
              <rect key={i} x={t.x} y={t.y} width={T} height={T} fill="#2d333b" stroke="#21262d" />
            ) : (
              <rect key={i} x={t.x} y={t.y} width={T} height={T} fill="#10151b" />
            ),
          )}

          {/* guard vision cones (the HS-12 bug: they pass through walls) */}
          <polygon points="130,90 200,62 200,118" fill="#ff7b72" opacity="0.18" />
          <polygon points="170,170 240,142 240,198" fill="#ff7b72" opacity="0.18" />
          <polygon points="230,210 160,182 160,238" fill="#ff7b72" opacity="0.18" />

          {tiles.map((t, i) => {
            const cx = t.x + T / 2;
            const cy = t.y + T / 2;
            switch (t.ch) {
              case "C":
                return <circle key={i} cx={cx} cy={cy} r="4.5" fill="#e3b341" stroke="#a37a1c" />;
              case "G":
                return (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r="7" fill="#ff7b72" />
                    <circle cx={cx + 2.5} cy={cy - 1.5} r="1.5" fill="#0d1117" />
                  </g>
                );
              case "P":
                return (
                  <g key={i}>
                    <rect x={t.x + 3} y={t.y + 3} width="14" height="14" rx="3" fill="#71f6d0" />
                    <rect x={t.x + 6} y={t.y + 7} width="2.5" height="2.5" fill="#0d1117" />
                    <rect x={t.x + 11.5} y={t.y + 7} width="2.5" height="2.5" fill="#0d1117" />
                  </g>
                );
              case "V":
                return (
                  <g key={i}>
                    <rect x={t.x + 2} y={t.y + 2} width="16" height="16" rx="2" fill="#1c3d37" stroke="#71f6d0" />
                    <circle cx={cx} cy={cy} r="3" fill="none" stroke="#71f6d0" />
                  </g>
                );
              default:
                return null;
            }
          })}
        </g>
      </svg>
    </div>
  );
}
