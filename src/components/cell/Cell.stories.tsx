import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Cell from './Cell';
import { Pieces } from '../../util/constants';

export default {
  title: 'Components/Cell',
  component: Cell,
  argTypes: {
    type: { control: { type: 'select', labels: Object.keys(Pieces) } },
  },
} as ComponentMeta<typeof Cell>;

const Template: ComponentStory<typeof Cell> = (args) => (
  <div style={{ width: '1rem', height: '1rem' }}>
    <Cell {...args} />
  </div>
);

export const base = Template.bind({});
base.args = {
  type: 'T',
};
