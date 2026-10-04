// Placeholder data for the Workspace page. No logic is wired up yet —
// these values only exist so the UI has something realistic to render.
// The sample project is a small pygame game: "Vault Runner".

export type FileStatus = "modified" | "added" | null;

export type RepoEntry =
  | { kind: "folder"; name: string; depth: number }
  | { kind: "file"; name: string; depth: number; status: FileStatus; active?: boolean };

export const repo = {
  owner: "team-07",
  name: "vault-runner",
  branch: "main",
  ahead: 1,
  behind: 0,
  changedFiles: 2,
};

export const repoTree: RepoEntry[] = [
  { kind: "folder", name: "assets", depth: 0 },
  { kind: "folder", name: "sprites", depth: 1 },
  { kind: "file", name: "player.png", depth: 2, status: null },
  { kind: "file", name: "guard.png", depth: 2, status: null },
  { kind: "file", name: "coin.png", depth: 2, status: "added" },
  { kind: "folder", name: "sounds", depth: 1 },
  { kind: "file", name: "alarm.wav", depth: 2, status: null },
  { kind: "folder", name: "levels", depth: 1 },
  { kind: "file", name: "level1.txt", depth: 2, status: null },
  { kind: "folder", name: "game", depth: 0 },
  { kind: "file", name: "__init__.py", depth: 1, status: null },
  { kind: "file", name: "player.py", depth: 1, status: null },
  { kind: "file", name: "enemy.py", depth: 1, status: null },
  { kind: "file", name: "level.py", depth: 1, status: null },
  { kind: "file", name: "main.py", depth: 0, status: "modified", active: true },
  { kind: "file", name: "settings.py", depth: 0, status: null },
  { kind: "file", name: "requirements.txt", depth: 0, status: null },
  { kind: "file", name: "README.md", depth: 0, status: null },
];

export const openTabs = [
  { name: "main.py", active: true },
  { name: "player.py", active: false },
  { name: "enemy.py", active: false },
];

// Shown in the editor with simple display-only syntax colouring.
export const code = `import pygame
from settings import WIDTH, HEIGHT, FPS
from game.player import Player
from game.level import Level

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Vault Runner")
clock = pygame.time.Clock()

level = Level("assets/levels/level1.txt")
player = Player(level.start)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # move, then draw everything
    player.update(pygame.key.get_pressed(), level)
    level.draw(screen)
    player.draw(screen)
    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()`;

export const consoleLines = [
  { text: "$ python main.py", tone: "muted" },
  { text: "pygame 2.6.0 (SDL 2.28.4, Python 3.12.4)", tone: "muted" },
  { text: "Hello from the pygame community. https://www.pygame.org/contribute.html", tone: "muted" },
  { text: "Loaded level1.txt (16x12 tiles, 3 guards, 5 coins)", tone: "ok" },
  { text: "Running at 60 FPS", tone: "ok" },
] as const;

export const gameHud = { title: "Vault Runner", score: 120, coins: "2 / 5", lives: 3, fps: 60 };

export type TicketType = "bug" | "feature" | "art" | "docs";
export type TicketStatus = "in_progress" | "todo" | "done";

export type Ticket = {
  id: string;
  title: string;
  type: TicketType;
  status: TicketStatus;
  assignee?: string; // initials
  link?: string; // file:line the ticket is tied to
};

export const tickets: Ticket[] = [
  { id: "HS-12", title: "Guard vision cone ignores walls", type: "bug", status: "in_progress", assignee: "MR", link: "game/enemy.py:42" },
  { id: "HS-11", title: "Play alarm.wav when a guard spots you", type: "feature", status: "todo", assignee: "JG" },
  { id: "HS-10", title: "Coin pickup animation", type: "art", status: "todo" },
  { id: "HS-09", title: "Pause menu on ESC", type: "feature", status: "todo" },
  { id: "HS-08", title: "Player sprite flickers when moving diagonally", type: "bug", status: "todo" },
  { id: "HS-07", title: "README: how to pip install pygame", type: "docs", status: "done", assignee: "SA" },
];
