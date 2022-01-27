import { useState, useEffect, useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { gameState, playerState } from '../store/widget';
import { useFigmaWidget } from './useFigmaWidget';
import { Player } from './../../type';

export const useGame = () => {
  const figmaWidget = useFigmaWidget();
  const setGameState = useSetRecoilState(gameState);
  const setPlayer = useSetRecoilState(playerState);
  const [isFigma, setIsFigma] = useState(false);

  useEffect(() => {
    setIsFigma(
      location !== parent.location && parent.location.hostname === 'figma.com'
    );
  }, []);

  useEffect(() => {
    if (!isFigma) {
      setPlayer(mockPlayer);
    }
  }, [isFigma]);

  const ready = useMemo(() => {
    if (isFigma) return figmaWidget.ready;
    return () => setGameState('playing');
  }, [isFigma]);

  const gameOver = useMemo(() => {
    if (isFigma) return figmaWidget.gameOver;
    return () => {
      setGameState('idle');
      setPlayer(mockPlayer);
    };
  }, [isFigma]);

  const updatePlayer = useMemo(() => {
    if (isFigma) return figmaWidget.updatePlayer;
    return () => {
      // do nothing
    };
  }, [isFigma]);

  return {
    ready,
    updatePlayer,
    gameOver,
    isFigma,
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
