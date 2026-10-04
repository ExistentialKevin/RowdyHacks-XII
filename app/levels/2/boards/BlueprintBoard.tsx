"use client";

import { Permanent_Marker } from "next/font/google";
import {
  TILE,
  conePoints,
  dirAngle,
  type HeistBoardProps,
  tileNoise,
  useBirdMotion,
} from "./shared";
import PlayerAvatar from "./PlayerAvatar";

const marker = Permanent_Marker({ weight: "400", subsets: ["latin"] });

/**
 * Variant B — "Blueprint Caper"
 * The maze is the crew's hand-drawn heist plan: blueprint paper, hatched
 * walls, highlighter vision cones, and scribbled margin notes. The player is
 * circled on the plan like the mastermind it believes it is.
 */
export default function BlueprintBoard(props: HeistBoardProps) {
  const { grid, player, items, cameras, visionCells, moves, collected, total, caught, won } = props;
  const { facing, waddle } = useBirdMotion(player);
  const PAD = 14;
  const W = grid[0].length * TILE;
  const H = grid.length * TILE;
  const font = marker.style.fontFamily;

  const status = caught ? "WE'VE BEEN MADE" : won ? "WE'RE RICH!!" : "nobody saw nothin'";

  return (
    <div className="bp-root mx-auto w-fit rounded-md bg-[#173f72] p-3 shadow-2xl ring-1 ring-white/20" style={{ fontFamily: font }}>
      <style>{BP_CSS}</style>
      {/* HUD — scribbled header */}
      <div className="mb-2 flex items-end justify-between gap-6 px-1 text-white">
        <div className="leading-none">
          <div className="text-[10px] tracking-[0.2em] text-white/60">TOP SECRET · PLAN B</div>
          <div className="text-lg">Operation: Birdseed</div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>
            moves: <span className="text-[#ffe066]">{moves}</span>
          </span>
          <span>
            loot:{" "}
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i < collected ? "text-[#ffe066]" : "text-white/30"}>
                {i < collected ? "☑" : "☐"}
              </span>
            ))}
          </span>
          <span className={caught ? "text-[#ff6b6b]" : won ? "text-[#8ef0a7]" : "text-white/70"}>{status}</span>
        </div>
      </div>

      <svg width={W + PAD * 2} height={H + PAD * 2} viewBox={`${-PAD} ${-PAD} ${W + PAD * 2} ${H + PAD * 2}`} className="block">
        <defs>
          <pattern id="bp-grid" width={TILE / 4} height={TILE / 4} patternUnits="userSpaceOnUse">
            <path d={`M ${TILE / 4} 0 L 0 0 0 ${TILE / 4}`} fill="none" stroke="#ffffff" strokeOpacity={0.07} strokeWidth={1} />
          </pattern>
          <pattern id="bp-hatch" width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1={0} y1={0} x2={0} y2={6} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} />
          </pattern>
          <filter id="bp-wobble">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={3} />
            <feDisplacementMap in="SourceGraphic" scale={2.5} />
          </filter>
        </defs>

        {/* paper */}
        <rect x={-PAD} y={-PAD} width={W + PAD * 2} height={H + PAD * 2} fill="#1d4e89" />
        <rect x={-PAD} y={-PAD} width={W + PAD * 2} height={H + PAD * 2} fill="url(#bp-grid)" />

        {/* tile grid lines */}
        <g stroke="#ffffff" strokeOpacity={0.12}>
          {grid[0].map((_, x) => (
            <line key={`vx${x}`} x1={x * TILE} y1={0} x2={x * TILE} y2={H} />
          ))}
          {grid.map((_, y) => (
            <line key={`hy${y}`} x1={0} y1={y * TILE} x2={W} y2={y * TILE} />
          ))}
        </g>

        {/* walls: hatched, slightly wobbly "hand-drawn" outlines */}
        <g filter="url(#bp-wobble)">
          {grid.map((row, y) =>
            row.map((cell, x) =>
              cell === 0 ? (
                <rect
                  key={`w${x}-${y}`}
                  x={x * TILE + 2}
                  y={y * TILE + 2}
                  width={TILE - 4}
                  height={TILE - 4}
                  fill="url(#bp-hatch)"
                  stroke="#eaf3ff"
                  strokeWidth={1.6}
                />
              ) : null,
            ),
          )}
        </g>

        {/* highlighter vision cones */}
        {cameras.map((cam) => {
          const pts = conePoints(cam, grid, TILE, 0.1);
          return pts ? (
            <polygon
              key={`cone-${cam.id}`}
              points={pts}
              fill="#ffe066"
              fillOpacity={caught ? 0.55 : 0.32}
              stroke="#ffe066"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              className="bp-cone"
            />
          ) : null;
        })}
        {[...visionCells].map((k) => {
          const [x, y] = k.split(",").map(Number);
          return (
            <text key={`no-${k}`} x={x * TILE + TILE - 6} y={y * TILE + 11} fontSize={9} textAnchor="end" fill="#ffe066" fontFamily={font} opacity={0.8}>
              no
            </text>
          );
        })}

        {/* exit: circled & stamped */}
        {grid.map((row, y) =>
          row.map((cell, x) =>
            cell === 2 ? (
              <g key={`exit${x}-${y}`} transform={`translate(${x * TILE + TILE / 2} ${y * TILE + TILE / 2})`}>
                <ellipse rx={18} ry={16} fill="none" stroke="#ff6b6b" strokeWidth={2.5} className="bp-exit" />
                <text y={4} textAnchor="middle" fontSize={11} fill="#ff6b6b" fontFamily={font}>
                  EXIT
                </text>
                <text x={-24} y={-18} fontSize={10} fill="#ff6b6b" fontFamily={font} transform="rotate(-8)">
                  van waits here →
                </text>
              </g>
            ) : null,
          ),
        )}

        {/* loot: doodled money bags */}
        {items
          .filter((i) => !i.collected)
          .map((i) => (
            <g key={`loot-${i.id}`} transform={`translate(${i.x * TILE + TILE / 2} ${i.y * TILE + TILE / 2}) rotate(${(tileNoise(i.x, i.y) - 0.5) * 20})`}>
              <g className="bp-loot">
                <path
                  d="M-5 -9 L5 -9 L3 -5 Q12 0 10 8 Q8 12 0 12 Q-8 12 -10 8 Q-12 0 -3 -5 Z"
                  fill="#1d4e89"
                  stroke="#ffffff"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                />
                <text y={8} textAnchor="middle" fontSize={11} fill="#ffe066" fontFamily={font}>
                  $
                </text>
              </g>
            </g>
          ))}

        {/* cameras: line-art doodles */}
        {cameras.map((cam) => (
          <g key={cam.id} transform={`translate(${cam.x * TILE + TILE / 2} ${cam.y * TILE + TILE / 2})`}>
            <g transform={`rotate(${dirAngle(cam.direction)})`}>
              <rect x={-12} y={-7} width={16} height={14} rx={2} fill="#1d4e89" stroke="#fff" strokeWidth={1.8} />
              <path d="M4 -4 L11 -7 L11 7 L4 4 Z" fill="#1d4e89" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round" />
            </g>
            <circle cx={-7} cy={-10} r={2.6} fill="#ff6b6b" className="bp-rec" />
            {caught && (
              <text x={8} y={-12} fontSize={16} fill="#ff6b6b" fontFamily={font} className="bp-pop">
                !?
              </text>
            )}
          </g>
        ))}

        {/* the mastermind */}
        <g
          style={{
            transform: `translate(${player.x * TILE}px, ${player.y * TILE}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <circle cx={TILE / 2} cy={TILE / 2} r={18} fill="none" stroke="#8ef0a7" strokeWidth={1.8} strokeDasharray="4 3" className="bp-ring" />
          <g
            style={{
              transformOrigin: `${TILE / 2}px ${TILE / 2}px`,
              transform: `scaleX(${facing === "left" ? -1 : 1}) rotate(${waddle ? 7 : -7}deg)`,
              transition: "transform 120ms",
            }}
          >
            <PlayerAvatar size={TILE} closed={waddle} caught={caught} />
          </g>
          {moves === 0 && !caught && (
            <text x={TILE + 2} y={-2} fontSize={11} fill="#8ef0a7" fontFamily={font} transform="rotate(-6)">
              ← us (genius)
            </text>
          )}
        </g>

        {/* margin doodles */}
        <text x={W - 4} y={H + PAD - 3} textAnchor="end" fontSize={9} fill="#ffffff" fillOpacity={0.45} fontFamily={font}>
          yellow = guard looking. don&apos;t stand in yellow.
        </text>

        {(caught || won) && (
          <g transform={`translate(${W / 2} ${H / 2}) rotate(-8)`} className="bp-stamp">
            <rect x={-130} y={-30} width={260} height={60} rx={6} fill="#1d4e89" fillOpacity={0.85} stroke={caught ? "#ff6b6b" : "#8ef0a7"} strokeWidth={4} />
            <text y={10} textAnchor="middle" fontSize={30} fill={caught ? "#ff6b6b" : "#8ef0a7"} fontFamily={font}>
              {caught ? "PLAN FAILED" : "PLAN WORKED?!"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

const BP_CSS = `
.bp-root .bp-loot { animation: bp-wiggle 1.6s ease-in-out infinite; }
.bp-root .bp-rec { animation: bp-blink 1s steps(2) infinite; }
.bp-root .bp-cone { animation: bp-march 1.2s linear infinite; }
.bp-root .bp-ring { animation: bp-march 1.5s linear infinite; }
.bp-root .bp-exit { animation: bp-pulse 1.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.bp-root .bp-pop { animation: bp-wiggle .3s ease-in-out infinite; }
.bp-root .bp-stamp > * { animation: bp-stamp .35s cubic-bezier(.3,1.6,.5,1) both; transform-box: fill-box; transform-origin: center; }
@keyframes bp-wiggle { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
@keyframes bp-blink { 0% { opacity: 1 } 100% { opacity: .15 } }
@keyframes bp-march { to { stroke-dashoffset: -18 } }
@keyframes bp-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.1) } }
@keyframes bp-stamp { from { transform: scale(2.2); opacity: 0 } to { transform: scale(1); opacity: 1 } }
`;
