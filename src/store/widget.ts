import { atom, selector } from 'recoil';
import { GameState, Player } from '../../type';

export const playerState = atom<Player | null>({
  key: 'player',
  default: null,
});

export const gameState = atom<GameState>({
  key: 'gameState',
  default: 'idle',
});
