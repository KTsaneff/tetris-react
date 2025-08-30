# Tetris (React + TypeScript + Vite)

A clean, keyboard-friendly Tetris built with **React**, **TypeScript**, and **Vite**.  
It supports classic controls, next-piece preview, level speed-up, line-clear scoring, and robust input handling.

<div align="center">
  
**Live demo:** (after publishing) `https://ktsaneff.github.io/tetris-react/`

</div>

---

## ✨ Features

- ⚡️ Smooth gameplay loop with `requestAnimationFrame`
- ⌨️ Keyboard-first controls (arrow keys / WASD, Z/X/↑ rotate, Space hard drop)
- 🔮 Next-piece preview (7-bag randomizer)
- 🧮 Scoring only on line clears, with **soft/hard-drop bonuses**
- ⬆️ Level increases every 10 cleared rows; falling speed scales by level
- ⛔️ Solid game-over detection & state (input locked except **R** / New Game)
- 🧊 Input hardening (no double activations, Space won’t “click” buttons)
- 🧱 Simple wall-kicks for rotation near borders
- 🧹 Clean, responsive UI (canvas board + side panel)

---

## 🎮 Controls

- **← / →** or **A / D** — move left / right  
- **↓** or **S** — soft drop  
- **Space** — hard drop  
- **↑ / W / X** — rotate clockwise  
- **Z** — rotate counter-clockwise  
- **P** — pause / resume  
- **R** — restart (New Game)

> Buttons are mouse-clickable too, but they’re deliberately unfocusable so Space never triggers them.

---

## 🧠 Gameplay rules & scoring

- **7-bag** randomizer (each set of I, J, L, O, S, T, Z shuffled then queued).
- **Line-clear points:**  
  `SCORE_BY_ROWS = [0, 100, 300, 500, 800]` and each award is multiplied by the **current level**.
- **Drop bonuses (only if at least one line was cleared by the lock):**
  - **Soft drop:** `+1` per cell descended via soft drop.
  - **Hard drop:** `+2` per cell descended via hard drop.
- **Level up:** every **10** cleared lines (`level = 1 + floor(cleared / 10)`).
- **Speed:** fall interval = `max(100ms, 800ms - (level - 1) * 60ms)`.
- **Game Over:** after a piece locks, if the *preview* piece would collide at the spawn position on the updated board, the game enters **Game Over**. Only **R** (restart) and **New Game** work.

---

## 🗂️ Project structure

