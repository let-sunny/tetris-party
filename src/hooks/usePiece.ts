import { useState } from 'react';

export type PieceType = keyof typeof PieceShapes;
export type Piece = {
  type: PieceType;
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

  const rotate = ({ x, y }: { x: number; y: number }) => {
    const { shape } = piece;
    const newShape = getRotatedShape(shape);
    setPiece({
      ...piece,
      shape: newShape,
      position: { x: x + piece.position.x, y: y + piece.position.y },
    });
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
  const randomType = Object.keys(PieceShapes)[
    Math.floor(Math.random() * (Object.keys(PieceShapes).length - 1)) + 1
  ] as Piece['type'];
  const randomShape = PieceShapes[randomType];
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

export const getRotatedShape = (shape: number[][]) => {
  return shape.map((_, i) => shape.map((row) => row[i]).reverse());
};

// TODO: rotation 미리 만들어두기
export const PieceShapes = {
  NONE: [[0]],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0],
  ],
  L: [
    [1, 1, 1],
    [1, 0, 0],
    [0, 0, 0],
  ],
  J: [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 0],
  ],
  I: [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};
