"use client";

// ============================================================================
// 🐦 PLAYER CHARACTER MODEL — UPDATE THE CHARACTER HERE
// ----------------------------------------------------------------------------
// Every board theme (classic, night-vault, blueprint, cardboard) draws the
// player through this one component, so this is the only place to change it.
// (The classic theme shows its "P" tile until PLAYER_SPRITE is set.)
//
// To use a real sprite instead of the placeholder:
//   1. Drop your images in /public/game/ (e.g. /public/game/player-open.png).
//   2. Set PLAYER_SPRITE below to their paths. `closed` is an optional second
//      frame used for the waddle animation and the "caught" face — set it to
//      the same image as `open` if you only have one.
//   3. Pixel art? leave `pixelated: true` so it stays crisp when scaled.
//
// Leave PLAYER_SPRITE as null to keep the placeholder character drawn below.
//
// Example (the mascot sprites already in the repo):
//   export const PLAYER_SPRITE = {
//     open: "/mascot/lil-open.png",
//     closed: "/mascot/lil-closed.png",
//     pixelated: true,
//   };
// ============================================================================
export const PLAYER_SPRITE: { open: string; closed?: string; pixelated?: boolean } | null = null;

interface PlayerAvatarProps {
  /** Width/height of the square the character is drawn into, in px. */
  size: number;
  /** Alternate frame: used for the waddle step and when the player is caught. */
  closed?: boolean;
  /** Player has been spotted — placeholder shows a startled face. */
  caught?: boolean;
}

/**
 * Renders the player as a self-contained <svg>, so it works both inside the
 * SVG boards and inside the HTML grid of the classic board.
 */
export default function PlayerAvatar({ size, closed = false, caught = false }: PlayerAvatarProps) {
  if (PLAYER_SPRITE) {
    const href = closed ? (PLAYER_SPRITE.closed ?? PLAYER_SPRITE.open) : PLAYER_SPRITE.open;
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" overflow="visible">
        <image
          href={href}
          x={2}
          y={0}
          width={36}
          height={40}
          preserveAspectRatio="xMidYMid meet"
          style={{ imageRendering: PLAYER_SPRITE.pixelated ? "pixelated" : "auto" }}
        />
      </svg>
    );
  }

  // --- Placeholder character: a mint "sneak-block" wearing a robber mask ---
  // (matches the mint player square from the level mockup)
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" overflow="visible">
      {/* body */}
      <rect x={6} y={6} width={28} height={28} rx={6} fill="#71F6D0" stroke="#0d1117" strokeWidth={2} />
      {/* robber mask band */}
      <rect x={6} y={13} width={28} height={9} fill="#0d1117" />
      <path d="M34 15 l5 -3 l-1 5 l2 3 l-6 -1z" fill="#0d1117" />
      {/* eyes */}
      {caught ? (
        <>
          <circle cx={15} cy={17.5} r={3} fill="#fff" />
          <circle cx={25} cy={17.5} r={3} fill="#fff" />
          <circle cx={15} cy={17.5} r={1.2} fill="#0d1117" />
          <circle cx={25} cy={17.5} r={1.2} fill="#0d1117" />
        </>
      ) : closed ? (
        <>
          <rect x={12} y={17} width={6} height={1.8} rx={0.9} fill="#71F6D0" />
          <rect x={22} y={17} width={6} height={1.8} rx={0.9} fill="#71F6D0" />
        </>
      ) : (
        <>
          <rect x={13} y={15} width={4} height={5} rx={1} fill="#71F6D0" />
          <rect x={23} y={15} width={4} height={5} rx={1} fill="#71F6D0" />
        </>
      )}
      {/* mouth */}
      {caught ? (
        <ellipse cx={20} cy={28} rx={3} ry={2.5} fill="#0d1117" />
      ) : (
        <path d="M16 27 q4 3 8 0" stroke="#0d1117" strokeWidth={2} fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
