import React, { useEffect, useMemo, useState } from 'react';
import { useBoard } from '../../hooks/useBoard';
import { useGame } from '../../hooks/useGame';
import Board from '../board/Board';
import Button from '../button/Button';

const Game = () => {
  const { gameOver, startGame, gameState } = useGame();
  const { grid, setBoard } = useBoard();
  const [currentGrid, setCurrentGrid] = useState(grid);

  useEffect(() => {
    setCurrentGrid(grid);
  }, [grid]);

  useEffect(() => {
    if (gameState === 'playing') {
      setBoard({
        state: gameState,
        gameOver,
      });
    }
  }, [gameState]);

  const startButton = useMemo(() => {
    if (gameState !== 'playing')
      return <Button name="Start" onClick={startGame} />;
    return null;
  }, [gameState]);

  return (
    <div>
      <h1>Game</h1>
      {gameState === 'playing' && <Board grid={currentGrid} />}
      {startButton}
    </div>
  );
};

export default Game;
