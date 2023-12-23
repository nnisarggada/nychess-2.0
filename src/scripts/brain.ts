// Funcs for init
function fenToArray(fen: string) {
  const boardArray = [];
  const fenParts = fen.split(' ')[0].split('/');

  for (const rank of fenParts) {
    for (const char of rank) {
      if (isNaN(parseInt(char, 10))) {
        // If it's a piece
        const pieceMapping = {
          'r': 'wR',
          'n': 'wN',
          'b': 'wB',
          'q': 'wQ',
          'k': 'wK',
          'p': 'wP',
          'R': 'bR',
          'N': 'bN',
          'B': 'bB',
          'Q': 'bQ',
          'K': 'bK',
          'P': 'bP',
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

// Vars for init
const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Init
let board = fenToArray(startingFen);
let userClicksLeft = 0;
let selectedSquare = "";
let selectedPiece = "";

// Helper Funcs
export const handleClick = (square: string) => {

  const file = square.charAt(0).charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square.charAt(1), 10);

  if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
    const index = rank * 8 + file;
    const pieceOnSquare = board[63 - index];

    userClicksLeft ^= 1;

    if (userClicksLeft !== 0 || selectedSquare === square) {
      selectedSquare = square;
      selectedPiece = pieceOnSquare;
      console.log(selectedPiece);
      // Show available moves

    } else {
      // Verify valid move
      const oldSquare = document.getElementById(selectedSquare);
      const imgElement = oldSquare?.querySelector("img");
      oldSquare?.removeChild(imgElement!);
      const newSquare = document.getElementById(square);
      const newImg = newSquare?.querySelector("img");
      const src = `/images/pieces/${selectedPiece}.png`;
      if (newImg) {
        newImg.setAttribute("src", src);
      }
      else {
        const createdImg = document.createElement("img");
        createdImg.setAttribute("src", src);
        newSquare?.appendChild(createdImg);
      }
      selectedSquare = "";
      selectedPiece = "";
      console.log(selectedPiece);
    }

  }
}
