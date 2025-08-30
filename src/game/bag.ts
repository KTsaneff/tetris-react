import { PIECES } from './constants';
import type { PieceType } from './types';

export class Bag {
    private queue: PieceType[] = [];

    private refill() {
        const types = Object.keys(PIECES) as PieceType[];
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        this.queue.push(...types);
    }

    next(): PieceType {
        if(this.queue.length === 0) this.refill();
        return this.queue.shift()!;
    }

    peek(): PieceType {
        if(this.queue.length === 0) this.refill();
        return this.queue[0];
    }
}

