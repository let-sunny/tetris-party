import { getPlayer } from './helper';
import { GameState, Player, UIMessage } from './type';
import Header from './components/Header';
import Avatars from './components/Avatars';
import Footer from './components/Footer';

/* eslint-disable react/react-in-jsx-scope */
const { widget, currentUser } = figma;
const { AutoLayout, useEffect, useSyncedState, useSyncedMap, waitForTask } =
  widget;

function Widget() {
  const [state, setState] = useSyncedState<GameState>('state', 'idle');
  const [players, setPlayers] = useSyncedState<Player[]>('players', []);

  type NewType = Player;

  const stages = useSyncedMap<NewType>('stages');

  useEffect(() => {
    figma.on('close', () => {
      // TODO: clear settings
      console.log('close ui');
    });
    figma.on('run', () => {
      // TODO: store settings
      console.log('open ui');
      // send current user id
    });

    figma.ui.on('message', (msg: UIMessage) => {
      switch (msg) {
        case 'state':
          // update player state

          // 1. all players are ready then start game
          // 2. if player is gamer over then set rank
          // 3. all players are game over then end game
          break;
        case 'score':
          // update player score
          break;
      }
    });
  });

  const start = () => {
    waitForTask(
      new Promise((_resolve) => {
        figma.showUI(__html__);
        figma.ui.resize(300, 600);
      })
    );

    // send current player info to ui
    figma.ui.postMessage({
      type: 'user',
      user: currentUser,
    });
  };

  const join = async () => {
    const player = buildPlayer(currentUser!);
    stages.set(player.id, player);
    updatePlayers();
  };

  const updatePlayers = () => setPlayers(Array.from(stages.values()));

  const leave = () => {
    figma.ui.close();
    stages.delete(`${figma.currentUser!.id}`);
    updatePlayers();
  };

  const joined = () => {
    return players.some((player) => player.id === `${figma.currentUser!.id}`);
  };

  // 1. if game state is idle then show control buttons
  // 2. if game state is playing then hidden join button and leave button
  // 3. if game state is finished then show the leaderboard
  return (
    <AutoLayout verticalAlignItems={'start'} direction="vertical">
      {Header()}
      {Avatars(players)}
      {Footer(joined, {
        join: { name: 'Join', handler: join },
        leave: { name: 'Leave', handler: leave },
        play: { name: 'Play', handler: start },
      })}
    </AutoLayout>
  );
}

widget.register(Widget);
