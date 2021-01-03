const gameBoard = (() => {
  const X = -1;
  const O = 1;
  const _ = 0;

  const boardState = [ _ , _ , _ , _ , _ , _ , _ , _ , _ ];

  const clearBoard = () => {
    for (let i = 0; i < boardState.length; i++) boardState[i] = _;
  };

  const checkWin = (space) => {
    const row = Math.floor(space / 3) * 3;
    const col = space % 3;

    let rowSum = boardState[row] + boardState[row + 1] + boardState[row + 2];
    let colSum = boardState[col] + boardState[col + 3] + boardState[col + 6];
    let diagSum = boardState[0] + boardState[4] + boardState[8];
    let antiDiagSum = boardState[2] + boardState[4] + boardState[6];

    console.table({rowSum, colSum, diagSum, antiDiagSum});
    if (rowSum === 3 || colSum === 3 || diagSum === 3 || antiDiagSum === 3) {
      return {
        winner: X,
        row: [rowSum === 3, row],
        col: [colSum === 3, col],
        diag: diagSum === 3,
        antiDiag: antiDiagSum === 3,
      }
    }
    else if (rowSum === -3 || colSum === -3 || diagSum === -3 || antiDiagSum === -3) {
      console.log("O WINS");
      return {
        winner: O,
        row: [rowSum === -3, row],
        col: [colSum === -3, col],
        diag: diagSum === -3,
        antiDiag: antiDiagSum === -3,
      }
    }
    else {
      return {winner: undefined};
    }
  }

  const makeMove = (isX, space) => {
    if (isX) boardState[space] = X;
    else boardState[space] = O;

    return checkWin(space);
  }

  return {boardState, clearBoard, makeMove};

})();
