import { useEffect, useRef, useState, useCallback } from "react";
import "./styles.css";
import BoardCanvas from "./components/BoardCanvas";
import NextCanvas from "./components/NextCanvas";
import { useTetris } from "./hooks/useTetris";

export default function App() {
  const { arena, player, nextType, score, lines, level, paused, setPaused, gameOver, reset } = useTetris();

  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => { shellRef.current?.focus(); }, []);
  useEffect(() => { shellRef.current?.focus(); }, [paused, gameOver]);

  const [btnLock, setBtnLock] = useState(false);
  const withBtnLock = useCallback((fn: () => void) => () => {
    if (btnLock) return;
    setBtnLock(true);
    fn();
    setTimeout(() => setBtnLock(false), 150);
  }, [btnLock]);

  const noFocusOnMouse = { onMouseDown: (e: React.MouseEvent) => e.preventDefault() };

  return (
    <div
      ref={shellRef}
      tabIndex={0}
      className="app"
      onClick={() => shellRef.current?.focus()}
    >
      <BoardCanvas arena={arena} player={player} />

      <aside className="panel">
        <h2 style={{ marginTop: 0 }}>Tetris</h2>

        <div className="stats">
          <label>Points:</label><div>{score}</div>
          <label>Level:</label><div>{level}</div>
          <label>Rows:</label><div>{lines}</div>
          <label>Status:</label>
          <div>
            {gameOver ? "Game Over" : paused ? "Paused (P)" : "Active"}
          </div>
        </div>

        <div className="btns">
          <button
            type="button"
            className="primary"
            {...noFocusOnMouse}
            tabIndex={-1}
            onKeyDown={(e) => e.preventDefault()}
            onClick={withBtnLock(reset)}
            disabled={btnLock}
          >
            {gameOver ? "New Game" : "New Game"}
          </button>
          <button
            type="button"
            {...noFocusOnMouse}
            tabIndex={-1}
            onKeyDown={(e) => e.preventDefault()}
            onClick={withBtnLock(() => setPaused(p => !p))}
            disabled={btnLock || gameOver}
          >
            {paused ? "Continue" : "Pause"}
          </button>
        </div>

        <div className="mini">
          <h3>Next Block</h3>
          <NextCanvas type={nextType} />
        </div>

        <p style={{ color: "var(--muted)", fontSize: 12 }}>
          Keys: • ←/→ movement • ↓ drop • Z/X/↑ turn • Space hard drop • P pause • R restart
        </p>
      </aside>
    </div>
  );
}
