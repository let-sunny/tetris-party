import React from 'react';
import classes from './Cell.module.css';
import { PieceType } from '../../hooks/usePiece';

type Props = {
  type: PieceType;
};

const Cell = ({ type }: Props) => {
  return <div className={`${classes.cell} ${classes[type]}`} />;
};

export default Cell;
