
# Tetris Party – Architecture

## Table of Contents

- [1. Overview](#1-overview)
- [2. Design Goals](#2-design-goals)
- [3. High-Level Architecture](#3-high-level-architecture)
- [4. Core Concepts & Data Model](#4-core-concepts--data-model)
- [5. Game Logic Hooks](#5-game-logic-hooks)
- [6. UI Layer (React Components)](#6-ui-layer-react-components)
- [7. State Management](#7-state-management)
- [8. Figma Widget Integration](#8-figma-widget-integration)
- [9. Web Demo App](#9-web-demo-app)
- [10. Shared Types & Messaging Contract](#10-shared-types--messaging-contract)
- [11. Testing & Storybook](#11-testing--storybook)
- [12. Build & Environments](#12-build--environments)
- [13. Known Limitations & Future Work](#13-known-limitations--future-work)

---

## 1. Overview

This repository contains a small but complete Tetris-style game that runs both:

- as a **Figma Widget**, using the Figma Widget API, and
- as a **standalone web demo**, built with React and Vite.

The codebase is structured to:

- share **game logic** and **type definitions** across widget and web,
- keep **UI**, **state management**, and **integration with Figma** clearly separated, and
- remain small enough to read in a single sitting, while still showing “real” architecture and testing.

---

## 2. Design Goals

- **Separation of concerns**
  - Game rules and board logic are isolated in React hooks.
  - Figma-specific logic is kept inside the widget layer and a dedicated integration hook.
- **Shared domain model**
  - Players, game state, and cell state are modeled as types and reused across widget and web.
- **Testability**
  - Core hooks and message handling are covered by unit tests.
  - UI components have Storybook stories and snapshot tests.
- **Widget + Web parity**
  - The widget and the web demo share the same game loop, so behavior in Figma matches the demo.

Non-goals:

- Building a production-grade multiplayer game server.
- Supporting arbitrarily large player counts or complex matchmaking.

---

## 3. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                          Monorepo                              │
│                                                                 │
│  ┌──────────────────────────┐    Shared   ┌──────────────────┐  │
│  │  Figma Widget (widget/)  │◀──────────▶│  Types & Hooks   │  │
│  │                          │    code     │  (src/hooks,     │  │
│  │  - widget/code.tsx       │             │   type.ts)       │  │
│  │    - Figma Widget API    │             └──────────────────┘  │
│  │    - useSyncedState      │                      ▲           │
│  │    - ui <-> parent post  │                      │           │
│  └──────────────────────────┘                      │           │
│                                                    │           │
│  ┌──────────────────────────┐                      │           │
│  │  Web Demo (src/)         │──────────────────────┘           │
│  │                          │   imports shared hooks/types     │
│  │  - React + Vite          │                                  │
│  │  - Recoil store          │                                  │
│  │  - useFigmaWidget(bridge)│                                  │
│  └──────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
```

At a glance:

- `widget/` holds the Figma Widget implementation and uses **Figma’s synced state primitives**.
- `src/` holds the web demo, game hooks, and integration glue for running the same game in a browser.
- `type.ts` defines shared types and message contracts.

---

## 4. Core Concepts & Data Model

Core types are defined in `type.ts` (and referenced by hooks/components).

### Player

Represents a participant in the game.

```ts
export type Player = {
  id: string;
  name: string;
  avatarUrl?: string;
  score: number;
  isReady: boolean;
  isGameOver: boolean;
};
```

### GameState

Represents the high-level state of the game loop.

```ts
export type GameState = 'idle' | 'ready' | 'playing' | 'finished';
```

This state is shared between:

- the widget (via `useSyncedState<GameState>`) and
- the web demo (via Recoil atom).

### CellState

Represents a single cell in the Tetris board.

```ts
export type CellState = {
  type: string;    // or PieceType in game logic
  fixed: boolean;  // has this cell been locked in place?
};
```

In the game logic, `type` is usually a `PieceType` enum (e.g. `I`, `O`, `T`, etc.).  
This discrepancy is one of the known cleanup opportunities.

---

## 5. Game Logic Hooks

Game behavior is encapsulated in a set of hooks under `src/hooks/`.

### 5.1. `usePiece`

Responsible for the current Tetris piece:

- Current position (`x`, `y`)
- Current rotation index
- Piece shape matrix
- Locking / resetting the piece

Key responsibilities:

- `rotate()`, `moveLeft()`, `moveRight()`, `moveDown()`
- Collision detection against the board
- Exported helper `getRotatedShape` (covered by tests)

By keeping this logic in a dedicated hook, the board and the UI only need to ask:

- “Where is the piece?”
- “What does it look like in the current rotation?”

### 5.2. `useBoard`

Responsible for the board grid and scoring:

- Owns a `CellState[][]` grid
- Applies the current piece to the grid
- Clears full lines and updates score
- Detects game-over when new pieces can no longer spawn

Typical responsibilities:

- `tick()` – advance the game by one frame (piece drops, lines clear, etc.)
- `resetBoard()`
- `mergePieceIntoBoard()`

In practice, `useBoard` often interacts with global state (e.g. updating `player.score`), which is acceptable at this scale but can be further decoupled if needed.

### 5.3. `useTimer`

Encapsulates time-based progression:

- Wraps `setInterval` / `clearInterval`
- Exposes `start(intervalMs)` and `stop()`
- Accepts a callback to run on each tick

This hook is covered by tests using fake timers to ensure deterministic behavior.

### 5.4. `useGame`

Top-level game orchestration:

- Glue between:
  - `useBoard`
  - `usePiece`
  - `useTimer`
  - global state (Recoil) and environment (widget demo vs Figma)
- Tracks:
  - whether the game is running
  - when to start/stop timer
  - when to emit game-over

It also contains environment-specific logic:

```ts
const isFigma = process.env.BUILD_MODE !== 'DEMO';
```

In DEMO mode, it may use a mock player; in Figma mode, it coordinates with `useFigmaWidget`.

### 5.5. `useFigmaWidget`

Bridge hook between the web app and the Figma widget.

Responsibilities:

- Listen to messages from the widget via `window.addEventListener('message')`.
- Parse `PluginMessage` payloads (e.g. READY, UPDATE_PLAYER, GAME_OVER).
- Update Recoil state (`playerState`, `gameState`) accordingly.
- Send events back to the widget via `parent.postMessage`.

This hook is unit-tested to verify the exact message payloads and state transitions.

---

## 6. UI Layer (React Components)

Located mainly under `src/components/`.

### 6.1. Game container

`<Game />`:

- Orchestrates hooks (`useGame`, `useFigmaWidget`).
- Chooses between Figma mode and DEMO mode.
- Renders the main layout:

  - `<Board />`
  - `<Display />`
  - `<Button />` for start/reset

### 6.2. Presentational components

- `Board.tsx`
  - Receives `grid: CellState[][]` and renders a matrix of `<Cell />`.
- `Cell.tsx`
  - Receives `type` and `fixed` and renders a single square with CSS based on `type`.
- `Display.tsx`
  - Uses Recoil to show player name, avatar, score, and game state.
- `Button.tsx`
  - Simple action button (e.g., “Start”, “Reset”).

These components are largely “dumb” and free of game rules, making them easy to test and reuse.

---

## 7. State Management

The project uses two distinct state systems, depending on environment.

### 7.1. Figma Widget state

In `widget/code.tsx`:

- `useSyncedState<GameState>('state', 'idle')`
- `useSyncedMap<Player>('players')`

The widget is the source of truth for:

- global game state (e.g. `playing`, `finished`)
- the list of players and their scores

All widget instances (for collaborators in the same Figma document) share these synced states.

### 7.2. Web Demo state (Recoil)

In `src/store/widget.ts`:

```ts
export const playerState = atom<Player | null>({ /* ... */ });
export const gameState = atom<GameState>({ /* ... */ });
```

The web demo uses Recoil as a simple global store:

- `playerState` – the current player in this browser session
- `gameState` – the current game state from the widget’s perspective

`useFigmaWidget` is responsible for keeping these atoms in sync with plugin messages.

---

## 8. Figma Widget Integration

The widget implementation lives in `widget/code.tsx`.

### 8.1. Widget responsibilities

- Create the widget UI using Figma Widget API.
- Manage widget-level view (player list, start button, ranking, etc.).
- Maintain synced state for:

  - game lifecycle (`GameState`)
  - player map (`Map<string, Player>`)

- Listen to messages from the web demo (if embedded) and update synced state.

### 8.2. Messaging flow

Message types are defined in `type.ts` as `PluginMessage` / `PostMessage`.

Typical flow:

1. Widget starts and sends a `READY` message with initial player info.
2. Web demo receives `READY` via `window.message` and sets `playerState`.
3. When the user starts or finishes a game in the web demo, it sends a `GAME_OVER` or `UPDATE_PLAYER` message via `parent.postMessage`.
4. Widget receives the message in `ui.onmessage` and updates `useSyncedMap` / `useSyncedState`.

This keeps the widget as the **authoritative source** for scores and global state, while the web app is responsible for the actual Tetris gameplay.

---

## 9. Web Demo App

Located under `src/`:

- `main.tsx`
  - Bootstraps React app and RecoilRoot.
- `App.tsx`
  - Entry point that renders `<Game />`.
- `components/` / `hooks/` / `store/` as described above.

Build is handled by Vite:

- Fast dev server
- Simple single-page build output that can be hosted anywhere
- Same bundle can be used as an embedded UI in Figma if desired

---

## 10. Shared Types & Messaging Contract

Types are centralized in `type.ts` to ensure both widget and web agree on message payloads.

```ts
export type PluginMessage =
  | { type: 'READY'; playerId: string }
  | { type: 'UPDATE_PLAYER'; player: Player }
  | { type: 'GAME_OVER'; playerId: string; score: number }
  | { type: 'PING' }
  // ...
```

`PostMessage` is the counterpart type used on the web side.

In the current implementation, message `type` strings are repeated in several places.  
A potential improvement is to extract `MESSAGE` constants and use them across widget, web, and tests for stronger safety.

---

## 11. Testing & Storybook

### 11.1. Hook tests

Under `src/hooks/__tests__/`:

- `usePiece.test.ts`
  - Verifies rotation, movement, and locking of pieces.
- `useTimer.test.ts`
  - Uses fake timers to test interval handling.
- `useFigmaWidget.test.ts`
  - Mocks `window.postMessage` and `window.addEventListener` to verify that messages are sent and processed correctly.

### 11.2. Storybook & Storyshots

Under `src/components/`:

- `*.stories.tsx` describe common UI states for:
  - `Board`, `Cell`, `Display`, `Button`, etc.
- Storyshots configuration captures snapshots of these stories to detect UI regressions.

This combination makes it easy to:

- verify core behavior without running Figma, and
- preview UI components in isolation.

---

## 12. Build & Environments

- **Vite** is used for the web demo build (`vite.config.ts`).
- **Storybook** is configured under `.storybook/` for component-driven development.
- **Jest** + React Testing Library handle unit and integration tests.

Build modes:

- `BUILD_MODE=DEMO`
  - Web demo mode; may use mock player and does not expect Figma.
- Any other mode
  - Assumes Figma environment and enables widget-oriented behavior in hooks like `useGame`.

The environment is currently read directly via `process.env.BUILD_MODE` inside hooks, which works but could be further improved by injecting configuration.

---

## 13. Known Limitations & Future Work

- **Duplicate CellState definitions**
  - `CellState` is defined both in `type.ts` and inside the board logic, with slightly different typing.
  - Consolidating this into a single shared type would reduce drift.
- **Tight coupling in `useBoard`**
  - Game board logic often touches global state; extracting more pure helpers would make it easier to reuse and test.
- **Message type strings**
  - Message `type` strings are repeated across widget, web, and tests.
  - Introducing a shared `MESSAGE` constant object and a `PluginMessage` union based on it would improve robustness.
- **Environment handling**
  - `process.env.BUILD_MODE` is read directly inside hooks. Passing an explicit “mode” parameter or injecting configuration can make testing easier and intentions clearer.

Despite these limitations, the architecture is intentionally lightweight:

- clear boundary between **widget**, **web demo**, and **shared game logic**,
- predictable state management with Recoil and Figma synced state,
- and a testable message bridge between Figma and the browser.

As a result, this repo serves both as a playable mini-game and as a compact, readable example of how to structure a Figma Widget + web companion app.
