import { GameState } from '../../type';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { playerState } from './../store/widget';
import { Piece, usePiece, getRotatedShape, PieceType } from './usePiece';
import { useTimer } from './useTimer';

export type CellState = {
  type: PieceType;
  fixed: boolean;
};
type BoardController = {
  state: GameState;
  gameOver: () => void;
};

export const useBoard = () => {
  const [player, setPlayer] = useRecoilState(playerState);
  const [grid, setGrid] = useState(getInitialGrid(BOARD_WIDTH, BOARD_HEIGHT));
  const [score, setScore] = useState(0);
  const [boardController, setBoardController] =
    useState<BoardController | null>(null);
  const [delay, setDelay] = useState(500);
  const timer = useTimer();
  const {
    generatePiece,
    updatePosition,
    rotate,
    piece: currentPiece,
    fix,
  } = usePiece();

  useEffect(() => {
    if (boardController?.state === 'playing') {
      timer.start(delay, () => {
        if (player) {
          setPlayer({
            ...player,
            score,
            // board: grid, TODO: screen share
          });
        }

        const toDown = { x: 0, y: 1 };
        if (!isCollusion(grid, currentPiece, toDown)) {
          updatePosition(toDown);
        } else if (isCollusion(grid, currentPiece, { x: 0, y: 0 })) {
          timer.stop();
          boardController!.gameOver();
        } else {
          fix();
        }
      });
    }

    return () => {
      timer.stop();
    };
  }, [currentPiece, boardController?.state, boardController?.gameOver, delay]);

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

        if (delay > 100) {
          setDelay((prev) => {
            if (prev > 400) return prev - 10;
            if (prev > 120) return prev - 15;
            return prev;
          });
        }

        const [removed, score] = removeRow(newGrid);
        if (score) {
          setScore((prev) => prev + score);
        }
        return removed;
      }

      return newGrid;
    });
  }, [currentPiece]);

  // keydown event handler
  useEffect(() => {
    if (boardController?.state !== 'playing') return;
    const keyHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.code) {
        case 'ArrowLeft': {
          const toLeft = { x: -1, y: 1 };
          if (!isCollusion(grid, currentPiece, toLeft)) updatePosition(toLeft);
          break;
        }
        case 'ArrowRight': {
          const toRight = { x: 1, y: 0 };
          if (!isCollusion(grid, currentPiece, { x: 1, y: 0 }))
            updatePosition(toRight);
          break;
        }
        case 'ArrowDown': {
          const toDown = { x: 0, y: 1 };
          if (!isCollusion(grid, currentPiece, toDown)) updatePosition(toDown);
          break;
        }
        case 'ArrowUp': {
          const rotatedShape = getRotatedShape(currentPiece.shape);
          let rotatedPiece = { ...currentPiece, shape: rotatedShape };
          const width = currentPiece.shape[0].length;
          const left = currentPiece.position.x;
          const right = left + width - 1;

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
              return;
            }
          }

          rotate({
            x: rotatedPiece.position.x - currentPiece.position.x,
            y: 0,
          });
          break;
        }
        case 'Space': {
          let y = 0;
          while (!isCollusion(grid, currentPiece, { x: 0, y })) {
            y += 1;
          }
          const toBottom = { x: 0, y: y - 1 };
          if (!isCollusion(grid, currentPiece, toBottom)) {
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
  }, [currentPiece, boardController?.state]);

  const setBoard = (boardController: BoardController) => {
    setGrid(getInitialGrid(BOARD_WIDTH, BOARD_HEIGHT));
    setBoardController(boardController);
  };

  return {
    grid,
    setBoard,
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

const removeRow = (grid: CellState[][]): [CellState[][], number] => {
  let count = 0;
  grid.forEach((row, yIndex) => {
    if (row.every((cell) => cell.type !== 'NONE')) {
      grid.splice(yIndex, 1);
      grid.unshift(Array(BOARD_WIDTH).fill(0).map(createDefaultCellState));
      count += 1;
    }
  });
  return [grid, getScore(count)];
};

const getScore = (removedRowCount: number) => {
  // 1 cell = 1 point
  // and multiply by the number of removed rows
  return removedRowCount * BOARD_WIDTH * removedRowCount;
};

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 23;
