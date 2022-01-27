import { Player } from '../type';

export const buildPlayer = (currentUser: User): Player => ({
  state: 'idle',
  score: 0,
  rank: 0,
  name: currentUser!.name,
  photoUrl: currentUser!.photoUrl || '',
  id: currentUser!.id || '',
  board: [],
});

export const GRADIENT_FILL: WidgetJSX.GradientPaint = {
  type: 'gradient-linear',
  gradientHandlePositions: [
    { x: 0, y: 0.5 },
    { x: 1, y: 1 },
    { x: 0, y: 0 },
  ],
  gradientStops: [
    { position: 0, color: { r: 0.59, g: 0.27, b: 1, a: 1 } },
    { position: 1, color: { r: 0.85, g: 0.6, b: 1, a: 1 } },
  ],
};

export const BUTTON_EFFECT: WidgetJSX.Effect = {
  type: 'drop-shadow',
  color: {
    r: 0,
    g: 0,
    b: 0,
    a: 0.3,
  },
  offset: { x: 1, y: 1 },
  blur: 10,
};
