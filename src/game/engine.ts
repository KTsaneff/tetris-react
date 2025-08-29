import { SCORE_BY_ROWS } from "./constants";
import type { Matrix, Player } from "./types";

export function collide(arena: Matrix, player: Player): boolean {
    const { matrix: m, pos: o } = player;
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if(m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x] !== 0)){
                return true;
            }
        }        
    }
    return false;
}

export function merge(arena: Matrix, player: Player) {
    player.matrix.forEach((row, y) => {
        row.forEach((val,x) => {
            if(val !== 0) arena[y + player.pos.y][x + player.pos.x] = val;
        });
    });
}

export function sweep(arena: Matrix, level: number){
    let rowsCleared = 0;
    outer: for (let y = arena.length -1; y >= 0; y--){
        for(let x = 0; x < arena[y].length; x++){
            if(arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;
        rowsCleared++;
    }
    const points = SCORE_BY_ROWS[rowsCleared] * level;
    return { rowsCleared, points };
}