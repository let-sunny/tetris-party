import React from 'react';
import { RecoilRoot } from 'recoil';

import Game from './components/game/Game';

function App() {
  return (
    <RecoilRoot>
      <Game />
    </RecoilRoot>
  );
}

export default App;
