/* eslint-disable react/react-in-jsx-scope */
import { buildPlayer } from './helper';
import { GameState, Player, PluginMessage } from '../type';
import Header from './components/Header';
import Avatars from './components/Avatars';
import Footer from './components/Footer';

const { widget, currentUser, ui } = figma;
const { AutoLayout, useEffect, useSyncedState, useSyncedMap, waitForTask } =
  widget;

function Widget() {
  const [gameState, setGameState] = useSyncedState<GameState>('state', 'idle');
  const stages = useSyncedMap<Player>('stages');

  useEffect(() => {
    const messageHandler = (message: PluginMessage) => {
      switch (message.type) {
        case 'UPDATE_PLAYER':
          stages.set(message.player.id, message.player);
          break;
        case 'READY': {
          const prevPlayer = stages.get(message.playerId);
          if (!prevPlayer) return;

          stages.set(message.playerId, {
            ...prevPlayer,
            state: 'ready',
          });
          checkGameState();
          break;
        }
        case 'GAME_OVER': {
          const player = stages.get(message.playerId);
          if (!player) return;
          stages.set(message.playerId, {
            ...player,
            state: 'done',
          });
          setRank();
          checkGameState();
        }
      }
    };

    ui.on('message', messageHandler);
  });

  const sendUser = () => {
    // send current player info to ui
    ui.postMessage({
      type: 'SET_PLAYER',
      player: { ...stages.get(String(currentUser!.id)) },
    } as PluginMessage);
  };

  const sendGameStart = () => {
    // send game state to ui
    ui.resize(210, 530);
    ui.postMessage({
      type: 'START',
    } as PluginMessage);
  };

  const setRank = () => {
    getPlayers()
      .sort((a, b) => b.score - a.score)
      .forEach((player, index) => {
        stages.set(player.id, {
          ...player,
          rank: index + 1,
        });
      });
  };

  const checkGameState = () => {
    // 1. all players are ready then start game
    if (
      gameState === 'idle' &&
      getPlayers().every((player) => player.state === 'ready')
    ) {
      setGameState('playing');
      sendGameStart();
    }

    // 2. all players are game over then end game
    if (
      gameState == 'playing' &&
      getPlayers().every((player) => player.state === 'done')
    ) {
      setGameState('done');
    }
  };

  const start = () => {
    waitForTask(
      new Promise((_resolve) => {
        figma.showUI(__html__);
        ui.resize(210, 120);
      })
    );

    sendUser();
  };

  const getPlayers = () => {
    return stages.values();
  };

  const join = async () => {
    if (stages.size > 3) {
      figma.notify('Only 4 players can join');
      return;
    }
    const player = buildPlayer(currentUser!);
    stages.set(player.id, player);
  };

  const leave = () => {
    ui.close();
    stages.delete(`${currentUser!.id}`);
  };

  const joined = () =>
    getPlayers().some((player) => player.id === `${currentUser!.id}`);

  return (
    <AutoLayout
      verticalAlignItems="start"
      horizontalAlignItems="center"
      direction="vertical"
    >
      {Header()}
      {Avatars(getPlayers, gameState)}

      {/* if game state is idle then show control buttons */}
      {gameState === 'idle' &&
        Footer(joined, {
          join: { name: 'Join', handler: join },
          leave: { name: 'Leave', handler: leave },
          play: { name: 'Play', handler: start },
        })}
    </AutoLayout>
  );
}

widget.register(Widget);
