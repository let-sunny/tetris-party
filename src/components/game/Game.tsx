import React, { useEffect, useState } from 'react';
import { useBoard } from '../../hooks/useBoard';
import Board from '../board/Board';

const Game = () => {
  const { grid } = useBoard();
  const [currentGrid, setCurrentGrid] = useState(grid);

  useEffect(() => {
    setCurrentGrid(grid);
  }, [grid]);

  return (
    <div>
      <h1>Game</h1>
      <Board grid={currentGrid} />
    </div>
  );
};

export default Game;
