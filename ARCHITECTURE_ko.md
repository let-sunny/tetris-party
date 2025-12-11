
# Tetris Party – 아키텍처

## 목차

- [1. 개요](#1-개요)
- [2. 설계 목표](#2-설계-목표)
- [3. 상위 아키텍처](#3-상위-아키텍처)
- [4. 핵심 개념 및 데이터 모델](#4-핵심-개념-및-데이터-모델)
- [5. 게임 로직 훅](#5-게임-로직-훅)
- [6. UI 레이어 (React 컴포넌트)](#6-ui-레이어-react-컴포넌트)
- [7. 상태 관리](#7-상태-관리)
- [8. Figma 위젯 연동](#8-figma-위젯-연동)
- [9. 웹 데모 앱](#9-웹-데모-앱)
- [10. 공용 타입 및 메시지 계약](#10-공용-타입-및-메시지-계약)
- [11. 테스트 & Storybook](#11-테스트--storybook)
- [12. 빌드 & 환경](#12-빌드--환경)
- [13. 한계점 및 향후 개선 방향](#13-한계점-및-향후-개선-방향)

---

## 1. 개요

이 레포지토리는 작은 테트리스 스타일 게임을 담고 있으며, 두 환경에서 동작합니다.

- **Figma 위젯**: Figma Widget API 기반
- **독립 웹 데모**: React + Vite 기반 SPA

코드베이스는 다음을 목표로 구조화되어 있습니다.

- **게임 로직**과 **타입 정의**를 위젯/웹에서 공유
- **UI**, **상태 관리**, **Figma 연동**을 명확히 분리
- 한 번에 읽을 수 있을 정도로 작지만, 실제 아키텍처/테스트가 있는 예제

---

## 2. 설계 목표

- **관심사 분리**
  - 게임 규칙/보드 로직은 React 훅으로 캡슐화
  - Figma 의존 로직은 위젯 레이어와 전용 통합 훅에만 존재
- **공용 도메인 모델**
  - Player, GameState, CellState를 타입으로 정의하고 위젯/웹에서 재사용
- **테스트 가능성**
  - 핵심 훅과 메시지 핸들링은 단위 테스트로 검증
  - UI 컴포넌트는 Storybook + 스냅샷 테스트로 검증
- **Widget/Web 동작 일치**
  - 위젯과 웹 데모가 동일한 게임 루프를 공유해, 두 환경에서 행동이 동일하도록 설계

Non-goals:

- 프로덕션급 멀티플레이 게임 서버 구축
- 매우 많은 플레이어 수나 복잡한 매칭 지원

---

## 3. 상위 아키텍처

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

요약:

- `widget/`에는 Figma Widget 구현이 있으며, **Figma의 synced state**를 사용합니다.
- `src/`에는 웹 데모, 게임 훅, Figma 연동 훅이 있습니다.
- `type.ts`에는 공용 타입 및 메시지 계약이 정의되어 있습니다.

---

## 4. 핵심 개념 및 데이터 모델

핵심 타입은 주로 `type.ts`에 정의됩니다.

### Player

게임 참여자를 나타냅니다.

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

게임 루프의 상위 상태를 나타냅니다.

```ts
export type GameState = 'idle' | 'ready' | 'playing' | 'finished';
```

이 값은:

- 위젯 쪽에서는 `useSyncedState<GameState>`로 공유되고,
- 웹 데모에서는 Recoil atom으로 관리됩니다.

### CellState

보드의 한 칸을 나타냅니다.

```ts
export type CellState = {
  type: string;    // 게임 로직에서는 보통 PieceType 사용
  fixed: boolean;  // 이미 고정된 블록인지 여부
};
```

게임 로직에서는 `type`이 `PieceType`인 버전도 있으며, 이중 정의는 정리 대상입니다.

---

## 5. 게임 로직 훅

게임 동작은 `src/hooks/` 하위의 훅들에 캡슐화되어 있습니다.

### 5.1. `usePiece`

현재 조각(piece)에 대한 훅입니다.

- 위치 (`x`, `y`)
- 회전 인덱스
- 모양(matrix)
- 고정/리셋 상태

주요 기능:

- `rotate()`, `moveLeft()`, `moveRight()`, `moveDown()`
- 보드와의 충돌 감지
- 테스트 대상인 헬퍼 `getRotatedShape` 제공

이 훅 덕분에 보드/UI는 “현재 조각이 어디 / 어떤 모양인가”만 알면 됩니다.

### 5.2. `useBoard`

보드 그리드와 점수를 담당합니다.

- `CellState[][]` 보드 그리드 관리
- 현재 조각을 보드에 반영
- 가득 찬 라인 제거 및 점수 업데이트
- 새 조각이 스폰될 수 없는 경우 게임오버 판정

전형적인 역할:

- `tick()` – 한 프레임 진행(조각 하강, 라인 제거 등)
- `resetBoard()`
- `mergePieceIntoBoard()`

현 구현에서는 전역 상태(점수 등)를 직접 업데이트하는 부분이 있어, 규모가 커지면 분리 여지가 있습니다.

### 5.3. `useTimer`

시간 기반 진행을 담당합니다.

- `setInterval` / `clearInterval` 래핑
- `start(intervalMs)`, `stop()` 제공
- 각 tick마다 실행할 콜백 인자로 받기

fake timer를 활용한 테스트로 동작이 검증됩니다.

### 5.4. `useGame`

최상위 게임 오케스트레이션 훅입니다.

- 아래를 묶는 “접착제” 역할:
  - `useBoard`
  - `usePiece`
  - `useTimer`
  - 전역 상태(Recoil) 및 환경(위젯/데모)
- 게임이 실행 중인지, 언제 타이머를 시작/정지할지, 언제 게임오버로 전환할지 결정

또한 환경 분기 로직이 포함됩니다.

```ts
const isFigma = process.env.BUILD_MODE !== 'DEMO';
```

DEMO 모드에서는 mock player를 사용하고, Figma 모드에서는 `useFigmaWidget`과 연동합니다.

### 5.5. `useFigmaWidget`

웹 앱과 Figma 위젯 사이의 브리지 역할을 하는 훅입니다.

역할:

- `window.addEventListener('message')`로 위젯에서 오는 `PluginMessage` 수신
- READY, UPDATE_PLAYER, GAME_OVER 등의 payload 파싱
- Recoil 상태(`playerState`, `gameState`) 업데이트
- 필요 시 `parent.postMessage`로 위젯에 이벤트 전송

단위 테스트에서 postMessage payload와 상태 변화를 검증합니다.

---

## 6. UI 레이어 (React 컴포넌트)

주로 `src/components/` 아래에 위치합니다.

### 6.1. Game 컨테이너

`<Game />`:

- `useGame`, `useFigmaWidget` 등 훅 사용
- Figma 모드 / DEMO 모드 분기
- 메인 레이아웃 렌더링:

  - `<Board />`
  - `<Display />`
  - `<Button />` (Start/Reset 등)

### 6.2. 프리젠테이션 컴포넌트

- `Board.tsx`
  - `grid: CellState[][]`를 받아 `<Cell />` 행렬로 렌더
- `Cell.tsx`
  - `type`, `fixed`를 받아 CSS class를 조합해 렌더
- `Display.tsx`
  - Recoil로부터 플레이어 이름/아바타/점수/상태를 읽어 표시
- `Button.tsx`
  - 단순 액션 버튼

이 컴포넌트들은 대부분 “덤 컴포넌트”라 로직이 거의 없고, 테스트/재사용에 유리합니다.

---

## 7. 상태 관리

환경에 따라 두 가지 상태 시스템을 사용합니다.

### 7.1. Figma 위젯 상태

`widget/code.tsx` 내부:

- `useSyncedState<GameState>('state', 'idle')`
- `useSyncedMap<Player>('players')`

위젯은 다음에 대한 소스 오브 트루스입니다.

- 전역 게임 상태 (`playing`, `finished` 등)
- 플레이어 리스트 및 점수

같은 Figma 문서를 보는 협업자들은 이 synced state를 공유합니다.

### 7.2. 웹 데모 상태 (Recoil)

`src/store/widget.ts`:

```ts
export const playerState = atom<Player | null>({ /* ... */ });
export const gameState = atom<GameState>({ /* ... */ });
```

웹 데모는 Recoil 전역 상태로:

- 현재 브라우저 세션의 플레이어 (`playerState`)
- 위젯 관점의 게임 상태 (`gameState`)

를 관리합니다.  
`useFigmaWidget`이 이 atom들을 위젯 메시지와 동기화합니다.

---

## 8. Figma 위젯 연동

위젯 구현은 `widget/code.tsx`에 있습니다.

### 8.1. 위젯 역할

- Figma Widget API로 UI 렌더링
- 플레이어 리스트, 시작 버튼, 랭킹 등을 보여주는 위젯 UI 담당
- `GameState`, `players` 맵에 대한 synced state 유지
- 웹 데모에서 오는 메시지 수신 및 synced state 업데이트

### 8.2. 메시지 흐름

메시지 타입은 `type.ts`의 `PluginMessage` / `PostMessage`로 정의됩니다.

일반적인 흐름:

1. 위젯 시작 시 `READY` 메시지를 보내 초기 플레이어 정보를 전달
2. 웹 데모는 `window.message`로 `READY`를 받고 `playerState`를 설정
3. 웹에서 게임 종료/점수 업데이트 시 `GAME_OVER` 또는 `UPDATE_PLAYER`를 `parent.postMessage`로 전송
4. 위젯은 `ui.onmessage`에서 이를 받아 `useSyncedMap` / `useSyncedState`를 갱신

위젯이 점수/전역 상태의 최종 소스이고, 웹 앱은 실제 테트리스 플레이를 담당하는 구조입니다.

---

## 9. 웹 데모 앱

`src/` 디렉터리에 위치합니다.

- `main.tsx`
  - React 앱과 RecoilRoot 부트스트랩
- `App.tsx`
  - `<Game />` 렌더링
- `components/`, `hooks/`, `store/`
  - 위에서 설명한 구조대로 역할 분리

빌드는 Vite가 담당합니다.

- 빠른 dev 서버
- 어떤 곳에나 배포 가능한 SPA 번들
- 필요한 경우 Figma 내부에 embed UI로 넣을 수도 있음

---

## 10. 공용 타입 및 메시지 계약

타입은 `type.ts`에 모아두어, 위젯과 웹이 동일한 payload 계약을 따르도록 합니다.

```ts
export type PluginMessage =
  | { type: 'READY'; playerId: string }
  | { type: 'UPDATE_PLAYER'; player: Player }
  | { type: 'GAME_OVER'; playerId: string; score: number }
  | { type: 'PING' }
  // ...
```

웹 쪽에서는 대응되는 `PostMessage` 타입을 사용합니다.

현재 구현에서는 `type` 문자열이 여러 곳에서 반복됩니다.  
향후에는 `MESSAGE` 상수 객체와 그 기반의 `PluginMessage` 유니온으로 정리하면 더 안전해집니다.

---

## 11. 테스트 & Storybook

### 11.1. 훅 테스트

`src/hooks/__tests__/`:

- `usePiece.test.ts`
  - 회전/이동/고정 동작 검증
- `useTimer.test.ts`
  - fake timer로 인터벌 동작 검증
- `useFigmaWidget.test.ts`
  - `window.postMessage` / `window.addEventListener`를 mock 하여 메시지 처리와 상태 변경 검증

### 11.2. Storybook & Storyshots

`src/components/`:

- `*.stories.tsx`로
  - `Board`, `Cell`, `Display`, `Button` 등의 대표 상태를 정의
- Storyshots 설정으로 UI 스냅샷을 찍어 회귀 테스트

이 조합 덕분에:

- Figma 없이도 핵심 동작을 검증할 수 있고
- UI 컴포넌트를 단독으로 미리보기/디자인할 수 있습니다.

---

## 12. 빌드 & 환경

- **Vite**: 웹 데모 빌드 (`vite.config.ts`)
- **Storybook**: `.storybook/` 아래 설정
- **Jest** + React Testing Library: 단위/통합 테스트

빌드 모드:

- `BUILD_MODE=DEMO`
  - 웹 데모 모드, Figma 비의존. mock player 사용 가능.
- 그 외
  - Figma 환경을 가정하며, `useGame` 등에서 위젯용 행동 활성화

현재는 훅 내부에서 직접 `process.env.BUILD_MODE`를 읽습니다.  
설정 주입을 명시적으로 하면 테스트/이해가 더 쉬워질 수 있습니다.

---

## 13. 한계점 및 향후 개선 방향

- **CellState 중복 정의**
  - `CellState`가 `type.ts`와 보드 로직 쪽에 약간 다른 형태로 정의됨
  - 하나의 공용 타입으로 통합하면 드리프트를 줄일 수 있음
- **`useBoard` 결합도**
  - 보드 로직이 전역 상태를 직접 다루는 부분이 있음
  - 보드 연산을 더 순수 함수로 분리하면 재사용/테스트성이 좋아짐
- **메시지 타입 문자열**
  - 메시지 `type` 문자열이 위젯/웹/테스트에 중복되어 있음
  - `MESSAGE` 상수 + 기반 `PluginMessage` 유니온 도입으로 안전성 향상 가능
- **환경 처리**
  - `process.env.BUILD_MODE`를 훅 안에서 직접 참조
  - 모드를 인자로 받거나 설정 객체를 주입하면 테스트와 의도 표현에 유리

이 한계점들이 있지만, 전체 아키텍처는 의도적으로 가볍게 설계되어 있습니다.

- 위젯 / 웹 데모 / 공용 게임 로직의 경계가 명확하고
- Recoil + Figma synced state로 상태 관리가 예측 가능하며
- Figma와 브라우저 사이 메시지 브릿지가 테스트 가능한 형태로 구현되어 있습니다.

이 레포는 실제로 플레이 가능한 미니 게임이면서,  
Figma 위젯 + 웹 동반 앱 구조를 간결하게 보여주는 예제로도 활용할 수 있습니다.
