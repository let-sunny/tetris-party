import { useEffect, useRef } from 'react';
import { useSetRecoilState } from 'recoil';
import { playerState, gameState } from '../store/widget';

import { Player, PluginMessage, PostMessage } from '../../type';

const useFigmaWidget = () => {
  const throttlingUpdatePlayer = useRef<NodeJS.Timeout | null>(null);
  const setPlayerState = useSetRecoilState(playerState);
  const setGameState = useSetRecoilState(gameState);

  useEffect(() => {
    onmessage = (e) => {
      const pluginMessage = e.data?.pluginMessage as PluginMessage;

      switch (pluginMessage.type) {
        case 'SET_PLAYER':
          setPlayerState(pluginMessage.player);
          break;
        case 'START':
          setGameState('playing');
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
