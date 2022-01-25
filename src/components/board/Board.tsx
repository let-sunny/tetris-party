import React, { useMemo } from 'react';
import { Pieces } from '../../util/constants';
import Cell from '../cell/Cell';
import classes from './Board.module.css';

type Cell = {
  type: keyof typeof Pieces;
};

type Props = {
  grid: Cell[][];
};

const Board = ({ grid }: Props) => {
  return (
    <div className={classes.board}>
      {grid.map((row, x) =>
        row.map(({ type }, y) => (
          <div className={classes.cellContainer}>
            <Cell type={type} key={`${type}_${x}-${y}_${Date.now()}`} />
          </div>
        ))
      )}
    </div>
  );
};

export default Board;
