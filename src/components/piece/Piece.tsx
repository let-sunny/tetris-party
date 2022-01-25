import React from 'react';
import classes from './Piece.module.css';
import { Pieces } from '../../util/constants';
import Cell from '../cell/Cell';

type Props = {
  type: keyof typeof Pieces;
  shape: number[][];
};

const Piece = ({ type, shape }: Props) => {
  return (
    <div
      className={`${classes.piece} ${classes[type]}`}
      data-colum={shape[0].length}
    >
      {shape.map((row, x) =>
        row.map((cell, y) => (
          <Cell type={cell ? type : 'NONE'} key={`${type}_${x}-${y}`} />
        ))
      )}
    </div>
  );
};

export default Piece;
