import { ComponentMeta, Story } from '@storybook/react';
import React, { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { Player } from '../../../type';
import { playerState } from '../../store/widget';
import Display from './Display';

export default {
  title: 'Components/Display',
  component: Display,
  argTypes: {
    player: {
      control: 'object',
      defaultValue: {
        id: '1',
        name: 'Player 1',
        photoUrl: 'https://picsum.photos/200/200',
        score: 0,
        state: 'idle',
        board: [],
      },
    },
  },
} as ComponentMeta<typeof Display>;

const Template: Story<{ player: Player }> = (args) => {
  const setPlayer = useSetRecoilState(playerState);
  useEffect(() => {
    setPlayer(args.player);
  }, [args]);
  return <Display />;
};

export const base = Template.bind({});
