import React from 'react';
import classes from './Button.module.css';

type Props = {
  name: string;
  onClick: () => void;
};

const Button = ({ name, onClick }: Props) => {
  return (
    <button
      type="button"
      className={classes.button}
      name={name}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default Button;
