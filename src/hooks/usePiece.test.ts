import { renderHook, act } from '@testing-library/react-hooks';
import { getRotatedShape, usePiece } from './usePiece';

describe('usePiece', () => {
  it('should generate piece', () => {
    const { result } = renderHook(() => usePiece());
    const piece = result.current.piece;
    expect(piece.type).toBeDefined();
    expect(piece.shape).toBeDefined();
    expect(piece.position).toBeDefined();
    expect(piece.fixed).toBe(false);
  });

  it('should update position', () => {
    const { result } = renderHook(() => usePiece());
    const piece = result.current.piece;
    const capturedPosition = { ...piece.position };
    const move = { x: 2, y: 1 };
    act(() => {
      result.current.updatePosition(move);
    });
    expect(result.current.piece.position).toEqual({
      x: capturedPosition.x + move.x,
      y: capturedPosition.y + move.y,
    });
  });

  it('should rotate', () => {
    const { result } = renderHook(() => usePiece());
    const piece = result.current.piece;
    const capturedShape = [...piece.shape];
    const capturedPosition = { ...piece.position };

    const move = { x: 2, y: 1 };
    act(() => {
      result.current.rotate(move);
    });
    expect(result.current.piece.shape).toEqual(getRotatedShape(capturedShape));
    expect(result.current.piece.position).toEqual({
      x: capturedPosition.x + move.x,
      y: capturedPosition.y + move.y,
    });
  });

  it('should fix', () => {
    const { result } = renderHook(() => usePiece());
    expect(result.current.piece.fixed).toBe(false);

    act(() => {
      result.current.fix();
    });
    expect(result.current.piece.fixed).toBe(true);
  });
});
