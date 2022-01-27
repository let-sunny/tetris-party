import { BUTTON_EFFECT } from '../helper';
import { Button as ButtonType } from '../../type';

/* eslint-disable react/react-in-jsx-scope */
const {
  widget: { AutoLayout, Text },
} = figma;

const Button = (button: ButtonType) => (
  <AutoLayout
    width={80}
    height="hug-contents"
    padding={6}
    verticalAlignItems="center"
    horizontalAlignItems="center"
    effect={BUTTON_EFFECT}
    cornerRadius={5}
    fill="#9747ff"
    onClick={button.handler}
  >
    <Text fontSize={10} fill="#fff" blendMode="lighten">
      {button.name}
    </Text>
  </AutoLayout>
);

export default Button;
