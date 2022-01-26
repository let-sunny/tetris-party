import React, { useMemo } from 'react';
import classes from './Board.module.css';
import Cell from '../cell/Cell';
import { CellState } from '../../hooks/useBoard';

type Props = {
  grid: CellState[][];
};

const Board = ({ grid }: Props) => {
  return (
    <div className={classes.board}>
      {grid.map((row, x) =>
        row.map(({ type, fixed }, y) => (
          <div
            className={classes.cellContainer}
            key={`${type}-${fixed}_${x}-${y}}`}
          >
            <Cell type={type} />
          </div>
        ))
      )}
    </div>
  );
};

export default Board;
