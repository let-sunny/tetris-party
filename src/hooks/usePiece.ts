import { useState } from 'react';
import { Pieces } from './../util/constants';

export type Piece = {
  type: keyof typeof Pieces;
  shape: number[][];
  position: {
    x: number;
    y: number;
  };
  fixed: boolean;
};

export const usePiece = () => {
  const [piece, setPiece] = useState<Piece>(getPiece());

  const generatePiece = () => {
    setPiece(getPiece());
  };

  const updatePosition = ({ x, y }: { x: number; y: number }) => {
    setPiece({
      ...piece,
      position: { x: x + piece.position.x, y: y + piece.position.y },
    });
  };

  const rotate = () => {
    const { shape } = piece;
    const newShape = shape.map((_, i) => shape.map((row) => row[i]).reverse());
    setPiece({ ...piece, shape: newShape });
  };

  const fix = () => {
    setPiece({ ...piece, fixed: true });
  };

  return {
    generatePiece,
    updatePosition,
    rotate,
    piece,
    fix,
  };
};

const getPiece = () => {
  const randomType = Object.keys(Pieces)[
    Math.floor(Math.random() * (Object.keys(Pieces).length - 1)) + 1
  ] as Piece['type'];
  const randomShape = Pieces[randomType];
  const randomPosition = {
    x: Math.floor(Math.random() * (10 - randomShape[0].length)),
    y: 0,
  };
  return {
    type: randomType,
    shape: randomShape,
    position: randomPosition,
    fixed: false,
  };
};
