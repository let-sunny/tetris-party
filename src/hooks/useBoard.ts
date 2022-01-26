import { BOARD_HEIGHT, BOARD_WIDTH, Pieces } from './../util/constants';
import { useEffect, useState } from 'react';
import { Piece, usePiece, getRotatedShape } from './usePiece';
import { useTimer } from './useTimer';

type CellState = {
  type: keyof typeof Pieces;
  fixed: boolean;
};
const DELAY = 500;
export const useBoard = () => {
  const [grid, setGrid] = useState(getInitialGrid(BOARD_WIDTH, BOARD_HEIGHT));
  const timer = useTimer();
  const {
    generatePiece,
    updatePosition,
    rotate,
    piece: currentPiece,
    fix,
  } = usePiece();

  useEffect(() => {
    timer.start(DELAY, () => {
      const toDown = { x: 0, y: 1 };
      if (!isCollusion(grid, currentPiece, toDown)) {
        updatePosition(toDown);
      } else if (isCollusion(grid, currentPiece, { x: 0, y: 0 })) {
        // TODO:
        alert('game over');
        timer.stop();
      } else {
        fix();
      }
    });

    return () => {
      timer.stop();
    };
  }, [currentPiece]);

  useEffect(() => {
    setGrid((prev) => {
      const newGrid = prev.map((row) => {
        return row.map((cell) => {
          if (cell.fixed) return cell;
          return createDefaultCellState();
        });
      });

      const {
        shape,
        position: { x, y },
        fixed,
      } = currentPiece;

      shape.forEach((row, yIndex) => {
        row.forEach((cell, xIndex) => {
          if (cell) {
            newGrid[y + yIndex][x + xIndex] = {
              type: currentPiece.type,
              fixed,
            };
          }
        });
      });

      if (fixed) {
        generatePiece();
        return removeRow(newGrid);
      }

      return newGrid;
    });
  }, [currentPiece]);

  // keydown event handler
  useEffect(() => {
    let lock = false;
    const keyLockHandler = (e: KeyboardEvent) => {
      lock = false;
    };
    const keyHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      if (lock) return;
      lock = true;

      switch (e.code) {
        case 'ArrowLeft':
          const toLeft = { x: -1, y: 1 };
          if (!isCollusion(grid, currentPiece, toLeft)) updatePosition(toLeft);
          break;
        case 'ArrowRight':
          const toRight = { x: 1, y: 0 };
          if (!isCollusion(grid, currentPiece, { x: 1, y: 0 }))
            updatePosition(toRight);
          break;
        case 'ArrowDown':
          const toDown = { x: 0, y: 1 };
          if (!isCollusion(grid, currentPiece, toDown)) updatePosition(toDown);
          break;
        case 'ArrowUp':
          let rotatedShape = getRotatedShape(currentPiece.shape);
          let rotatedPiece = { ...currentPiece, shape: rotatedShape };
          let width = currentPiece.shape[0].length;
          let left = currentPiece.position.x;
          let right = left + width - 1;

          while (isCollusion(grid, rotatedPiece, { x: 0, y: 0 })) {
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
              break;
            }
          }

          rotate({
            x: rotatedPiece.position.x - currentPiece.position.x,
            y: 0,
          });
          break;
        case 'Space':
          let y = currentPiece.position.y;
          while (!isCollusion(grid, currentPiece, { x: 0, y })) {
            y += 1;
          }
          const toBottom = { x: 0, y: y - 1 };
          if (!isCollusion(grid, currentPiece, toBottom)) {
            updatePosition(toBottom);
          }
          break;
      }
    };
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keyup', keyLockHandler);

    return () => {
      document.removeEventListener('keydown', keyHandler);
      document.addEventListener('keyup', keyLockHandler);
    };
  });

  return {
    grid,
  };
};

const createDefaultCellState = (): CellState => ({
  type: 'NONE',
  fixed: false,
});

const getInitialGrid = (width: number, height: number) =>
  Array(height)
    .fill(0)
    .map(() => Array(width).fill(0).map(createDefaultCellState));

const isCollusion = (
  grid: CellState[][],
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
        if (!grid[dy + yIndex] || !grid[dy + yIndex][dx + xIndex]) {
          // reach the edge
          return true;
        }
        if (
          grid[dy + yIndex][dx + xIndex].type !== 'NONE' &&
          grid[dy + yIndex][dx + xIndex].fixed
        ) {
          // touch the other piece
          return true;
        }
      }
    }
  }

  return false;
};

const removeRow = (grid: CellState[][]) => {
  grid.forEach((row, yIndex) => {
    if (row.every((cell) => cell.type !== 'NONE')) {
      grid.splice(yIndex, 1);
      grid.unshift(Array(BOARD_WIDTH).fill(0).map(createDefaultCellState));
    }
  });
  return grid;
};
