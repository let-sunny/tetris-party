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
    return gameState !== 'playing' ? (
      <Button name="Start" onClick={startGame} />
    ) : null;
  }, [gameState]);

  const board = useMemo(() => {
    return gameState === 'playing' ? <Board grid={currentGrid} /> : null;
  }, [currentGrid, gameState]);

  

  return (
    <>
      {board}
      {startButton}
    </>
  );
};

export default Game;
