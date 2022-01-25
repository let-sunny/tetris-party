import React from 'react';
import { Pieces } from '../../util/constants';
import classes from './Cell.module.css';

type Props = {
  type: keyof typeof Pieces;
};

const Cell = ({ type }: Props) => {
  return <div className={`${classes.cell} ${classes[type]}`} />;
};

export default Cell;
