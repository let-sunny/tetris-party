import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { playerState, gameState } from './../store/widget';

import { Piece, usePiece, getRotatedShape, PieceType } from './usePiece';
import { useTimer } from './useTimer';

export type CellState = {
  type: PieceType;
  fixed: boolean;
};

export const useBoard = () => {
  // global state
  const [player, setPlayer] = useRecoilState(playerState);
  const [state, setState] = useRecoilState(gameState); // for all players
  // custom hook
  const timer = useTimer();
  const { generatePiece, updatePosition, rotate, piece, fix } = usePiece();
  // local state
  const [delay, setDelay] = useState(550);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(getInitialGrid(BOARD_WIDTH, BOARD_HEIGHT));

  useEffect(() => {
    if (state === 'playing') {
      timer.start(delay, () => {
        if (player) {
          setPlayer({
            ...player,
            score,
            // board, TODO: screen share
          });
        }

        const toDown = { x: 0, y: 1 };
        if (!isCollusion(board, piece, toDown)) {
          updatePosition(toDown);
        } else if (isCollusion(board, piece, { x: 0, y: 0 })) {
          timer.stop();
          setState('done');
        } else {
          fix();
        }
      });
    }

    return () => {
      timer.stop();
    };
  }, [piece, state, delay]);

  useEffect(() => {
    setBoard((prev) => {
      const newBoard = prev.map((row) => {
        return row.map((cell) => {
          if (cell.fixed) return cell;
          return createDefaultCellState();
        });
      });

      const {
        shape,
        position: { x, y },
        fixed,
      } = piece;

      shape.forEach((row, yIndex) => {
        row.forEach((cell, xIndex) => {
          if (cell) {
            newBoard[y + yIndex][x + xIndex] = {
              type: piece.type,
              fixed,
            };
          }
        });
      });

      if (fixed) {
        generatePiece();

        const [removed, score] = removeRow(newBoard);
        if (score) {
          setScore((prev) => prev + score);
          if (delay > 200) {
            setDelay(Math.floor(delay * 0.95));
          }
        }
        return removed;
      }

      return newBoard;
    });
  }, [piece]);

  // keydown event handler
  useEffect(() => {
    if (state !== 'playing') return;
    const keyHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.code) {
        case 'ArrowLeft': {
          const toLeft = { x: -1, y: 1 };
          if (!isCollusion(board, piece, toLeft)) updatePosition(toLeft);
          break;
        }
        case 'ArrowRight': {
          const toRight = { x: 1, y: 0 };
          if (!isCollusion(board, piece, { x: 1, y: 0 }))
            updatePosition(toRight);
          break;
        }
        case 'ArrowDown': {
          const toDown = { x: 0, y: 1 };
          if (!isCollusion(board, piece, toDown)) updatePosition(toDown);
          break;
        }
        case 'ArrowUp': {
          const rotatedShape = getRotatedShape(piece.shape);
          let rotatedPiece = { ...piece, shape: rotatedShape };
          const width = piece.shape[0].length;
          const left = piece.position.x;
          const right = left + width - 1;

          while (isCollusion(board, rotatedPiece, { x: 0, y: 0 })) {
            if (right < BOARD_WIDTH - 1) {
              // reach the right edge
              rotatedPiece = {
                ...rotatedPiece,
                position: {
                  x: rotatedPiece.position.x + 1,
                  y: rotatedPiece.position.y,
                },
              };
            } else {
              // reach the left edge
              rotatedPiece = {
                ...rotatedPiece,
                position: {
                  x: rotatedPiece.position.x - 1,
                  y: rotatedPiece.position.y,
                },
              };
            }

            if (
              rotatedPiece.position.x > BOARD_WIDTH - 1 ||
              rotatedPiece.position.x < 0
            ) {
              // collision with the other
              return;
            }
          }

          rotate({
            x: rotatedPiece.position.x - piece.position.x,
            y: 0,
          });
          break;
        }
        case 'Space': {
          let y = 0;
          while (!isCollusion(board, piece, { x: 0, y })) {
            y += 1;
          }
          const toBottom = { x: 0, y: y - 1 };
          if (!isCollusion(board, piece, toBottom)) {
            updatePosition(toBottom);
          }
          break;
        }
      }
    };

    let timer: NodeJS.Timeout | null = null;
    const throttlingKeyboardHandler = (e: KeyboardEvent) => {
      if (!timer) {
        keyHandler(e);
        timer = setTimeout(() => {
          timer = null;
        }, 100);
      }
    };
    document.addEventListener('keydown', throttlingKeyboardHandler);

    return () => {
      document.removeEventListener('keydown', throttlingKeyboardHandler);
    };
  }, [piece, state]);

  return {
    board,
  };
};

// helper
const createDefaultCellState = (): CellState => ({
  type: 'NONE',
  fixed: false,
});

const getInitialGrid = (width: number, height: number) =>
  Array(height)
    .fill(0)
    .map(() => Array(width).fill(0).map(createDefaultCellState));

const isCollusion = (
  board: CellState[][],
  piece: Piece,
  move: { x: number; y: number }
) => {
  const {
    shape,
    position: { x, y },
  } = piece;
  const dx = move.x + x;
  const dy = move.y + y;

  for (let yIndex = 0; yIndex < shape.length; yIndex++) {
    for (let xIndex = 0; xIndex < shape[yIndex].length; xIndex++) {
      const cell = shape[yIndex][xIndex];
      if (cell) {
        if (!board[dy + yIndex] || !board[dy + yIndex][dx + xIndex]) {
          // reach the edge
          return true;
        }
        if (
          board[dy + yIndex][dx + xIndex].type !== 'NONE' &&
          board[dy + yIndex][dx + xIndex].fixed
        ) {
          // touch the other piece
          return true;
        }
      }
    }
  }

  return false;
};

const removeRow = (board: CellState[][]): [CellState[][], number] => {
  let count = 0;
  board.forEach((row, yIndex) => {
    if (row.every((cell) => cell.type !== 'NONE')) {
      board.splice(yIndex, 1);
      board.unshift(Array(BOARD_WIDTH).fill(0).map(createDefaultCellState));
      count += 1;
    }
  });
  return [board, getScore(count)];
};

const getScore = (removedRowCount: number) => {
  // 1 cell = 1 point
  // and multiply by the number of removed rows
  return removedRowCount * BOARD_WIDTH * removedRowCount;
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 23;
