import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bag } from "../game/bag";
import { COLS, ROWS, PIECES } from "../game/constants";
import { cloneMatrix, createMatrix, rotate } from "../game/utils";
import { collide, merge, sweep } from "../game/engine";
import type { Matrix, PieceType, Player } from "../game/types";

const DROP_BASE_MS = 800;

export function useTetris() {
  const [arena, setArena] = useState<Matrix>(() => createMatrix(COLS, ROWS));
  const [player, setPlayer] = useState<Player | null>(null);
  const [nextType, setNextType] = useState<PieceType>("I");
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const bagRef = useRef(new Bag());
  const isLocking = useRef(false);
  const isResetting = useRef(false);

  const raf = useRef<number | null>(null);
  const lastTime = useRef(0);
  const dropCounter = useRef(0);

  const dropStats = useRef<{ type: "none" | "soft" | "hard"; softSteps: number; hardDistance: number }>({
    type: "none",
    softSteps: 0,
    hardDistance: 0,
  });

  const interval = useMemo(
    () => Math.max(100, DROP_BASE_MS - (level - 1) * 60),
    [level]
  );

  const willSpawnCollide = useCallback((type: PieceType, a: Matrix) => {
    const m = cloneMatrix(PIECES[type]);
    const p: Player = {
      type,
      matrix: m,
      pos: { x: ((COLS / 2) | 0) - ((m[0].length / 2) | 0), y: 0 },
    };
    return collide(a, p);
  }, []);

  const spawn = useCallback((type: PieceType) => {
    const matrix = cloneMatrix(PIECES[type]);
    const p: Player = {
      type,
      matrix,
      pos: { x: ((COLS / 2) | 0) - ((matrix[0].length / 2) | 0), y: 0 },
    };
    setPlayer(p);
    dropStats.current = { type: "none", softSteps: 0, hardDistance: 0 };
  }, []);

  const reset = useCallback(() => {
    if (isResetting.current) return;
    isResetting.current = true;

    setArena(createMatrix(COLS, ROWS));
    setScore(0);
    setLines(0);
    setLevel(1);
    setPaused(false);
    setGameOver(false);

    bagRef.current = new Bag();
    isLocking.current = false;
    lastTime.current = 0;
    dropCounter.current = 0;

    const b = bagRef.current;
    const current = b.next();
    const preview = b.next();
    spawn(current);
    setNextType(preview);

    setTimeout(() => { isResetting.current = false; }, 0);
  }, [spawn]);

  const lockAndSpawn = useCallback((locked: Player) => {
    if (isLocking.current) return;
    isLocking.current = true;

    const a = arena.map(r => r.slice());
    merge(a, locked);
    const { rowsCleared, points: basePoints } = sweep(a, level);
    setArena(a);

    if (rowsCleared > 0) {
      let bonus = 0;
      if (dropStats.current.type === "hard") bonus = 2 * dropStats.current.hardDistance;
      else if (dropStats.current.type === "soft") bonus = dropStats.current.softSteps;

      setScore(s => s + basePoints + bonus);
      setLines(l => {
        const total = l + rowsCleared;
        setLevel(1 + Math.floor(total / 10));
        return total;
      });
    }

    if (willSpawnCollide(nextType, a)) {
      setGameOver(true);
      isLocking.current = false;
      return;
    }

    spawn(nextType);
    setNextType(bagRef.current.next());

    isLocking.current = false;
  }, [arena, level, nextType, spawn, willSpawnCollide]);

  const move = useCallback((dir: -1 | 1) => {
    setPlayer(prev => {
      if (!prev) return prev;
      const cand: Player = { ...prev, pos: { x: prev.pos.x + dir, y: prev.pos.y } };
      if (!collide(arena, cand)) return cand;
      return prev;
    });
  }, [arena]);

  const softDrop = useCallback(() => {
    setPlayer(prev => {
      if (!prev) return prev;
      const cand: Player = { ...prev, pos: { x: prev.pos.x, y: prev.pos.y + 1 } };
      if (!collide(arena, cand)) {
        if (dropStats.current.type !== "hard") dropStats.current.type = "soft";
        dropStats.current.softSteps += 1;
        return cand;
      }
      lockAndSpawn(prev);
      return prev;
    });
  }, [arena, lockAndSpawn]);

  const hardDrop = useCallback(() => {
    if (isLocking.current) return;
    setPlayer(prev => {
      if (!prev) return prev;
      let test: Player = { ...prev };
      let dy = 0;
      while (true) {
        const down = { ...test, pos: { x: test.pos.x, y: test.pos.y + 1 } };
        if (collide(arena, down)) break;
        test = down; dy++;
      }
      dropStats.current = { type: "hard", softSteps: 0, hardDistance: dy };
      lockAndSpawn(test);
      return test;
    });
  }, [arena, lockAndSpawn]);

  const rotateCW = useCallback((dir: -1 | 1) => {
    setPlayer(prev => {
      if (!prev) return prev;
      const rotated = rotate(prev.matrix, dir);
      const kicks = [0, 1, -1, 2, -2];
      for (const k of kicks) {
        const cand: Player = { ...prev, matrix: rotated, pos: { x: prev.pos.x + k, y: prev.pos.y } };
        if (!collide(arena, cand)) return cand;
      }
      return prev;
    });
  }, [arena]);

  const update = useCallback((time: number) => {
    if (paused || gameOver) {
      lastTime.current = time;
      raf.current = requestAnimationFrame(update);
      return;
    }
    const delta = time - lastTime.current;
    lastTime.current = time;

    dropCounter.current += delta;
    if (dropCounter.current > interval) {
      dropCounter.current = 0;
      softDrop();
    }
    raf.current = requestAnimationFrame(update);
  }, [interval, paused, gameOver, softDrop]);

  useEffect(() => { reset(); }, [reset]);

  useEffect(() => {
    raf.current = requestAnimationFrame(update);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [update]);

  useEffect(() => {
    const opts: AddEventListenerOptions = { passive: false };

    const onKey = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && active instanceof HTMLButtonElement) (active as HTMLButtonElement).blur();

      if (e.code === "Space") {
        e.preventDefault();
        if (!paused && !gameOver && !e.repeat) hardDrop();
        return;
      }

      if (e.code === "KeyP") { e.preventDefault(); if (!e.repeat && !gameOver) setPaused(p => !p); return; }
      if (e.code === "KeyR") { e.preventDefault(); if (!e.repeat) reset(); return; }

      if (paused || gameOver) return;

      if (e.code === "ArrowLeft" || e.code === "KeyA")             { e.preventDefault(); move(-1); }
      else if (e.code === "ArrowRight" || e.code === "KeyD")       { e.preventDefault(); move(1); }
      else if (e.code === "ArrowDown" || e.code === "KeyS")        { e.preventDefault(); softDrop(); }
      else if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "KeyX") { e.preventDefault(); rotateCW(1); }
      else if (e.code === "KeyZ")                                  { e.preventDefault(); rotateCW(-1); }
    };

    document.addEventListener("keydown", onKey, opts);
    return () => document.removeEventListener("keydown", onKey, opts);
  }, [move, softDrop, hardDrop, rotateCW, paused, gameOver, reset]);

  return {
    arena,
    player,
    nextType,
    score,
    lines,
    level,
    paused,
    setPaused,
    gameOver,
    reset,
  };
}
