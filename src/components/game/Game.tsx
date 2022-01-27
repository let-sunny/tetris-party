import React, { useEffect, useMemo } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import classes from './Game.module.css';

import { playerState, gameState } from '../../store/widget';
import { useBoard } from '../../hooks/useBoard';
import { useGame } from '../../hooks/useGame';

import Board from '../board/Board';
import Button from '../button/Button';
import Display from '../display/Display';

const Game = () => {
  const [player, setPlayer] = useRecoilState(playerState);
  const state = useRecoilValue(gameState);
  const { ready, updatePlayer, gameOver, isFigma } = useGame();
  const { grid, setBoard } = useBoard();

  useEffect(() => {
    if (!player) return;
    updatePlayer(player);
  }, [player]);

  useEffect(() => {
    if (state !== 'playing') return;
    setBoard({
      state,
      gameOver: () => {
        gameOver(player!.id);
      },
    });
  }, [state]);

  const screen = useMemo(() => {
    if (state === 'playing') return <Board grid={grid} />;

    return (
      <section className={classes.content}>
        {/* if player is ready but game is not started then show waiting screen */}
        {player?.state === 'ready' && state === 'idle' && (
          <p className={classes.waiting}>WAITING ... </p>
        )}
        {/* if player is not ready then show ready button */}
        {player?.state === 'idle' && (
          <Button
            name="Ready"
            onClick={() => {
              ready(player?.id);
              setPlayer({ ...player, state: 'ready' });
            }}
          />
        )}
      </section>
    );
  }, [state, player, grid]);

  return (
    <div className={classes.game}>
      <Display />
      {screen}
    </div>
  );
};

export default Game;
