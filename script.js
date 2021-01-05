const X = -1;
const player1Turn = -1;
const O = 1;
const player2Turn = 1;
const _ = 0;

const PvP = 0;
const PvAI = 1;
const PvAIH = 2;

const playerFactory = (name, isAI, counter, isTurn) => {
  this.isTurn = isTurn;
  this.name = name;

  const render  = () => {
    const playerDiv = counter === X
        ? document.querySelector("#player1-container")
        : document.querySelector("#player2-container");
    if (isAI) {
      name = "AI";
    } else {
      name = name === "" ? "Player" : name;
    }
    playerDiv.querySelector("h2").textContent = name;
    if (!isTurn) {
      playerDiv.classList.add("not-turn");
    }
    else {
      playerDiv.classList.remove("not-turn");
    }
  }

  const switchTurn = () => {isTurn = !isTurn};
  const getName = () => name;
  const getIsAI = () => isAI;

  return {
    render,
    switchTurn,
    getName,
    getIsAI,
  };
}

const game = (() => {
  const board = [ _ , _ , _ , _ , _ , _ , _ , _ , _ ];
  let playerTurn;
  let player1, player2;
  let mode;

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
      if (board[i] === X) {
        button.classList.add("X-button");
        button.disabled = true;
      } else if (board[i] === O) {
        button.classList.add("O-button");
        button.disabled = true;
      } else {
        button.classList.add("_-button");
      }
      gameContainer.appendChild(button);
    }
  }

  const start = (p1, p2) => {
    for (let i = 0; i < board.length; i++) board[i] = _;
    playerTurn = Math.floor(Math.random() * 2) === 0 ? X : O;
    player1 = playerFactory(p1.name, p1.isAI, p1.counter, playerTurn === X);
    player2 = playerFactory(p2.name, p2.isAI, p2.counter, playerTurn === O);
    if (mode === PvP || playerTurn === X) {
      renderPlayers();
    }
    else if (playerTurn === O) {
      renderPlayers();
      document.querySelectorAll("._-button").forEach(button => {
        button.disabled = true;
      });
      setTimeout(function() {
        game.makeMove();
        document.querySelectorAll("._-button").forEach(button => {
          button.disabled = false;
        });
        renderPlayers();
      }, 500);
    }
  };

  const makeMove = (space = -1) => {
    if (space !== -1) {
      if (playerTurn === X) board[space] = X;
      else board[space] = O;
    }
    else if (mode === PvAI || (mode === PvAIH && !board.includes(X) && !board.includes(O))) {
      space = Math.floor(Math.random() * 9);
      while (board[space] !== _) {
        space = Math.floor(Math.random() * 9);
      }
      board[space] = O;
    }
    else {
      board[minimax([...board], true).index] = O;
    }
    renderBoard();
    const res = checkResult();
    if(res.winner === undefined) {
      playerTurn = playerTurn === player1Turn ? player2Turn : player1Turn;
      switchTurns();
      renderPlayers();
    }
    return res;
  }

  function max(arr) {
    let par = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== undefined) {
        par.push(arr[i]);
      }
    }
    return Math.max(...par);
  }
  function min(arr) {
    let par = []
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== undefined) {
        par.push(arr[i]);
      }
    }
    return Math.min(...par);
  }

  function minimax(board, isAITurn) {
    //console.log(isAITurn ? player2Turn : player1Turn);
    if (checkResult(board, isAITurn ? player2Turn : player1Turn).winner === "tie") {
      //console.log("TIE");
      return {value: 0};
    }
    else if (checkResult(board, isAITurn ? player2Turn : player1Turn).winner === player1) {
      //console.log("PLAYER WINS");
      return {value: 10};
    }
    else if (checkResult(board, isAITurn ? player2Turn : player1Turn).winner === player2) {
      //console.log("COMPUTER WINS");
      return {value: -10};
    }

    const scores = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    for (let i = 0; i < 9; i++) {
      if (board[i] === _) {
        board[i] = isAITurn ? O : X;
        scores[i] = minimax([...board], !isAITurn).value;
        board[i] = _;
      }
    }
    //console.log(board);
    //console.table({
        //value: isaiturn ? min(scores) : max(scores),
        //index: isAITurn ? scores.indexOf(min(scores)) : scores.indexOf(max(scores)),
    //});

    return {
      value: isAITurn ? max(scores) : min(scores),
      index: isAITurn ? scores.indexOf(max(scores)) : scores.indexOf(min(scores)),
    }
  }

  function checkResult(board = game.getBoard(), playerTurn = game.getPlayerTurn()) {
    let winningRow, winningCol, winningDiag, winningAntiDiag;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(board[i * 3] + board[i * 3 + 1] + board[i * 3 + 2]) === 3) winningRow = i;
      if (Math.abs(board[i] + board[i + 3] + board[i + 6]) === 3) winningCol = i;
    }
    winningDiag = Math.abs(board[0] + board[4] + board[8]) === 3;
    winningAntiDiag = Math.abs(board[2] + board[4] + board[6]) === 3;
    if (winningRow !== undefined || winningCol !== undefined || winningDiag || winningAntiDiag) {
      return {
        winner:playerTurn === player1Turn ? player1 : player2,
        winningRow,
        winningCol,
        winningDiag,
        winningAntiDiag,
      }
    }
    else {
      if (!board.includes(_)) {
        return {winner: "tie"};
      }
      return {winner: undefined};
    }
  }

  const getMode = () => mode;
  const setMode = m => mode = m;
  const getBoard = () => board;
  const getPlayerTurn = () => playerTurn;

  function renderPlayers() {
    player1.render();
    player2.render();
    renderBoard();
  }

  function switchTurns() {
    player1.switchTurn();
    player2.switchTurn();
  }

  return {
    start,
    makeMove,
    getMode,
    setMode,
    player1,
    getBoard,
    getPlayerTurn,
  };
})();

document.querySelector("#game-container").addEventListener("click", (e) => {
  if (e.target.hasAttribute("value")) {
    let results = game.makeMove(e.target.value);
    resultDisplay(results);
    if (game.getMode() !== PvP && results.winner === undefined) {
      document.querySelectorAll("._-button").forEach(button => {
        button.disabled = true;
      });
      setTimeout(function() {
        results = game.makeMove();
        resultDisplay(results);
        document.querySelectorAll("._-button").forEach(button => {
          button.disabled = false;
        });
      }, 500);
    }
  }
});

function resultDisplay(results) {
  if (results.winner === "tie") {
    document.querySelector("#overlay").style.display = "flex";
    document.querySelector("#overlay h1").textContent = `It's a tie.`;
  }
  else if (results.winner !== undefined) {
    document.querySelector("#overlay").style.display = "flex";
    document.querySelector("#overlay h1").textContent = `${results.winner.getName()} won!`;
  }
}

document.querySelector("#mode-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn")) {
    document.querySelectorAll(".btn").forEach(button => {
      button.classList.remove("btn-clicked");
    });
    document.querySelector("#start-container button").disabled = false;
    e.target.classList.add("btn-clicked");
    game.setMode(parseInt(e.target.value));
    if (e.target.value != PvP) {
      document.querySelector("#player2-name").disabled = true;
    } else {
      document.querySelector("#player2-name").disabled = false;
    }
  }
});

document.querySelector("#start-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("btn")) {
    document.querySelector("#entry").style.display = "none";
    game.start(
      {name: document.querySelector("#player1-name").value, isAI: false, counter:X},
      {name: document.querySelector("#player2-name").value, isAI: game.getMode() !== PvP, counter:O}
    );
  }
});

document.querySelector("#overlay").addEventListener("click", (e) => {
  e.target.style.display = "none";
  document.querySelector("#entry").style.display = "block";
});
