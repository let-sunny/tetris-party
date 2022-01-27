import Button from './Button';
import { Button as ButtonType } from '../../type';
const {
  widget: { AutoLayout, Text },
} = figma;

/* eslint-disable react/react-in-jsx-scope */
const Footer = (buttons: Record<'join' | 'leave', ButtonType>) => (
  <AutoLayout
    padding={10}
    width="fill-parent"
    horizontalAlignItems="center"
    verticalAlignItems="center"
    spacing={10}
  >
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      width="fill-parent"
    >
      {Button(buttons.join)}
      <AutoLayout
        height="hug-contents"
        width="fill-parent"
        padding={10}
        horizontalAlignItems="center"
      >
        <Text
          fontSize={8}
          textDecoration="underline"
          onClick={buttons.leave.handler}
        >
          {buttons.leave.name}
        </Text>
      </AutoLayout>
    </AutoLayout>
  </AutoLayout>
);

export default Footer;
