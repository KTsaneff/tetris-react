import { useEffect, useRef } from "react";
import { CELL, COLS, COLORS, ROWS } from '../game/constants';
import type { Matrix, Player } from "../game/types";

function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, val: number){
    if(!val) return;
    ctx.save();
    ctx.translate(x*CELL, y*CELL);
    ctx.fillStyle = val ===8 ? COLORS[8] : COLORS[val];
    const r = 6;
    const w = CELL-2, h = CELL-2;
    const ox = 1, oy = 1;
    ctx.beginPath();
    ctx.moveTo(ox+r, oy);
    ctx.arcTo(ox+w, oy, ox+w, oy+h, r);
    ctx.arcTo(ox+w, oy+h, ox, oy+h, r);
    ctx.arcTo(ox, oy+h, ox, oy, r);
    ctx.arcTo(ox, oy, ox+w, oy, r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawMatrix(ctx: CanvasRenderingContext2D, m: Matrix, ox: number, oy: number){
    for(let y = 0; y < m.length; y++){
        for(let x =0; x < m[y].length; x++){
            const v = m[y][x];
            if(v) drawCell(ctx, x+ox, y+oy, v)
        }
    }
}

export default function BoardCanvas({arena, player} : {arena: Matrix; player: Player | null}){
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current!;
        canvas.width = COLS * CELL;
        canvas.height = ROWS * CELL;
        const ctx = canvas.getContext('2d')!;

        // background
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.fillStyle = '#0a1221';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        
        // net
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = '#1a2742';
        for(let x=0; x<=COLS; x++){
            ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, ROWS*CELL); ctx.stroke();
        }
        for(let y =0; y <= ROWS; y++){
            ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(COLS*CELL, y*CELL); ctx.stroke();
        }
        ctx.globalAlpha = 1;

        drawMatrix(ctx, arena, 0, 0);
        if(player) drawMatrix(ctx, player.matrix, player.pos.x, player.pos.y);
    }, [arena, player]);

    return(
        <div className="boardWrap" style={{borderRadius:16, boxShadow:'0 20px 50px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.03)'}}>
            <canvas ref={ref} aria-label="Playground"/>
            <div className="gridOverlay" style={{ ['--cell' as any]: `${CELL}px` }} />
        </div>
    );
}