/* eslint-disable react/react-in-jsx-scope */
import { GameState, Player } from '../../type';

const {
  widget: { Ellipse, AutoLayout, Text },
} = figma;

const Avatars = (getPlayers: () => Player[], gameState: GameState) => (
  <AutoLayout
    direction="horizontal"
    spacing={10}
    horizontalAlignItems="center"
    verticalAlignItems="center"
  >
    {getPlayers().map((player) => (
      <AutoLayout
        direction="vertical"
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
        <Text fontSize={9}>{player.name}</Text>
        {gameState === 'idle' && player.state === 'ready' && (
          <Text fontSize={9}>✅</Text>
        )}
        {gameState === 'idle' && player.state === 'idle' && (
          <Text fontSize={9}>❎</Text>
        )}
        {gameState === 'playing' && (
          <Text fontSize={9}>⭐️ {player.score}</Text>
        )}
        {gameState === 'done' && (
          <AutoLayout spacing={2}>
            <Text fontSize={12}>{getRankEmoji(player.rank)}</Text>
            <Text fontSize={9}>{player.score}</Text>
          </AutoLayout>
        )}
      </AutoLayout>
    ))}
  </AutoLayout>
);

export default Avatars;

const getRankEmoji = (rank: number) => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '💣';
  }
};
