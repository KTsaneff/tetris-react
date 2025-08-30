import { useEffect, useRef } from "react";
import { CELL, COLORS, PIECES } from "../game/constants";
import type { PieceType } from "../game/types";

export default function NextCanvas({ type }: { type: PieceType}){
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current!;
        const scale = 0.75;
        const size = 4*CELL*scale;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.clearRect(0,0,size,size);
        const m = PIECES[type];

        const drawCell = (x: number, y: number, val: number) => {
            if(!val) return;
            ctx.save();
            const c = CELL*scale;
            ctx.translate(x*c, y*c);
            ctx.fillStyle = COLORS[val];
            const r = 4;
            const w = c-2, h = c-2; const ox = 1, oy =1;
            ctx.beginPath();
            ctx.moveTo(ox+r, oy);
            ctx.arcTo(ox+w, oy,ox+w,oy+h,r);
            ctx.arcTo(ox+w,oy+h,ox,oy+h,r);
            ctx.arcTo(ox,oy+h,ox,oy,r);
            ctx.arcTo(ox,oy,ox+w,oy,r);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        const offX = Math.floor((4 - m[0].length)/2);
        const offY = Math.floor((4 - m.length)/2);
        for(let y=0; y<m.length; y++){
            for(let x =0; x<m[y].length; x++){
                drawCell(x+offX, y+offY, m[y][x]);
            }
        }
    }, [type]);

    return <canvas ref={ref}/>;
}