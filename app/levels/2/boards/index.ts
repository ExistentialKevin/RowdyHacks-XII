import type { ComponentType } from "react";
import BlueprintBoard from "./BlueprintBoard";
import CardboardBoard from "./CardboardBoard";
import ClassicBoard from "./ClassicBoard";
import NightVaultBoard from "./NightVaultBoard";
import type { HeistBoardProps } from "./shared";

export const BOARD_THEMES = {
  classic: { label: "Classic", Board: ClassicBoard }, // the original level 2 board
  "night-vault": { label: "Night Vault", Board: NightVaultBoard }, // dark slate, guards w/ cones (closest to mockup)
  blueprint: { label: "Blueprint", Board: BlueprintBoard }, // hand-drawn heist plan
  cardboard: { label: "Cardboard", Board: CardboardBoard }, // sticker / cardboard-box style
} satisfies Record<string, { label: string; Board: ComponentType<HeistBoardProps> }>;

export type BoardTheme = keyof typeof BOARD_THEMES;

// ============================================================================
// 🎨 BOARD THEME SWITCH — change this one line to change the level 2 board.
//    Options: "classic" | "night-vault" | "blueprint" | "cardboard"
// ============================================================================
export const BOARD_THEME: BoardTheme = "night-vault";

// Set to true to show theme buttons above the board (handy while comparing
// themes in dev). When false, BOARD_THEME above is the only thing that's used.
export const SHOW_THEME_PICKER = false;

export type { HeistBoardProps } from "./shared";
