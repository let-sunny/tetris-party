import React from 'react';
import { addDecorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';
import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

addDecorator((Story) => (
  <RecoilRoot>
    <Story />
  </RecoilRoot>
));
