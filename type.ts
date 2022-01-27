export type CellState = {
  type: string;
  fixed: boolean;
};
export type Player = {
  id: string;
  name: string;
  photoUrl: string;
  rank: number;
  score: number;
  state: 'ready' | 'playing' | 'idle' | 'done';
  board: CellState[][];
};
export type GameState = 'idle' | 'playing' | 'done';
export type Button = { name: string; handler: () => void };

// for communication between widget and ui
export type PluginMessage =
  | {
      type: 'SET_PLAYER';
      player: Player;
    }
  | {
      type: 'UPDATE_PLAYER';
      player: Player;
    }
  | {
      type: 'READY';
      playerId: Player['id'];
    }
  | {
      type: 'START';
    }
  | {
      type: 'GAME_OVER';
      playerId: Player['id'];
    };
export type PostMessage = {
  pluginMessage: PluginMessage;
};

export type Message = PluginMessage['type'];
