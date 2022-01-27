import React from 'react';
import { useRecoilValue } from 'recoil';
import { playerState } from '../../store/widget';
import classes from './Display.module.css';

const Display = () => {
  const player = useRecoilValue(playerState);
  return player ? (
    <div className={classes.display}>
      <div className={classes.player}>
        <img
          className={classes.avatar}
          src={player.photoUrl}
          title="avatar"
          alt="player avatar"
        />
        <h1 className={classes.name}>{player.name}</h1>
      </div>
      <p className={classes.score}>⭐️ {player.score}</p>
    </div>
  ) : null;
};

export default Display;
