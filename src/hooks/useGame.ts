import { useState } from 'react';

// manage player, game state (idle, playing), leaderboard
export type GameState = 'idle' | 'playing' | 'over';
export type GameOverHandler = () => void;

export const useGame = () => {
  const [state, setState] = useState<GameState>('idle');

  const gameOver = () => {
    setState('over');
  };

  const start = () => {
    setState('playing');
  };

  return {
    gameOver,
    start,
    state,
  };
};
