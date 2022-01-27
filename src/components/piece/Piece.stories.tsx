import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Piece from './Piece';
import { PieceShapes } from '../../hooks/usePiece';

export default {
  title: 'Components/Piece',
  component: Piece,
} as ComponentMeta<typeof Piece>;

const Template: ComponentStory<typeof Piece> = (args) => (
  <Piece {...{ ...args, shape: PieceShapes[args.type] }} />
);

export const NONE = Template.bind({});
NONE.args = {
  type: 'NONE',
};

export const T = Template.bind({});
T.args = {
  type: 'T',
};

export const L = Template.bind({});
L.args = {
  type: 'L',
};

export const J = Template.bind({});
J.args = {
  type: 'J',
};

export const I = Template.bind({});
I.args = {
  type: 'I',
};

export const O = Template.bind({});
O.args = {
  type: 'O',
};

export const S = Template.bind({});
S.args = {
  type: 'S',
};

export const Z = Template.bind({});
Z.args = {
  type: 'Z',
};
