/* eslint-disable react/react-in-jsx-scope */
import { buildPlayer } from './helper';
import { GameState, Player, PluginMessage } from '../type';
import Header from './components/Header';
import Avatars from './components/Avatars';
import Footer from './components/Footer';

const { widget, currentUser, ui } = figma;
const { AutoLayout, useEffect, useSyncedMap, useSyncedState, waitForTask } =
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

    figma.on('run', () => {
      setInterval(() => {
        // need to watch for changes in the game state
        checkGameState();
      }, 3000);
    });

    figma.on('close', () => {
      const currentPlayer = stages.get(`${currentUser!.id}`);
      if (!currentPlayer) return;
      if (gameState === 'playing' && currentPlayer.state !== 'done') {
        // close after update
        stages.set(currentPlayer.id, {
          ...currentPlayer,
          state: 'done',
        });

        setRank();
        checkGameState();
      }
    });
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
    ui.postMessage({
      type: 'START',
    } as PluginMessage);
    ui.resize(210, 530);
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
    if (getPlayers().every((player) => player.state === 'ready')) {
      setGameState('playing');
      sendGameStart();
    }

    // 2. all players are game over then end game
    if (getPlayers().every((player) => player.state === 'done')) {
      setGameState('done');
    }
  };

  const join = () => {
    if (stages.size > 3) {
      figma.notify('Only 4 players can join');
      return;
    }
    const player = buildPlayer(currentUser!);
    stages.set(player.id, player);
    waitForTask(
      new Promise((_resolve) => {
        figma.showUI(__html__);
        ui.resize(210, 120);
        sendUser();
      })
    );
  };

  const getPlayers = () => {
    return stages.values();
  };

  const leave = () => {
    if (!getPlayers().some((player) => player.id === `${currentUser!.id}`)) {
      figma.notify(`You've already leaved the game`);
      return;
    }

    ui.close();
    stages.delete(`${currentUser!.id}`);
  };

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
        Footer({
          join: { name: 'Join', handler: join },
          leave: { name: 'Leave', handler: leave },
        })}
    </AutoLayout>
  );
}

widget.register(Widget);
