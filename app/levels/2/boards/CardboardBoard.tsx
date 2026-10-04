"use client";

import type { ReactNode } from "react";
import { Bangers } from "next/font/google";
import {
  DIR_DELTA,
  TILE,
  conePoints,
  dirAngle,
  type HeistBoardProps,
  tileNoise,
  useBirdMotion,
} from "./shared";
import PlayerAvatar from "./PlayerAvatar";

const bangers = Bangers({ weight: "400", subsets: ["latin"] });

const INK = "#2a1a10";

/**
 * Variant C — "Cardboard Caper"
 * Styled after the mascot sticker itself: kraft-paper backdrop, everything
 * outlined in thick ink with a white sticker border. Walls are taped-up
 * cardboard boxes, cameras have googly eyes, loot is stacks of cash and the
 * exit is the crew's trusty black loot sack.
 */
export default function CardboardBoard(props: HeistBoardProps) {
  const { grid, player, items, cameras, visionCells, moves, collected, total, caught, won } = props;
  const { facing, waddle } = useBirdMotion(player);
  const W = grid[0].length * TILE;
  const H = grid.length * TILE;
  const comic = bangers.style.fontFamily;

  return (
    <div className="cb-root relative mx-auto w-fit rounded-2xl p-4 shadow-2xl" style={{ background: KRAFT_BG, fontFamily: comic }}>
      <style>{CB_CSS}</style>

      {/* HUD — masking tape labels */}
      <div className="mb-3 flex items-center justify-between gap-4 text-xl tracking-wide">
        <Tape rotate={-2}>MOVES: {moves}</Tape>
        <Tape rotate={1.5}>
          CASH: {collected}/{total} {collected === total ? "💸" : ""}
        </Tape>
        <Tape rotate={-1} tone={caught ? "#ff8a7a" : won ? "#9be59b" : undefined}>
          {caught ? "WEE-OO WEE-OO" : won ? "PAYDAY!" : "SHHHH..."}
        </Tape>
      </div>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block overflow-visible">
        <defs>
          {/* white sticker outline + soft drop shadow */}
          <filter id="cb-sticker" x="-30%" y="-30%" width="160%" height="160%">
            <feMorphology in="SourceAlpha" operator="dilate" radius={2.5} result="grow" />
            <feFlood floodColor="#ffffff" />
            <feComposite in2="grow" operator="in" result="outline" />
            <feDropShadow dx={1.5} dy={2.5} stdDeviation={1} floodColor="#000" floodOpacity={0.35} in="outline" result="shadowed" />
            <feMerge>
              <feMergeNode in="shadowed" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="cb-spot">
            <stop offset="0%" stopColor="#fff6b0" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#fff6b0" stopOpacity={0.45} />
          </radialGradient>
        </defs>

        {/* floor */}
        <rect width={W} height={H} rx={10} fill="#7d4f2d" stroke={INK} strokeWidth={3} />
        {grid.map((row, y) =>
          row.map((cell, x) =>
            cell !== 0 ? (
              <rect
                key={`f${x}-${y}`}
                x={x * TILE}
                y={y * TILE}
                width={TILE}
                height={TILE}
                fill={visionCells.has(`${x},${y}`) ? "#a8743f" : (x + y) % 2 ? "#8a5a35" : "#83552f"}
              />
            ) : null,
          ),
        )}

        {/* vision cones: searchlights */}
        {cameras.map((cam) => {
          const pts = conePoints(cam, grid, TILE, 0.15);
          return pts ? (
            <polygon key={`cone-${cam.id}`} points={pts} fill="url(#cb-spot)" stroke="#fff6b0" strokeWidth={1} opacity={caught ? 1 : 0.75} className="cb-cone" />
          ) : null;
        })}

        {/* walls: cardboard boxes */}
        {grid.map((row, y) =>
          row.map((cell, x) => {
            if (cell !== 0) return null;
            const n = tileNoise(x, y);
            const tapeVertical = n > 0.5;
            return (
              <g key={`w${x}-${y}`} transform={`translate(${x * TILE} ${y * TILE})`}>
                <rect x={1.5} y={1.5} width={TILE - 3} height={TILE - 3} rx={3} fill={n > 0.85 ? "#d39a5f" : "#dca46a"} stroke={INK} strokeWidth={2} />
                {tapeVertical ? (
                  <rect x={TILE / 2 - 4} y={1.5} width={8} height={TILE - 3} fill="#f1d6a2" opacity={0.85} />
                ) : (
                  <rect x={1.5} y={TILE / 2 - 4} width={TILE - 3} height={8} fill="#f1d6a2" opacity={0.85} />
                )}
                {n > 0.92 && (
                  <text x={TILE / 2} y={TILE / 2 + 3} textAnchor="middle" fontSize={8} fill="#b8432f" fontFamily={comic} transform={`rotate(-12 ${TILE / 2} ${TILE / 2})`}>
                    FRAGILE
                  </text>
                )}
                {n < 0.08 && (
                  <text x={TILE / 2} y={TILE / 2 + 4} textAnchor="middle" fontSize={11} fill={INK} fontFamily={comic}>
                    $$$?
                  </text>
                )}
              </g>
            );
          }),
        )}

        {/* exit: the loot sack drop zone */}
        {grid.map((row, y) =>
          row.map((cell, x) =>
            cell === 2 ? (
              <g key={`exit${x}-${y}`} transform={`translate(${x * TILE + TILE / 2} ${y * TILE + TILE / 2})`}>
                <g filter="url(#cb-sticker)" className="cb-sack">
                  <path d="M-4 -12 L4 -12 L2 -7 Q14 -2 12 8 Q10 14 0 14 Q-10 14 -12 8 Q-14 -2 -2 -7 Z" fill="#1d1d1f" stroke={INK} strokeWidth={1.5} />
                  <path d="M-5 -9 q5 3 10 0" stroke="#555" strokeWidth={1.5} fill="none" />
                </g>
                <text y={7} textAnchor="middle" fontSize={9} fill="#fff" fontFamily={comic} letterSpacing={0.5}>
                  DROP
                </text>
              </g>
            ) : null,
          ),
        )}

        {/* loot: cash stacks */}
        {items
          .filter((i) => !i.collected)
          .map((i) => (
            <g key={`cash-${i.id}`} transform={`translate(${i.x * TILE + TILE / 2} ${i.y * TILE + TILE / 2})`}>
              <g filter="url(#cb-sticker)" className="cb-cash">
                {[6, 2, -2].map((dy, k) => (
                  <rect key={k} x={-12 + k} y={dy - 4} width={22} height={8} rx={1.5} fill={k === 2 ? "#8fd18f" : "#6fb46f"} stroke={INK} strokeWidth={1.4} />
                ))}
                <rect x={-3} y={-6} width={6} height={8} fill="#f2e3b3" stroke={INK} strokeWidth={1} />
                <text x={0} y={0} textAnchor="middle" fontSize={7} fill={INK} fontFamily={comic}>
                  $
                </text>
              </g>
            </g>
          ))}

        {/* cameras with googly eyes */}
        {cameras.map((cam) => {
          const [dx, dy] = DIR_DELTA[cam.direction];
          return (
            <g key={cam.id} transform={`translate(${cam.x * TILE + TILE / 2} ${cam.y * TILE + TILE / 2})`}>
              <g filter="url(#cb-sticker)" className={caught ? "cb-shake" : undefined}>
                <g transform={`rotate(${dirAngle(cam.direction)})`}>
                  <rect x={-13} y={-8} width={18} height={16} rx={3} fill="#d8dde3" stroke={INK} strokeWidth={2} />
                  <rect x={3} y={-6} width={8} height={12} rx={2} fill="#9aa3ad" stroke={INK} strokeWidth={2} />
                </g>
                {/* googly eye stays upright, pupil looks where the camera looks */}
                <circle r={6.5} fill="#fff" stroke={INK} strokeWidth={1.8} />
                <circle cx={dx * 2.8} cy={dy * 2.8} r={3} fill={INK} className="cb-pupil" />
                <circle cx={-9} cy={-9} r={2.5} fill="#ff4d3d" stroke={INK} strokeWidth={1} className="cb-rec" />
              </g>
            </g>
          );
        })}

        {/* the player — see PlayerAvatar.tsx to swap the character */}
        <g
          style={{
            transform: `translate(${player.x * TILE}px, ${player.y * TILE}px)`,
            transition: "transform 120ms linear",
          }}
        >
          <g
            filter="url(#cb-sticker)"
            style={{
              transformOrigin: `${TILE / 2}px ${TILE / 2}px`,
              transform: `scaleX(${facing === "left" ? -1 : 1}) rotate(${waddle ? 7 : -7}deg)`,
              transition: "transform 120ms",
            }}
          >
            <PlayerAvatar size={TILE} closed={waddle} caught={caught} />
          </g>
        </g>

        {(caught || won) && (
          <g transform={`translate(${W / 2} ${H / 2})`}>
            <g className="cb-burst">
              <polygon points={burst(0, 0, 150, 105, 16)} fill={caught ? "#ff5a4a" : "#ffd84a"} stroke={INK} strokeWidth={4} filter="url(#cb-sticker)" />
              <text y={10} textAnchor="middle" fontSize={40} fill="#fff" stroke={INK} strokeWidth={2} paintOrder="stroke" fontFamily={comic} letterSpacing={1}>
                {caught ? "BUSTED!" : "$$ PAYDAY $$"}
              </text>
              <text y={34} textAnchor="middle" fontSize={14} fill={INK} fontFamily={comic}>
                {caught ? "act natural. nothing to see here." : `${collected} cash stacks · ${moves} moves`}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

function Tape({ children, rotate = 0, tone }: { children: ReactNode; rotate?: number; tone?: string }) {
  return (
    <span
      className="inline-block px-3 py-0.5 shadow-sm"
      style={{
        transform: `rotate(${rotate}deg)`,
        background: tone ?? "#f1e3bf",
        color: INK,
        clipPath: "polygon(2% 0, 98% 6%, 100% 50%, 97% 100%, 3% 94%, 0 50%)",
      }}
    >
      {children}
    </span>
  );
}

function burst(cx: number, cy: number, rx: number, ry: number, spikes: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * i) / spikes;
    const k = i % 2 === 0 ? 1 : 0.72;
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return pts.join(" ");
}

const KRAFT_BG =
  "repeating-linear-gradient(90deg, rgba(0,0,0,0.035) 0 3px, transparent 3px 14px), linear-gradient(180deg, #d19a66, #c4884f)";

const CB_CSS = `
.cb-root .cb-cash { animation: cb-hop 1.3s ease-in-out infinite; }
.cb-root .cb-sack { animation: cb-sway 2s ease-in-out infinite; }
.cb-root .cb-rec { animation: cb-blink 1s steps(2) infinite; }
.cb-root .cb-pupil { animation: cb-jiggle 0.9s ease-in-out infinite; }
.cb-root .cb-cone { animation: cb-flicker 3s ease-in-out infinite; }
.cb-root .cb-shake { animation: cb-shake .15s linear infinite; }
.cb-root .cb-burst { animation: cb-pop .4s cubic-bezier(.3,1.7,.5,1) both; }
@keyframes cb-hop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
@keyframes cb-sway { 0%,100% { transform: rotate(-5deg) } 50% { transform: rotate(5deg) } }
@keyframes cb-blink { 0% { opacity: 1 } 100% { opacity: .2 } }
@keyframes cb-jiggle { 0%,100% { transform: translate(0,0) } 30% { transform: translate(.6px,-.6px) } 60% { transform: translate(-.5px,.5px) } }
@keyframes cb-flicker { 0%,100% { opacity: .75 } 45% { opacity: .9 } 50% { opacity: .6 } 55% { opacity: .9 } }
@keyframes cb-shake { 0% { transform: translate(-1px,0) } 50% { transform: translate(1px,0) } 100% { transform: translate(-1px,0) } }
@keyframes cb-pop { from { transform: scale(0) rotate(-20deg) } to { transform: scale(1) rotate(-4deg) } }
`;
