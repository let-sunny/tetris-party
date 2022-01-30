import { renderHook, act } from '@testing-library/react-hooks';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  it('should call callback', () => {
    const { result } = renderHook(() => useTimer());
    jest.useFakeTimers();
    const delay = 500;
    const mock = jest.fn();
    act(() => {
      result.current.start(delay, mock);
    });
    jest.advanceTimersByTime(delay);
    expect(mock).toBeCalled();
  });

  it('should stop', () => {
    const { result } = renderHook(() => useTimer());
    jest.useFakeTimers();
    const delay = 500;
    const mock = jest.fn();
    act(() => {
      result.current.start(delay, mock);
      result.current.stop();
    });
    jest.advanceTimersByTime(delay);
    expect(mock).not.toBeCalled();
  });
});
