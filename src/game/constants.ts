import type { Matrix, PieceType } from "./types";

export const COLS = 10;
export const ROWS = 20;
export const CELL = 32; //pixels

export const COLORS: Record<number,string> = {
    0: 'transparent',
    1: '#36bae8', // I
    2: '#f19f1f', // L
    3: '#1e8ff2', // J
    4: '#e7d81e', // O
    5: '#3bd270', // S
    6: '#b348f0', // T
    7: '#f14c5e', // Z
    8: 'rgba(255,255,255,.15)', // ghost (for the upcoming step)
};

export const PIECES: Record<PieceType, Matrix> = {
    I: [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    J: [
        [3,0,0],
        [3,3,3],
        [0,0,0],
    ],
    L: [
        [0,0,2],
        [2,2,2],
        [0,0,0],
    ],
    O: [
        [4,4],
        [4,4],
    ],
    S: [
        [0,5,5],
        [5,5,0],
        [0,0,0],
    ],
    T: [
        [0,6,0],
        [6,6,6],
        [0,0,0],
    ],
    Z: [
        [7,7,0],
        [0,7,7],
        [0,0,0],
    ],
};

export const SCORE_BY_ROWS = [0, 100, 300, 500, 800];