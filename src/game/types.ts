export type Matrix = number[][];
export type PieceType = 'I'|'J'|'L'|'O'|'S'|'T'|'Z';

export interface Player {
    pos: { x: number; y: number};
    matrix: Matrix;
    type: PieceType;
}