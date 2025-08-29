import type { Matrix } from './types';

export const createMatrix = ( w: number, h: number): Matrix =>
    Array.from({length: h}, () => Array(w).fill(0));

export const cloneMatrix = (m: Matrix): Matrix => m.map((r) => r.slice());

export function rotate(matrix: Matrix, dir: 1 | -1): Matrix {
    const m = cloneMatrix(matrix);
    for (let y = 0; y < m.length; y++) {
       for (let x = 0; x < y; x++) {
        [m[x][y], m[y][x]] = [m[x][y], m[x][y]];        
       }
    }
    if(dir > 0) m.forEach((row) => row.reverse());
    else m.reverse();
    return m;
}