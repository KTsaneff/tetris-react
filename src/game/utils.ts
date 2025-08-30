import type { Matrix } from './types';

export const createMatrix = ( w: number, h: number): Matrix =>
    Array.from({length: h}, () => Array(w).fill(0));

export const cloneMatrix = (m: Matrix): Matrix => m.map((r) => r.slice());

export function rotate(matrix: number[][], dir: 1 | -1): number[][] {
    const h = matrix.length;
    const w = matrix[0].length;
    const res = Array.from({ length: w }, () => Array(h).fill(0));
    
    for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (dir > 0) res[x][h - 1 - y] = matrix[y][x];   // clockwise
      else          res[w - 1 - x][y] = matrix[y][x];   // counter-clockwise
    }
  }
  return res;
}