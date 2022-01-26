import React, { useEffect } from 'react';
import './App.css';
import Game from './components/game/Game';

function App() {
  useEffect(() => {
    if (typeof parent !== undefined) {
      parent?.postMessage?.({ pluginMessage: 'hello' }, '*');
    }
  }, []);

  return (
    <div className="App">
      <Game />
      <button
        onClick={() => {
          parent?.postMessage?.({ pluginMessage: 'close' }, '*');
        }}
      >
        Close
      </button>
    </div>
  );
}

export default App;
