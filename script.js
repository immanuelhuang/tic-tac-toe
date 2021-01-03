const X = -1;
const O = 1;
const _ = 0;

const playerFactory = (name, isAI, counter, isTurn) => {
  this.isTurn = isTurn;

  const renderPlayer = () => {
    const playerDiv = counter === X
        ? document.querySelector("#player1-container")
        : document.querySelector("#player2-container");
    playerDiv.querySelector("h2").innerHTML = name;
    if (!isTurn) {
      playerDiv.classList.add("no-color");
    }
    else {
      playerDiv.classList.remove("no-color");
    }
  }

  const switchTurn = () => {isTurn = !isTurn};

  return {renderPlayer, switchTurn};
}

const board = (() => {
  const state = [ _ , _ , _ , _ , _ , _ , _ , _ , _ ];

  const getState = () => state;

  const printBoard = () => {
    console.log(state[0] + " " + state[1] + " " + state[2] + "\n" +
                state[3] + " " + state[4] + " " + state[5] + "\n" +
                state[6] + " " + state[7] + " " + state[8])
  }

  const renderBoard = () => {
    const gameContainer = document.querySelector("#game-container");
    gameContainer.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const button = document.createElement("button");
      button.value = i;
      if (state[i] === X) {
        button.style["background-color"] = "red";
        button.disabled = true;
      } else if (state[i] === O) {
        button.style["background-color"] = "blue";
        button.disabled = true;
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
  };
})();

document.querySelector("#game-container").addEventListener("click", (e) => {
  if (e.target.hasAttribute("value")) {
    if (game.makeMove(e.target.value).winner !== undefined) {
      // insert overlay for play again
      console.log("GAME DONE");
    }
  }
});

game.start(
  {name:"Immanuel", isAI:false, counter:X},
  {name:"AI", isAI:true, counter:O}
);
