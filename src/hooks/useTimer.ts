import { useRef } from 'react';

export function useTimer() {
  const intervalRef = useRef<NodeJS.Timer>();

  const start = (delay: number, callback: () => void) => {
    if (intervalRef.current) stop();

    const interval = setInterval(callback, delay);
    intervalRef.current = interval;
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return { start, stop };
}
