import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Board from './Board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../util/constants';

export default {
  title: 'Components/Board',
  component: Board,
} as ComponentMeta<typeof Board>;

const Template: ComponentStory<typeof Board> = (args) => <Board {...args} />;

export const base = Template.bind({});
base.args = {
  grid: Array(BOARD_HEIGHT)
    .fill(0)
    .map(() =>
      Array(BOARD_WIDTH)
        .fill(0)
        .map(() => ({
          type: 'NONE',
        }))
    ),
};
