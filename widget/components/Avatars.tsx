/* eslint-disable react/react-in-jsx-scope */
import { Player } from '../type';

const {
  widget: { Ellipse, AutoLayout, Text },
} = figma;

const Avatars = (players: Player[]) => (
  <AutoLayout direction="horizontal" width={100} height={100} padding={10}>
    {players.map((player) => (
      <AutoLayout
        direction="vertical"
        verticalAlignItems="center"
        horizontalAlignItems="center"
        key={player.id}
        padding={4}
        spacing={2}
      >
        <Ellipse
          width={25}
          height={25}
          fill={{
            type: 'image',
            src: player.photoUrl,
          }}
        />
        <Text fontSize={8}>{player.name}</Text>
      </AutoLayout>
    ))}
  </AutoLayout>
);

export default Avatars;
