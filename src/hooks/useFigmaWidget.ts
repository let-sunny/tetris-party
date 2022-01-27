import { useEffect, useRef } from 'react';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { playerState, gameState } from '../store/widget';

import { Player, PluginMessage, PostMessage } from '../../type';

const useFigmaWidget = () => {
  const throttlingUpdatePlayer = useRef<NodeJS.Timeout | null>(null);
  const setPlayerState = useSetRecoilState(playerState);
  const [game, setGame] = useRecoilState(gameState);

  useEffect(() => {
    onmessage = (e) => {
      if (!e.data.pluginMessage) return;
      const pluginMessage = e.data.pluginMessage as PluginMessage;

      switch (pluginMessage.type) {
        case 'SET_PLAYER':
          setPlayerState(pluginMessage.player);
          break;
        case 'START':
          if (game !== 'playing') setGame('playing');
          break;
        default:
          new Error('Unknown message type');
      }
    };
  }, []);

  const updatePlayer = (player: Player) => {
    // debounce to avoid sending too many messages
    if (!throttlingUpdatePlayer.current) {
      parent.postMessage?.(
        {
          pluginMessage: {
            type: 'UPDATE_PLAYER',
            player,
          },
        } as PostMessage,
        '*'
      );
      throttlingUpdatePlayer.current = setTimeout(() => {
        throttlingUpdatePlayer.current = null;
      }, 1500);
    }
  };

  const ready = (playerId: string) => {
    parent.postMessage?.(
      {
        pluginMessage: {
          type: 'READY',
          playerId,
        },
      } as PostMessage,
      '*'
    );
  };

  const gameOver = (playerId: string) => {
    parent.postMessage?.(
      {
        pluginMessage: {
          type: 'GAME_OVER',
          playerId,
        },
      } as PostMessage,
      '*'
    );
  };

  return {
    ready,
    updatePlayer,
    gameOver,
  };
};

export { useFigmaWidget };
