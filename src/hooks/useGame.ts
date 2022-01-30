import { useEffect, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { gameState, playerState } from '../store/widget';
import { useFigmaWidget } from './useFigmaWidget';
import { Player } from './../../type';

const isFigma = process.env.BUILD_MODE !== 'DEMO';
export const useGame = () => {
  const figmaWidget = useFigmaWidget();
  const setGameState = useSetRecoilState(gameState);
  const setPlayer = useSetRecoilState(playerState);

  useEffect(() => {
    if (!isFigma) {
      setPlayer(mockPlayer);
    }
  }, [isFigma]);

  const ready: typeof figmaWidget.ready = useMemo(() => {
    if (isFigma) return figmaWidget.ready;
    return () => setGameState('playing');
  }, [isFigma]);

  const gameOver: typeof figmaWidget.gameOver = useMemo(() => {
    if (isFigma) return figmaWidget.gameOver;
    return () => {
      setGameState('idle');
      setPlayer(mockPlayer);
    };
  }, [isFigma]);

  const updatePlayer: typeof figmaWidget.updatePlayer = useMemo(() => {
    if (isFigma) return figmaWidget.updatePlayer;
    return () => {
      // do nothing
    };
  }, [isFigma]);

  return {
    ready,
    updatePlayer,
    gameOver,
  };
};

const mockPlayer: Player = {
  id: '',
  name: 'Hello 🙋🏻‍♀️',
  photoUrl: 'https://cataas.com/cat',
  score: 0,
  board: [],
  rank: 0,
  state: 'idle',
};
