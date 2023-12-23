// Funcs for init
function fenToArray(fen: string) {
  const boardArray = [];
  const fenParts = fen.split(' ')[0].split('/');

  for (const rank of fenParts) {
    for (const char of rank) {
      if (isNaN(parseInt(char, 10))) {
        // If it's a piece
        const pieceMapping = {
          'R': 'wR',
          'N': 'wN',
          'B': 'wB',
          'Q': 'wQ',
          'K': 'wK',
          'P': 'wP',
          'r': 'bR',
          'n': 'bN',
          'b': 'bB',
          'q': 'bQ',
          'k': 'bK',
          'p': 'bP',
        };

        const mappedPiece = pieceMapping[char as keyof typeof pieceMapping] || char;
        boardArray.push(mappedPiece);
      } else {
        for (let i = 0; i < parseInt(char, 10); i++) {
          boardArray.push('');
        }
      }
    }
  }

  return boardArray;
}

function squareToIndex(square: string,) {
  const file = square.charAt(0).charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square.charAt(1), 10);

  return rank * 8 + file;
}

// Vars for init
const startingFen = "rnbqkbnr/pppppppp/8/2P2B2/1B2P3/1P1N1PN1/P2Q2PP/R3K2R w KQkq - 0 1";

// Init
export let board = fenToArray(startingFen);
let userFirstClick = true;
let selectedSquare = "";
let selectedPiece = "";
let whiteToMove = true;

let validSquares = [];
let validPawnSquares: string[] = [];

// Logic

const generatePawnMoves = (square: string) => {
  const validSquares = [];
  const squareIndex = squareToIndex(square);
  const piece = board[squareIndex];
  const pieceColor = piece[0];
  if (pieceColor == 'w') {
    if (board[squareToIndex(square[1] + 1)])
      validSquares.push(square[0] + (parseInt(square[1]) + 1));
    if (parseInt(square[1]) == 2) {
      validSquares.push(square[0] + (parseInt(square[1]) + 2));
    }
  } else {
  }

  validPawnSquares.push(...validSquares);
}


// Helper Funcs
export const handleClick = (square: string) => {

  if (selectedSquare == square) {
    return;
  }

  if (userFirstClick) {

    selectedPiece = board[squareToIndex(square)];

    console.log(square, selectedPiece);

    if (selectedPiece == "") {
      return;
    }

    const squareElement = document.getElementById(square);
    squareElement?.classList.add('bg-amber-200');
    selectedSquare = square;

    if (selectedPiece[1] == 'P') {
      generatePawnMoves(square);
      validPawnSquares?.forEach(square => {
        const squareElement = document.getElementById(square);
        const circle = document.createElement("div");
        circle.classList.add("move-circle", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2", "rounded-full", "w-1/3", "aspect-square", "bg-black/30");
        squareElement?.appendChild(circle);
      })
    }

    // Show available moves

  } else {

    const guides = document.querySelectorAll(".move-circle");
    guides.forEach(guide => guide.remove());

    const oldSquare = document.getElementById(selectedSquare);
    oldSquare?.classList.remove('bg-amber-200');

    if (selectedPiece[1] == "P" && !validPawnSquares.includes(square)) {
      selectedPiece = "";
      selectedSquare = "";
      userFirstClick = true;
      validPawnSquares = [];
      return;
    }

    validPawnSquares = [];

    board[squareToIndex(square)] = selectedPiece;
    board[squareToIndex(selectedSquare)] = "";

    oldSquare?.querySelectorAll(".piece-img").forEach(img => img.remove());
    const newSquare = document.getElementById(square);
    newSquare?.querySelectorAll(".piece-img").forEach(img => img.remove());
    const url = `/images/pieces/${selectedPiece}.png`;
    const img = document.createElement("img");
    img.setAttribute("class", "piece-img");
    img.setAttribute("src", url);
    newSquare?.appendChild(img);
  }

  userFirstClick = !userFirstClick;
}
