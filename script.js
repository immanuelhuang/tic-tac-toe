const cssVars = getComputedStyle(document.documentElement);

const X = -1;
const O = 1;
const _ = 0;

const PvP = 0;
const PvAI = 1;
const PvAIH = 2;

const playerFactory = (name, isAI, counter, isTurn) => {
  this.isTurn = isTurn;

  const renderPlayer = () => {
    const playerDiv = counter === X
        ? document.querySelector("#player1-container")
        : document.querySelector("#player2-container");
    if (isAI) {
      playerDiv.querySelector("h2").innerHTML = "AI";
    } else {
      playerDiv.querySelector("h2").innerHTML = name === "" ? "Player" : name;
    }
    if (!isTurn) {
      playerDiv.classList.add("not-turn");
    }
    else {
      playerDiv.classList.remove("not-turn");
    }
  }

  const switchTurn = () => {isTurn = !isTurn};

  return {renderPlayer, switchTurn};
}

const board = (() => {
  const state = [ _ , _ , _ , _ , _ , _ , _ , _ , _ ];

  const getState = () => state;

  const renderBoard = () => {
    const gameContainer = document.querySelector("#game-container");
    gameContainer.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const button = document.createElement("button");
      button.value = i;
      if (0 <= i && i <= 2) button.classList.add("top-button");
      if (6 <= i && i <= 8) button.classList.add("bottom-button");
      if (i % 3 === 0) button.classList.add("left-button");
      if (i % 3 === 2) button.classList.add("right-button");
      if (state[i] === X) {
        button.classList.add("X-button");
        button.disabled = true;
      } else if (state[i] === O) {
        button.classList.add("O-button");
        button.disabled = true;
      } else {
        button.classList.add("_-button");
      }
      gameContainer.appendChild(button);
    }
  }

  return {
    getState,
    renderBoard,
  };
})();

const game = (() => {
  const state = board.getState();

  let playerTurn = _;
  let player1, player2;

  let mode;

  const start = (p1, p2) => {
    for (let i = 0; i < state.length; i++) state[i] = _;
    playerTurn = Math.floor(Math.random() * 2) === 0 ? X : O;
    player1 = playerFactory(p1.name, p1.isAI, p1.counter, playerTurn === X);
    player2 = playerFactory(p2.name, p2.isAI, p2.counter, playerTurn === O);
    renderPlayers();
    board.renderBoard();
  };

  const makeMove = (space) => {
    if (playerTurn === X) state[space] = X;
    else state[space] = O;
    board.renderBoard();
    return checkResult(space);
  }

  function checkResult(space) {
    const row = Math.floor(space / 3) * 3;
    const col = space % 3;

    let rowSum = state[row] + state[row + 1] + state[row + 2];
    let colSum = state[col] + state[col + 3] + state[col + 6];
    let diagSum = state[0] + state[4] + state[8];
    let antiDiagSum = state[2] + state[4] + state[6];

    if (rowSum === 3 || colSum === 3 || diagSum === 3 || antiDiagSum === 3) {
      return {
        winner: X,
        row: [rowSum === 3, row],
        col: [colSum === 3, col],
        diag: diagSum === 3,
        antiDiag: antiDiagSum === 3,
      }
    } else if (rowSum === -3 || colSum === -3 || diagSum === -3 || antiDiagSum === -3) {
      return {
        winner: O,
        row: [rowSum === -3, row],
        col: [colSum === -3, col],
        diag: diagSum === -3,
        antiDiag: antiDiagSum === -3,
      }
    } else {
      if (!state.includes(_)) return {winner: _};
      playerTurn = playerTurn === X ? O : X;
      switchTurns();
      renderPlayers();
      return {winner: undefined};
    }
  }

  function renderPlayers() {
    player1.renderPlayer();
    player2.renderPlayer();
  }

  function switchTurns() {
    player1.switchTurn();
    player2.switchTurn();
  }

  return {
    start,
    makeMove,
    mode,
    player1,
  };
})();

document.querySelector("#game-container").addEventListener("click", (e) => {
  if (e.target.hasAttribute("value")) {
    if (game.makeMove(e.target.value).winner !== undefined) {
      document.querySelector("#overlay").style.display = "block";
    }
  }
});

document.querySelector("#mode-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn")) {
    document.querySelectorAll(".btn").forEach(button => {
      button.classList.remove("btn-clicked");
    });
    document.querySelector("#start-container button").disabled = false;
    e.target.classList.add("btn-clicked");
    game.mode = e.target.value;
    if (e.target.value != PvP) {
      document.querySelector("#player2-name").disabled = true;
    } else {
      document.querySelector("#player2-name").disabled = false;
    }
  } else {
    document.querySelector("#start-container button").disabled = true;
  }
});

document.querySelector("#start-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn")) {
    document.querySelector("#entry").style.display = "none";
    game.start(
      {name: document.querySelector("#player1-name").value, isAI:false, counter:X},
      {name: document.querySelector("#player1-name").value, isAI: game.mode !== PvP, counter:O}
    );
  }
});

document.querySelector("#overlay").addEventListener("click", (e) => {
  e.target.style.display = "none";
  document.querySelector("#entry").style.display = "block";
});
