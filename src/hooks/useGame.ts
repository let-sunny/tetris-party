import { useState } from 'react';

// manage player, game state (idle, playing), leaderboard
export type GameState = 'idle' | 'playing' | 'over';
export type GameOverHandler = () => void;

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const gameOver = () => {
    setGameState('over');
  };

  const startGame = () => {
    setGameState('playing');
  };
  return {
    gameOver,
    startGame,
    gameState,
  };
};
