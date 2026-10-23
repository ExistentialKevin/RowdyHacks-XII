# 🕵️ Heist School

**Built at RowdyHacks XII**

Heist School is a browser game that teaches Python through heist-themed puzzles. It's meant for teachers who want a simple, self-contained place for students to learn real coding and professional skills, without fighting complicated tools.

Students write **real Python** in an in-browser editor. The code runs entirely client-side through **Pyodide** (Python compiled to WebAssembly), so nothing needs to be installed and no backend runs code.

## Levels
| # | Mission | Concept |
|---|---|---|
| 1 | **The Casing** | Variables 101 (tutorial) |
| 2 | **The Camera Gauntlet** | Dodge security cameras and collect diamonds using movement commands |
| 3 | **The Inside Job** | Read an access code and store it in a variable |
| 4 | **The Vault** | Crack the cipher (coming soon) |

## Features
- In-browser Python editor (CodeMirror) with live console output
- Python runs locally via a self-hosted copy of Pyodide
- Guided tutorial overlay and an animated talking mascot for hints
- **Planning Room** workspace: a repo panel, editor, and ticket board that introduce students to git and ticket-based workflows (UI prototype)

## Tech Stack
Next.js · React · TypeScript · Tailwind CSS · Pyodide · CodeMirror

## Getting Started
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## Team
Built by [ExistentialKevin](https://github.com/ExistentialKevin), [Sa1vad0r](https://github.com/Sa1vad0r), [esteban-ai24](https://github.com/esteban-ai24), and [DnCrMn](https://github.com/DnCrMn).

## Credits
- Mascot voice (`public/sounds/peep.mp3`): Sound effect by [Nikin](https://pixabay.com/users/nikin-253338/) from [Pixabay](https://pixabay.com/)
