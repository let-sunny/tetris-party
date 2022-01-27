/* eslint-disable react/react-in-jsx-scope */
import { GRADIENT_FILL } from '../helper';

const {
  widget: { Rectangle, AutoLayout, Text },
} = figma;

const Header = () => (
  <AutoLayout direction="vertical" spacing={5} padding={10}>
    <Text
      fontSize={16}
      fontWeight={'bold'}
      horizontalAlignText={'center'}
      verticalAlignText={'center'}
      letterSpacing={5}
      fill={GRADIENT_FILL}
    >
      TETRIS PARTY
    </Text>
    <Rectangle width="fill-parent" height={2} fill={GRADIENT_FILL} />
  </AutoLayout>
);

export default Header;
