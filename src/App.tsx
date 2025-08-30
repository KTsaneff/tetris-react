import './styles.css';
import BoardCanvas from './components/BoardCanvas';
import NextCanvas from './components/NextCanvas';
import { useTetris } from './hooks/useTetris';

export default function App(){
  const {arena, player, nextType, score, lines, level, paused, setPaused, reset, } = useTetris();

  return(
    <div className="app">
      <BoardCanvas arena={arena} player={player} />

      <aside className="panel">
        <h2 style={{marginTop:0}}>Tetris</h2>

        <div className="stats">
            <label>Points:</label><div>{score}</div>
            <label>Level:</label><div>{level}</div>
            <label>Rows:</label><div>{lines}</div>
            <label>Status:</label><div>{paused? 'Paused (P)': 'Active'}</div>
        </div>

        <div className="btns">
            <button className="primary" onClick={reset}>New Game</button>
            <button onClick={()=> setPaused(p=>!p)}>{paused? 'Continue' : 'Pause'}</button>
        </div>

        <div className="mini">
          <h3>Next Block</h3>
          <NextCanvas type={nextType} />
        </div>

        <p style={{color:'var(--muted)', fontSize:12}}>
            Keys: 
              • ←/→ movement 
              • ↓ drop 
              • Z/X/↑ turn 
              • Space hard drop 
              • P pause 
              • R restart
        </p>
      </aside>
    </div>
  );
}