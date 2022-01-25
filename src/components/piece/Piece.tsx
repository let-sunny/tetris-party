import React from 'react';
import classes from './Piece.module.css';

console.log(classes);
type Props = {};

const Piece = (props: Props) => {
  return (
    <div className={classes.piece}>
      <h1>Piece</h1>
    </div>
  );
};

export default Piece;
