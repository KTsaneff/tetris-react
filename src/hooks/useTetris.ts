import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bag } from '../game/bag';
import { COLS, ROWS, PIECES } from '../game/constants';
import { cloneMatrix, createMatrix, rotate } from "../game/utils";
import { collide, merge, sweep } from "../game/engine";
import type { Matrix, PieceType, Player } from "../game/types";

const dropIntervalBase = 800; //ms

export function useTetris(){
    const [arena, setArena] = useState<Matrix>(() => createMatrix(COLS, ROWS));
    const [player, setPlayer] = useState<Player | null>(null);
    const [nextType, setNextType] = useState<PieceType>('I');
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [level, setLevel] = useState (1);
    const [paused, setPaused] = useState(false);

    const bagRef = useRef(new Bag());
    const dropCounter = useRef(0);
    const lastTime = useRef(0);
    const raf = useRef<number | null>(null);

    const interval = useMemo(() => Math.max(100, dropIntervalBase - (level -1)*60), [level]);

    const spawn = useCallback((type: PieceType) => {
        const matrix = cloneMatrix(PIECES[type]);
        const p: Player = {
            type,
            matrix,
            pos: { x: ((COLS/2)|0) - ((matrix[0].length/2)|0), y: 0 }
        };
        setPlayer(p);
    }, []);

    const pickNext = useCallback(() => {
        const b = bagRef.current;
        const t = b.next();
        setNextType(b.peek());
        spawn(t);
    }, [spawn]);

    const reset = useCallback(() => {
        setArena(createMatrix(COLS, ROWS));
        setScore(0); setLines(0); setLevel(1); setPaused(false);
        bagRef.current = new Bag();
        dropCounter.current = 0;
        lastTime.current = 0;

        //initial figure
        const b = bagRef.current;
        const first = b.next();
        setNextType(b.peek());
        spawn(first);
    }, [spawn]);

    // movement
    const move = useCallback((dir: -1|1) => {
        setPlayer((prev) => {
            if(!prev) return prev;
            const candidate: Player = { ...prev, pos: {x: prev.pos.x + dir, y: prev.pos.y} };
            if(!collide(arena, candidate)) return candidate;
            return prev;
        });
    }, [arena]);

    const softDrop = useCallback(() => {
        setPlayer((prev) => {
            if(!prev) return prev;
            const candidate: Player = { ...prev, pos: {x: prev.pos.x, y: prev.pos.y + 1}};
            if(!collide(arena,candidate)) {
                setScore(s => s + 1);
                return candidate;
            }                

            //lock
            const a = arena.map(r => r.slice());
            merge(a, prev);
            const { rowsCleared, points } = sweep(a, level);
            setArena(a);
            setScore(s => s + points);
            if(rowsCleared){
                setLines(l => {
                    const newLines = l + rowsCleared;
                    setLevel(1 + Math.floor(newLines/10));
                    return newLines;
                });
            }
            pickNext();
            return prev; // will be replaced by spawn
        });
    }, [arena, level, pickNext]);

    const hardDrop = useCallback(() => {
        setPlayer((prev) => {
            if(!prev) return prev;
            let dy = 0;
            let test: Player = { ...prev };
            while (true){
                const t = { ...test, pos: {x: test.pos.x, y: test.pos.y + 1} };
                if(collide(arena, t)) break; else { test = t; dy++; }
            }

            //lock
            const a = arena.map(r => r.slice());
            merge(a, test);
            const { rowsCleared, points } = sweep(a, level);
            setArena(a);
            setScore(s => s + points + 2* dy);
            if(rowsCleared){
                setLines(l => {
                    const newLines = l + rowsCleared;
                    setLevel(1 + Math.floor(newLines/10));
                    return newLines;
                });
            }
            pickNext();
            return test; //not important, it will be changed on spawn()
        });
    }, [arena, level, pickNext]);

    const rotateCW = useCallback((dir: -1|1) => {
        setPlayer((prev) => {
            if(!prev) return prev;
            const rotated = rotate(prev.matrix, dir);

            // wall kicks
            const kicks = [0, 1, -1, 2, -2];
            for(const k of kicks){
                const candidate: Player = { ...prev, matrix: rotated, pos: {x: prev.pos.x + k, y: prev.pos.y} };
                if(!collide(arena, candidate)) return candidate;
            }
            return prev;
        });
    }, [arena]);

    // main loop
    const update = useCallback((time: number) => {
        if(paused) {lastTime.current = time; raf.current = requestAnimationFrame(update); return;}
        const delta = time - lastTime.current;
        lastTime.current = time;
        dropCounter.current += delta;
        if (dropCounter.current > interval){
            dropCounter.current = 0;
            softDrop();
        }
        raf.current = requestAnimationFrame(update);
    }, [interval, paused, softDrop]);

    useEffect(() => {reset(); }, [reset]);

    useEffect(() => {
        raf.current = requestAnimationFrame(update);
        return () => {
           if (raf.current !== null) cancelAnimationFrame(raf.current);
        } 
    }, [update]);

    // keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if(e.code === 'KeyP') { setPaused(p =>!p); return; }
            if(e.code === 'KeyR') { reset(); return; }
            if(paused) return;

            if(['ArrowLeft', 'KeyA'].includes(e.code)) { e.preventDefault(); move(-1); }
            else if(['ArrowRight', 'KeyD'].includes(e.code)) { e.preventDefault(); move(1); }
            else if(['ArrowDown', 'KeyS'].includes(e.code)) { e.preventDefault(); softDrop(); }
            else if(['Space'].includes(e.code)) { e.preventDefault(); hardDrop(); }
            else if(['ArrowUp', 'KeyW', 'KeyX'].includes(e.code)) { e.preventDefault(); rotateCW(1); }
            else if(['KeyZ'].includes(e.code)) {e.preventDefault(); rotateCW(-1); }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [move, softDrop, hardDrop, rotateCW, paused, reset]);

    // game over detection on spawn()
    useEffect(() => {
        if(!player) return;
        if(collide(arena, player)){
            //Game Over -> reset
            setPaused(true);
        }
    }, [player, arena]);

    return {
        arena, player, nextType, score, lines, level, paused, setPaused, reset,
    };
}