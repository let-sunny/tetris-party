import React, { useEffect } from 'react';
import Game from './components/game/Game';

function App() {
  useEffect(() => {
    if (typeof parent !== undefined) {
      parent?.postMessage?.({ pluginMessage: 'hello' }, '*');
    }
  }, []);

  return (
    <div className="app">
      <Game />
    </div>
  );
}

export default App;
