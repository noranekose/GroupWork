/**
 * ◎×ゲーム（コンテキストエンジニアリング比較デモ用）
 *
 * 責務の分け方:
 * - ゲームロジック: 盤面・勝敗など「ルール」だけを扱う（DOMを知らない）
 * - 状態管理: 現在のプレイ状態をまとめて保持し、更新の入口を限定する
 * - UI: DOMの生成・更新だけを担当する（ルールを持たない）
 */

// -----------------------------------------------------------------------------
// 定数（マジックナンバー禁止：意味のある名前で意図を固定する）
// -----------------------------------------------------------------------------

/** 盤の一辺のマス数（将来 N×N に拡張する場合はここが起点になる） */
const BOARD_DIMENSION = 3;

/** 盤面のセル数 */
const CELL_COUNT = BOARD_DIMENSION * BOARD_DIMENSION;

/** 空のマスを表す値 */
const EMPTY_MARK = "";

/** 先手・後手のマーク */
const PLAYER_MARKS = Object.freeze({
  FIRST: "◎",
  SECOND: "×",
});

/** 勝敗がついたライン（インデックスの組。3×3固定の定義） */
const WIN_LINE_INDICES = Object.freeze([
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]);

/** UIメッセージのテンプレート（文言変更が1か所で済む） */
const MESSAGES = Object.freeze({
  turn: (mark) => `現在の手番：${mark}`,
  win: (mark) => `${mark} の勝ち！`,
  draw: () => "引き分けです！",
});

// -----------------------------------------------------------------------------
// ゲームロジック（純粋関数：同じ入力なら同じ出力）
// -----------------------------------------------------------------------------

/** 空の盤面（長さ CELL_COUNT の配列）を作る */
function createEmptyBoard() {
  return Array.from({ length: CELL_COUNT }, () => EMPTY_MARK);
}

/** セルが空か */
function isCellEmpty(board, index) {
  return board[index] === EMPTY_MARK;
}

/** 盤面がすべて埋まっているか */
function isBoardFull(board) {
  return board.every((mark) => mark !== EMPTY_MARK);
}

/**
 * 勝利ラインを探す
 * @returns {{ line: number[]; winnerMark: string } | null}
 */
function findWinningLine(board) {
  for (const line of WIN_LINE_INDICES) {
    const [a, b, c] = line;
    const m = board[a];
    if (m !== EMPTY_MARK && m === board[b] && m === board[c]) {
      return { line, winnerMark: m };
    }
  }
  return null;
}

/** 次のプレイヤーに交代 */
function getNextPlayerMark(currentMark) {
  return currentMark === PLAYER_MARKS.FIRST
    ? PLAYER_MARKS.SECOND
    : PLAYER_MARKS.FIRST;
}

/**
 * 手を指せるか（ゲームが進行中で、空マスであること）
 * ※CPU対戦などを足すときも、この判定を再利用しやすい
 */
function canPlaceMark({ board, phase }, index) {
  if (phase !== "playing") return false;
  if (index < 0 || index >= CELL_COUNT) return false;
  return isCellEmpty(board, index);
}

// -----------------------------------------------------------------------------
// 状態管理（アプリ状態の更新は基本的にここ経由に寄せる）
// -----------------------------------------------------------------------------

/**
 * @typedef {Object} GameState
 * @property {string[]} board
 * @property {string} currentPlayerMark
 * @property {'playing'|'finished'} phase
 * @property {'none'|'win'|'draw'} outcome
 * @property {string} [winnerMark]
 * @property {number[]} [winningLine]
 */

/** @type {GameState} */
let gameState = createInitialState();

/** 初期状態を作る（リセット時も同じ定義を使う） */
function createInitialState() {
  return {
    board: createEmptyBoard(),
    currentPlayerMark: PLAYER_MARKS.FIRST,
    phase: "playing",
    outcome: "none",
    winnerMark: undefined,
    winningLine: undefined,
  };
}

/** 状態を初期化して返す（状態そのものの差し替え） */
function resetGameState() {
  gameState = createInitialState();
  return gameState;
}

/**
 * マスを選択したときの状態遷移
 * @returns {{ ok: true; state: GameState } | { ok: false; reason: string }}
 */
function applyHumanMove(index) {
  if (!canPlaceMark(gameState, index)) {
    return { ok: false, reason: "illegal_move" };
  }

  const nextBoard = [...gameState.board];
  nextBoard[index] = gameState.currentPlayerMark;

  const win = findWinningLine(nextBoard);
  if (win) {
    gameState = {
      board: nextBoard,
      currentPlayerMark: gameState.currentPlayerMark,
      phase: "finished",
      outcome: "win",
      winnerMark: win.winnerMark,
      winningLine: win.line,
    };
    return { ok: true, state: gameState };
  }

  if (isBoardFull(nextBoard)) {
    gameState = {
      board: nextBoard,
      currentPlayerMark: gameState.currentPlayerMark,
      phase: "finished",
      outcome: "draw",
      winnerMark: undefined,
      winningLine: undefined,
    };
    return { ok: true, state: gameState };
  }

  const nextPlayer = getNextPlayerMark(gameState.currentPlayerMark);
  gameState = {
    board: nextBoard,
    currentPlayerMark: nextPlayer,
    phase: "playing",
    outcome: "none",
    winnerMark: undefined,
    winningLine: undefined,
  };
  return { ok: true, state: gameState };
}

// -----------------------------------------------------------------------------
// UI（DOM）：描画とイベント結線のみ
// -----------------------------------------------------------------------------

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetButton = document.getElementById("resetButton");

/** 現在の状態に応じてステータス文言を決める */
function getStatusText(state) {
  if (state.phase === "finished") {
    if (state.outcome === "win" && state.winnerMark) {
      return MESSAGES.win(state.winnerMark);
    }
    if (state.outcome === "draw") {
      return MESSAGES.draw();
    }
  }
  return MESSAGES.turn(state.currentPlayerMark);
}

/** 勝利マスかどうか（見た目用） */
function isWinningCell(state, index) {
  if (!state.winningLine) return false;
  return state.winningLine.includes(index);
}

/** 盤面の描画（データ駆動：状態 → DOM） */
function renderBoard(state) {
  boardElement.innerHTML = "";

  for (let i = 0; i < CELL_COUNT; i += 1) {
    const cellButton = document.createElement("button");
    cellButton.type = "button";
    cellButton.className = "cell";
    cellButton.textContent = state.board[i];
    cellButton.setAttribute("aria-label", `マス ${i + 1}`);

    const gameIsOver = state.phase === "finished";
    const occupied = state.board[i] !== EMPTY_MARK;
    cellButton.disabled = gameIsOver || occupied;

    if (isWinningCell(state, i)) {
      cellButton.classList.add("cell--win");
    }

    cellButton.addEventListener("click", () => {
      const result = applyHumanMove(i);
      if (!result.ok) return;
      render(gameState);
    });

    boardElement.appendChild(cellButton);
  }
}

function renderStatus(state) {
  statusElement.textContent = getStatusText(state);
}

/** 画面全体の再描画 */
function render(state) {
  renderStatus(state);
  renderBoard(state);
}

function bindReset() {
  resetButton.addEventListener("click", () => {
    resetGameState();
    render(gameState);
  });
}

function init() {
  bindReset();
  render(gameState);
}

init();
