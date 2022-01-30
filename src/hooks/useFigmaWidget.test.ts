import { renderHook, act } from '@testing-library/react-hooks';
import { fireEvent } from '@testing-library/dom';
import recoil from 'recoil';
import * as state from './../store/widget';
import { Player, PluginMessage } from '../../type';

const mockSetPlayerState = jest.fn();
const mockSetGame = jest.fn();

jest.mock('recoil', () => {
  return {
    useRecoilState: jest.fn(() => {
      return ['idle', mockSetGame];
    }),
    useSetRecoilState: jest.fn(() => {
      return mockSetPlayerState;
    }),
  };
});
jest.mock('./../store/widget', () => jest.fn());

import { useFigmaWidget } from './useFigmaWidget';

const mockPlayer: Player = {
  id: '',
  name: 'Hello 🙋🏻‍♀️',
  photoUrl: 'https://cataas.com/cat',
  score: 0,
  board: [],
  rank: 0,
  state: 'idle',
};

describe('useFigmaWidget', () => {
  beforeEach(() => {
    parent.postMessage = jest.fn();
  });

  it('should initialize player', () => {
    renderHook(() => useFigmaWidget());

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'SET_PLAYER',
            player: mockPlayer,
          } as PluginMessage,
        },
      })
    );

    expect(mockSetPlayerState).toBeCalledWith(mockPlayer);
  });

  it('should set game state', () => {
    renderHook(() => useFigmaWidget());

    fireEvent(
      window,
      new MessageEvent('message', {
        data: {
          pluginMessage: {
            type: 'START',
          } as PluginMessage,
        },
      })
    );

    expect(mockSetGame).toBeCalledWith('playing');
  });

  it('should update player', () => {
    const { result } = renderHook(() => useFigmaWidget());
    jest.useFakeTimers();

    act(() => {
      result.current.updatePlayer(mockPlayer);
    });

    expect(parent.postMessage).toBeCalledWith(
      {
        pluginMessage: {
          type: 'UPDATE_PLAYER',
          player: mockPlayer,
        } as PluginMessage,
      },
      '*'
    );

    // throttling
    act(() => {
      result.current.updatePlayer(mockPlayer);
    });
    expect(parent.postMessage).toBeCalledTimes(1);

    jest.runAllTimers();
    act(() => {
      result.current.updatePlayer(mockPlayer);
    });
    expect(parent.postMessage).toBeCalledTimes(2);
  });

  it('should ready', () => {
    const { result } = renderHook(() => useFigmaWidget());

    act(() => {
      result.current.ready('id');
    });

    expect(parent.postMessage).toBeCalledWith(
      {
        pluginMessage: {
          type: 'READY',
          playerId: 'id',
        } as PluginMessage,
      },
      '*'
    );
  });

  it('should game over', () => {
    const { result } = renderHook(() => useFigmaWidget());

    act(() => {
      result.current.gameOver('id');
    });

    expect(parent.postMessage).toBeCalledWith(
      {
        pluginMessage: {
          type: 'GAME_OVER',
          playerId: 'id',
        } as PluginMessage,
      },
      '*'
    );
  });
});
