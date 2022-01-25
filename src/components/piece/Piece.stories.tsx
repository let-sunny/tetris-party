import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Piece from './Piece';

export default {
  title: 'Example/Piece',
  component: Piece,
} as ComponentMeta<typeof Piece>;

const Template: ComponentStory<typeof Piece> = (args) => <Piece {...args} />;

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  user: {},
};

export const LoggedOut = Template.bind({});
LoggedOut.args = {};
