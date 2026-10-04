"use client";

import {
  DIR_DELTA,
  TILE,
  conePoints,
  type HeistBoardProps,
  useBirdMotion,
} from "./shared";
import PlayerAvatar from "./PlayerAvatar";

/**
 * Variant A — "Night Vault"
 * Closest to the reference mockup: dark slate tiles, round guards with soft
 * red vision wedges, gold coins and a mint getaway hatch. The silliness comes
 * from the cast: mustachioed guards in tiny caps, a masked thief that waddles,
 * and a sleepy "zzz" guard who isn't really doing his job.
 */
export default function NightVaultBoard(props: HeistBoardProps) {
  const { grid, player, items, cameras, visionCells, moves, collected, total, caught, won } = props;
  const { facing, waddle } = useBirdMotion(player);
  const W = grid[0].length * TILE;
  const H = grid.length * TILE;

  const status = caught ? "BUSTED!" : won ? "ESCAPED" : "SNEAKY";
  const statusColor = caught ? "text-[#f07167]" : won ? "text-[#71F6D0]" : "text-zinc-400";

  return (
    <div className="nv-root mx-auto w-fit overflow-hidden rounded-xl border border-[#2d333b] bg-[#0f1318] shadow-2xl">
      <style>{NV_CSS}</style>
      {/* HUD */}
      <div className="flex items-center justify-between gap-6 bg-[#0b0e12] px-4 py-2 font-mono text-sm tracking-wider">
        <span className="text-[#71F6D0]">
          MOVES <span className="font-bold">{moves}</span>
        </span>
        <span className="text-[#f2c14e]">
          LOOT {collected} / {total}
        </span>
        <span className={`font-bold ${statusColor}`}>
          {caught ? "🚨" : "🥷"} {status}
        </span>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block">
        <defs>
          <radialGradient id="nv-coin" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffe08a" />
            <stop offset="100%" stopColor="#c9962a" />
          </radialGradient>
          <linearGradient id="nv-cone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f07167" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f07167" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* floor */}
        <rect width={W} height={H} fill="#12161c" />

        {/* tiles */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell === 0) {
              return (
                <rect
                  key={`w${x}-${y}`}
                  x={x * TILE + 0.5}
                  y={y * TILE + 0.5}
                  width={TILE - 1}
                  height={TILE - 1}
                  rx={2}
                  fill="#2b323c"
                  stroke="#222830"
                />
              );
            }
            const lit = visionCells.has(`${x},${y}`);
            return (
              <rect
                key={`f${x}-${y}`}
                x={x * TILE + 0.5}
                y={y * TILE + 0.5}
                width={TILE - 1}
                height={TILE - 1}
                fill={lit ? "#2a1719" : "#161b22"}
                stroke="#1b2028"
              />
            );
          }),
        )}

        {/* exit hatch */}
        {grid.map((row, y) =>
          row.map((cell, x) =>
            cell === 2 ? (
              <g key={`exit${x}-${y}`} transform={`translate(${x * TILE + TILE / 2} ${y * TILE + TILE / 2})`}>
                <rect x={-14} y={-14} width={28} height={28} rx={4} fill="#1c3d37" stroke="#71F6D0" strokeWidth={2} className="nv-exit" />
                <circle r={6} fill="none" stroke="#71F6D0" strokeWidth={2} />
                <line x1={0} y1={-6} x2={0} y2={-2} stroke="#71F6D0" strokeWidth={2} />
              </g>
            ) : null,
          ),
        )}

        {/* vision cones */}
        {cameras.map((cam) => {
          const pts = conePoints(cam, grid, TILE, 0.2);
          return pts ? (
            <polygon key={`cone-${cam.id}`} points={pts} fill="#f07167" fillOpacity={caught ? 0.5 : 0.28} className="nv-cone" />
          ) : null;
        })}

        {/* coins */}
        {items
          .filter((i) => !i.collected)
          .map((i) => (
            <g key={`coin-${i.id}`} transform={`translate(${i.x * TILE + TILE / 2} ${i.y * TILE + TILE / 2})`}>
              <g className="nv-coin">
                <circle r={9} fill="url(#nv-coin)" stroke="#8a6414" strokeWidth={1.5} />
                <text y={4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#8a6414" fontFamily="monospace">
                  $
                </text>
              </g>
              <path d="M10 -11 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5z" fill="#fff6c9" className="nv-sparkle" />
            </g>
          ))}

        {/* guards */}
        {cameras.map((cam, idx) => {
          const [dx, dy] = DIR_DELTA[cam.direction];
          const sleepy = conePoints(cam, grid) === null; // facing a wall = napping on the job
          return (
            <g key={cam.id} transform={`translate(${cam.x * TILE + TILE / 2} ${cam.y * TILE + TILE / 2})`}>
              <g className={sleepy ? "nv-snooze" : "nv-guard"} style={{ animationDelay: `${idx * 0.4}s` }}>
                <circle r={13} fill="#f07167" stroke="#c4554c" strokeWidth={1.5} />
                {/* cap */}
                <path d="M-11 -6 Q0 -20 11 -6 Z" fill="#2b3a67" />
                <rect x={-12} y={-7} width={24} height={3} rx={1.5} fill="#1d2747" />
                <circle cy={-12} r={2} fill="#f2c14e" />
                {/* eye(s) */}
                {sleepy ? (
                  <path d="M-6 1 q3 2 6 0 M2 1 q3 2 6 0" stroke="#1a1a1a" strokeWidth={1.5} fill="none" />
                ) : (
                  <>
                    <circle cx={dx * 5} cy={dy * 4 + 1} r={3.2} fill="white" />
                    <circle cx={dx * 6.5} cy={dy * 5 + 1} r={1.8} fill="#1a1a1a" />
                  </>
                )}
                {/* mustache */}
                <path d="M-6 7 q3 -3 6 0 q3 -3 6 0 q-3 3 -6 0 q-3 3 -6 0z" fill="#3a2a22" />
              </g>
              {sleepy && !caught && (
                <text x={10} y={-12} fontSize={10} fontWeight={800} fill="#9caab9" fontFamily="monospace" className="nv-zzz">
                  z<tspan fontSize={8}>z</tspan>
                </text>
              )}
              {caught && !sleepy && (
                <g className="nv-alert">
                  <rect x={6} y={-28} width={14} height={16} rx={3} fill="#fff" />
                  <text x={13} y={-15} textAnchor="middle" fontSize={13} fontWeight={900} fill="#f07167">
                    !
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* player — see PlayerAvatar.tsx to swap the character */}
        <g
          style={{
            transform: `translate(${player.x * TILE}px, ${player.y * TILE}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <ellipse cx={TILE / 2} cy={TILE - 5} rx={11} ry={3} fill="#000" opacity={0.35} />
          <g
            style={{
              transformOrigin: `${TILE / 2}px ${TILE / 2}px`,
              transform: `scaleX(${facing === "left" ? -1 : 1}) rotate(${waddle ? 6 : -6}deg)`,
              transition: "transform 120ms",
            }}
          >
            <PlayerAvatar size={TILE} closed={waddle} caught={caught} />
          </g>
        </g>

        {/* end-state overlays */}
        {caught && <rect width={W} height={H} fill="#f07167" className="nv-flash" />}
        {(caught || won) && (
          <g transform={`translate(${W / 2} ${H / 2})`}>
            <rect x={-120} y={-26} width={240} height={52} rx={10} fill="#0b0e12" stroke={caught ? "#f07167" : "#71F6D0"} strokeWidth={2} opacity={0.94} />
            <text y={-2} textAnchor="middle" fontSize={20} fontWeight={900} fill={caught ? "#f07167" : "#71F6D0"} fontFamily="monospace">
              {caught ? "BUSTED!" : "CLEAN GETAWAY!"}
            </text>
            <text y={16} textAnchor="middle" fontSize={10} fill="#9caab9" fontFamily="monospace">
              {caught ? "the guard saw you tiptoeing" : `${collected} coins pocketed in ${moves} moves`}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

const NV_CSS = `
.nv-root .nv-coin { animation: nv-bob 1.4s ease-in-out infinite; }
.nv-root .nv-sparkle { animation: nv-twinkle 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.nv-root .nv-guard { animation: nv-breathe 2.2s ease-in-out infinite; }
.nv-root .nv-snooze { animation: nv-breathe 3.4s ease-in-out infinite; }
.nv-root .nv-zzz { animation: nv-float 2s ease-in-out infinite; }
.nv-root .nv-cone { animation: nv-sweep 2.4s ease-in-out infinite; }
.nv-root .nv-exit { animation: nv-glow 1.6s ease-in-out infinite; }
.nv-root .nv-alert { animation: nv-pop 0.4s cubic-bezier(.3,1.8,.5,1) both; transform-box: fill-box; transform-origin: bottom left; }
.nv-root .nv-flash { animation: nv-flash 0.9s ease-out 3 both; }
@keyframes nv-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2.5px) } }
@keyframes nv-twinkle { 0%,100% { opacity: 0; transform: scale(.4) } 50% { opacity: 1; transform: scale(1) } }
@keyframes nv-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
@keyframes nv-float { 0% { opacity: 0; transform: translate(0,4px) } 50% { opacity: 1 } 100% { opacity: 0; transform: translate(4px,-6px) } }
@keyframes nv-sweep { 0%,100% { opacity: .8 } 50% { opacity: 1 } }
@keyframes nv-glow { 0%,100% { stroke-opacity: 1 } 50% { stroke-opacity: .35 } }
@keyframes nv-pop { from { transform: scale(0) } to { transform: scale(1) } }
@keyframes nv-flash { 0% { opacity: .35 } 100% { opacity: 0 } }
`;
