export type Player = {
  id: string;
  name: string;
  photoUrl: string;
  rank: number;
  score: number;
  stage: 'ready' | 'playing' | 'idle';
};
export type GameState = 'idle' | 'playing' | 'finished';
export type UIMessage = 'state' | 'score';
export type Button = { name: string; handler: () => void };
