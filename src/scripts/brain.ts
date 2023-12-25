export const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function squareToIndex(square: string,) {
  const file = square.charAt(0).charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square.charAt(1), 10);

  return rank * 8 + file;
}

function indexToSquare(index: number) {
  const file = String.fromCharCode('a'.charCodeAt(0) + index % 8);
  const rank = 8 - Math.floor(index / 8);

  return file + rank;
}

class Move {
  startSquare: string;
  endSquare: string;
  pieceMoved: string;
  pieceCaptured: string;
  isCapture: boolean;
  isEnPassant: boolean;
  isPromotion: boolean;
  isCastle: boolean;

  constructor(startSquare: string, endSquare: string, pieceMoved: string, pieceCaptured: string) {
    this.startSquare = startSquare;
    this.endSquare = endSquare;
    this.pieceMoved = pieceMoved;
    this.pieceCaptured = pieceCaptured;
    this.isCapture = pieceCaptured !== "";
    this.isPromotion = false;
    this.isEnPassant = false;
    this.isCastle = false;

    if (pieceMoved[1] == "P") {
      if (endSquare[1] == (pieceMoved[0] === "w" ? "8" : "1")) {
        this.isPromotion = true;
      }
      else if (endSquare[1] == (pieceMoved[0] === "w" ? "6" : "3") && startSquare[0] != endSquare[0] && pieceCaptured == "") {
        this.isEnPassant = true;
      }
    }

    if (pieceMoved[1] == "K" && startSquare == (pieceMoved[0] == "w" ? "e1" : "e8") && (endSquare == (pieceMoved[0] === "w" ? "c1" : "c8") || endSquare == (pieceMoved[0] == "w" ? "g1" : "g8"))) {
      this.isCastle = true;
    }
  }
}

class GameState {
  board: Array<string>;
  whiteToMove: boolean;
  castling: string;
  enPassant: string;
  halfMoveClock: number;
  fullMoveNumber: number;
  moveLog: Array<Move>;
  enPassantLog: Array<string>;
  castleLog: Array<string>;
  inCheck: boolean;
  validMoves: Array<Move>;
  draw: boolean;
  checkmate: boolean;
  winner: string;
  whiteHuman: boolean;
  blackHuman: boolean;
  gameStart: boolean;

  constructor(fen: string = startingFen) {
    const res = this.loadFen(fen);
    this.board = res.board;
    this.whiteToMove = res.whiteToMove;
    this.castling = res.castling;
    this.enPassant = res.enPassant;
    this.enPassantLog = [res.enPassant];
    this.castleLog = [res.castling];
    this.halfMoveClock = res.halfMoveClock;
    this.fullMoveNumber = res.fullMoveNumber;
    this.moveLog = [];
    this.inCheck = this.isInCheck();
    this.validMoves = this.getValidMoves();
    this.draw = false;
    this.checkmate = false;
    this.winner = "";
    this.whiteHuman = true;
    this.blackHuman = false;
    this.gameStart = false;
  }

  loadFen(fen: string) {
    const boardArray = [];
    const fenParts = fen.split(' ');

    const boardFen = fenParts[0].split('/');

    for (const rank of boardFen) {
      for (const char of rank) {
        if (isNaN(parseInt(char, 10))) {
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

    return {
      board: boardArray,
      whiteToMove: fenParts[1] === 'w',
      castling: fenParts[2],
      enPassant: fenParts[3],
      halfMoveClock: parseInt(fenParts[4]),
      fullMoveNumber: parseInt(fenParts[5]),
    };
  }

  getCurrentFen() {
    let finalFen = ""

    let boardFen = "";
    const toMove = this.whiteToMove ? "w" : "b";
    const castling = this.castling;
    const enPassant = this.enPassant;
    const halfMoveClock = this.halfMoveClock;
    const fullMoveNumber = this.fullMoveNumber;
    for (let i = 0; i < 8; i++) {
      let emptyCount = 0;
      for (let j = 0; j < 8; j++) {
        if (this.board[i * 8 + j] === "") {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            boardFen += emptyCount;
            emptyCount = 0;
          }
          const char = this.board[i * 8 + j];
          if (char[0] == 'w') {
            boardFen += char[1].toUpperCase();
          } else {
            boardFen += char[1].toLowerCase();
          }
        }
      }
      if (emptyCount > 0) {
        boardFen += emptyCount;
      }
      if (i < 7) {
        boardFen += "/";
      }
    }

    finalFen = boardFen + " " + toMove + " " + castling + " " + enPassant + " " + halfMoveClock + " " + fullMoveNumber;

    return finalFen;
  }

  checkSquareUnderAttack(square: string) {
    this.whiteToMove = !this.whiteToMove;
    const opponentMoves = this.getValidMoves();
    this.whiteToMove = !this.whiteToMove;

    for (let i = 0; i < opponentMoves.length; i++) {
      if (opponentMoves[i].endSquare == square) {
        return true;
      }
    }
    return false;
  }

  getValidMoves() {
    let moves: Array<Move> = [];
    const allMoves = this.getAllMoves();

    for (const move of allMoves) {
      this.makeMove(move)
      const kingInCheck = this.isInCheck();
      this.undoMove();

      if (!kingInCheck) {
        moves.push(move);
      }
    }

    moves = moves.filter((move) => !move.isEnPassant || move.endSquare === this.enPassant);

    this.validMoves = moves;

    return moves;
  }

  getAllMoves() {
    let moves = [];
    moves.push(...this.getQueenMoves());
    moves.push(...this.getBishopMoves());
    moves.push(...this.getRookMoves());
    moves.push(...this.getPawnMoves());
    moves.push(...this.getKnightMoves());
    moves.push(...this.getKingMoves());

    return moves;
  }

  getQueenMoves(pieceToFind: string = (this.whiteToMove ? "wQ" : "bQ")) {
    let moves: Array<Move> = [];
    moves.push(...this.getBishopMoves(pieceToFind));
    moves.push(...this.getRookMoves(pieceToFind));
    return moves;
  }

  getBishopMoves(pieceToFind: string = (this.whiteToMove ? "wB" : "bB")) {
    let moves: Array<Move> = [];
    const bishopIndices = this.board
      .map((piece, index) => (piece === pieceToFind ? index : -1))
      .filter((index) => index !== -1);
    bishopIndices.forEach((bishopIndex) => {
      let destinationIndex = bishopIndex + 9;
      while (destinationIndex < 64 && destinationIndex >= 0 && destinationIndex % 8 != 0) {
        const newMove = new Move(
          indexToSquare(bishopIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        );
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove);
        destinationIndex += 9;
      }
      destinationIndex = bishopIndex - 9;
      while (destinationIndex < 64 && destinationIndex >= 0 && destinationIndex % 8 != 7) {
        const newMove = new Move(
          indexToSquare(bishopIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        );
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove);
        destinationIndex -= 9;
      }
      destinationIndex = bishopIndex + 7;
      while (destinationIndex < 64 && destinationIndex >= 0 && destinationIndex % 8 != 7) {
        const newMove = new Move(
          indexToSquare(bishopIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        );
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove);
        destinationIndex += 7;
      }
      destinationIndex = bishopIndex - 7;
      while (destinationIndex < 64 && destinationIndex >= 0 && destinationIndex % 8 != 0) {
        const newMove = new Move(
          indexToSquare(bishopIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        );
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove);
        destinationIndex -= 7;
      }
    });
    return moves;
  }

  getRookMoves(pieceToFind: string = (this.whiteToMove ? "wR" : "bR")) {
    let moves: Array<Move> = [];
    const rookIndices = this.board
      .map((piece, index) => (piece === pieceToFind ? index : -1))
      .filter((index) => index !== -1);
    rookIndices.forEach((rookIndex) => {
      let destinationIndex = rookIndex + 1;
      while (destinationIndex < 64 && destinationIndex >= 0 && destinationIndex % 8 != 0) {
        const newMove = new Move(
          indexToSquare(rookIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        );
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove);
        destinationIndex++;
      }
      destinationIndex = rookIndex - 1;
      while (destinationIndex < 64 && destinationIndex >= 0 && destinationIndex % 8 != 7) {
        const newMove = new Move(
          indexToSquare(rookIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        )
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove)
        destinationIndex--;
      }
      destinationIndex = rookIndex + 8;
      while (destinationIndex < 64 && destinationIndex >= 0) {
        const newMove = new Move(
          indexToSquare(rookIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        )
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove)
        destinationIndex += 8;
      }
      destinationIndex = rookIndex - 8;
      while (destinationIndex < 64 && destinationIndex >= 0) {
        const newMove = new Move(
          indexToSquare(rookIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          this.board[destinationIndex],
        )
        if (this.board[destinationIndex] != "") {
          if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
            moves.push(newMove);
          }
          break;
        }
        moves.push(newMove)
        destinationIndex -= 8;
      }
    });
    return moves
  }

  getPawnMoves(pieceToFind: string = (this.whiteToMove ? "wP" : "bP")) {
    let moves: Array<Move> = [];
    const pawnIndices = this.board
      .map((piece, index) => (piece === pieceToFind ? index : -1))
      .filter((index) => index !== -1);
    pawnIndices.forEach((pawnIndex) => {
      let destinationIndex = pawnIndex + (this.whiteToMove ? -8 : 8);
      if (this.board[destinationIndex] === "") {
        const newMove = new Move(
          indexToSquare(pawnIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          "",
        );
        moves.push(newMove);
      }
      destinationIndex = pawnIndex + (this.whiteToMove ? -9 : 7);
      if (Math.abs(destinationIndex % 8 - pawnIndex % 8) <= 1) {
        if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
          const newMove = new Move(
            indexToSquare(pawnIndex),
            indexToSquare(destinationIndex),
            pieceToFind,
            this.board[destinationIndex],
          );
          moves.push(newMove);
        }
      }
      if (this.board[destinationIndex] == "" && (indexToSquare(destinationIndex) == this.enPassant)) {
        const newMove = new Move(
          indexToSquare(pawnIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          "",
        )
        moves.push(newMove);
      }
      destinationIndex = pawnIndex + (this.whiteToMove ? -7 : 9);
      if (Math.abs(destinationIndex % 8 - pawnIndex % 8) <= 1) {
        if (this.board[destinationIndex][0] == (this.whiteToMove ? "b" : "w")) {
          const newMove = new Move(
            indexToSquare(pawnIndex),
            indexToSquare(destinationIndex),
            pieceToFind,
            this.board[destinationIndex],
          );
          moves.push(newMove);
        }
      }
      if ((this.board[destinationIndex] == "") && (indexToSquare(destinationIndex) == this.enPassant)) {
        const newMove = new Move(
          indexToSquare(pawnIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          (this.whiteToMove ? "b" : "w") + "P",
        )
        moves.push(newMove);
      }
      destinationIndex = pawnIndex + (this.whiteToMove ? -16 : 16);
      if (this.board[destinationIndex + (this.whiteToMove ? 8 : -8)] === "" && this.board[destinationIndex] === "" && pawnIndex >= (this.whiteToMove ? 48 : 8) && pawnIndex <= (this.whiteToMove ? 55 : 15)) {
        const newMove = new Move(
          indexToSquare(pawnIndex),
          indexToSquare(destinationIndex),
          pieceToFind,
          "",
        )
        moves.push(newMove);
      }
    })
    return moves;
  }

  getKnightMoves(pieceToFind: string = (this.whiteToMove ? "wN" : "bN")) {
    let moves: Array<Move> = [];
    const knightIndices = this.board
      .map((piece, index) => (piece === pieceToFind ? index : -1))
      .filter((index) => index !== -1);

    knightIndices.forEach((knightIndex) => {
      const validIndiceChanges = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
      validIndiceChanges.forEach((cord) => {
        const x = cord[0];
        const y = cord[1];
        const destinationRank = Math.floor(knightIndex / 8) + y;
        const destinationFile = knightIndex % 8 + x;

        if (destinationRank >= 0 && destinationRank < 8 && destinationFile >= 0 && destinationFile < 8) {
          const destinationIndex = destinationRank * 8 + destinationFile;
          const landingPiece = this.board[destinationIndex];
          if (landingPiece === "" || landingPiece[0] !== (this.whiteToMove ? "w" : "b")) {
            const pieceMoved = this.whiteToMove ? "wN" : "bN";
            const newMove = new Move(indexToSquare(knightIndex), indexToSquare(destinationIndex), pieceMoved, landingPiece);
            moves.push(newMove);
          }
        }
      });
    });
    return moves;
  }

  getKingMoves(pieceToFind: string = (this.whiteToMove ? "wK" : "bK")) {
    let moves: Array<Move> = [];
    const kingIndex = this.board.indexOf(pieceToFind);
    const validIndiceChanges = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    validIndiceChanges.forEach((cord) => {
      const x = cord[0];
      const y = cord[1];
      const destinationRank = Math.floor(kingIndex / 8) + y;
      const destinationFile = kingIndex % 8 + x;

      if (destinationRank >= 0 && destinationRank < 8 && destinationFile >= 0 && destinationFile < 8) {
        const destinationIndex = destinationRank * 8 + destinationFile;
        const landingPiece = this.board[destinationIndex];

        if (landingPiece === "" || landingPiece[0] !== (this.whiteToMove ? "w" : "b")) {
          const pieceMoved = this.whiteToMove ? "wK" : "bK";
          const newMove = new Move(
            indexToSquare(kingIndex),
            indexToSquare(destinationIndex),
            pieceMoved,
            landingPiece,
          );
          moves.push(newMove);
        }
      }
    });
    if (kingIndex == (this.whiteToMove ? 60 : 4)) {
      if ("" == this.board[kingIndex - 1] && "" == this.board[kingIndex - 2] && "" == this.board[kingIndex - 3] && this.castling.includes(this.whiteToMove ? "Q" : "q")) {
        const newMove = new Move(
          indexToSquare(kingIndex),
          indexToSquare(kingIndex - 2),
          this.whiteToMove ? "wK" : "bK",
          "",
        );
        moves.push(newMove);
      }
      if ("" == this.board[kingIndex + 1] && "" == this.board[kingIndex + 2] && this.castling.includes(this.whiteToMove ? "K" : "k")) {
        const newMove = new Move(
          indexToSquare(kingIndex),
          indexToSquare(kingIndex + 2),
          this.whiteToMove ? "wK" : "bK",
          "",
        );
        moves.push(newMove);
      }
    }
    return moves;
  }

  isInCheck() {
    const enemyColor = this.whiteToMove ? 'b' : 'w';
    const kingIndex = this.board.indexOf(this.whiteToMove ? 'wK' : 'bK');
    const kingStartRow = Math.floor(kingIndex / 8);
    const kingStartCol = kingIndex % 8;

    const rookDirections = [
      [-1, 0], [0, -1], [1, 0], [0, 1],
    ];

    for (const d of rookDirections) {
      const [dx, dy] = d;
      let row = kingStartRow + dx;
      let col = kingStartCol + dy;

      while (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const piece = this.board[row * 8 + col];

        if (piece === '') {
          row += dx;
          col += dy;
        } else {
          if (piece[0] === enemyColor && (piece[1] === 'R' || piece[1] === 'Q')) {
            return true;
          }
          break;
        }
      }
    }

    // Check for diagonal threats (bishops and queens)
    const bishopDirections = [
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    for (const d of bishopDirections) {
      const [dx, dy] = d;
      let row = kingStartRow + dx;
      let col = kingStartCol + dy;

      while (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const piece = this.board[row * 8 + col];

        if (piece === '') {
          row += dx;
          col += dy;
        } else {
          if (piece[0] === enemyColor && (piece[1] === 'B' || piece[1] === 'Q')) {
            return true;
          }
          break;
        }
      }
    }

    // Check for knight threats
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];

    for (const m of knightMoves) {
      const [dx, dy] = m;
      const row = kingStartRow + dx;
      const col = kingStartCol + dy;

      if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const piece = this.board[row * 8 + col];

        if (piece[0] === enemyColor && piece[1] === 'N') {
          return true;
        }
      }
    }

    // Check for pawn threats
    const pawnDirection = this.whiteToMove ? -1 : 1;
    const pawnMoves = [
      [pawnDirection, -1],
      [pawnDirection, 1],
    ];

    for (const pm of pawnMoves) {
      const [dx, dy] = pm;
      const row = kingStartRow + dx;
      const col = kingStartCol + dy;

      if (row >= 0 && row < 8 && col >= 0 && col < 8) {
        const piece = this.board[row * 8 + col];

        if (piece[0] === enemyColor && piece[1] === 'P') {
          return true;
        }
      }
    }

    return false;
  }



  getBestMove() {
    const moves = this.getValidMoves();
    return moves[Math.floor(Math.random() * moves.length)];
  }

  makeMove(move: Move) {
    this.board[squareToIndex(move.startSquare)] = "";
    this.board[squareToIndex(move.endSquare)] = move.pieceMoved;

    this.enPassant = "-";

    if (move.pieceMoved[1] == "P" && Math.abs(parseInt(move.endSquare[1]) - parseInt(move.startSquare[1])) == 2) {
      this.enPassant = move.startSquare[0] + ((parseInt(move.endSquare[1])) + (move.pieceMoved[0] == "w" ? -1 : 1));
    }

    if (move.pieceMoved[1] == "K") {
      this.castling = this.castling.replace((move.pieceMoved[0] == "w" ? "K" : "k"), "");
      this.castling = this.castling.replace((move.pieceMoved[0] == "w" ? "Q" : "q"), "");
    }

    if (move.pieceMoved[1] == "R") {
      if (move.startSquare[0] == "a") {
        this.castling = this.castling.replace((move.pieceMoved[0] == "w" ? "Q" : "q"), "");
      }
      if (move.startSquare[0] == "h") {
        this.castling = this.castling.replace((move.pieceMoved[0] == "w" ? "K" : "k"), "");
      }
    }

    if (move.isEnPassant) {
      this.board[squareToIndex(move.endSquare) + (move.pieceMoved[0] == "w" ? 8 : -8)] = "";
    }

    if (move.isCastle) {
      if (move.endSquare == "c1") {
        this.board[squareToIndex("a1")] = "";
        this.board[squareToIndex("d1")] = "wR";
      }
      else if (move.endSquare == "g1") {
        this.board[squareToIndex("h1")] = "";
        this.board[squareToIndex("f1")] = "wR";
      }
      else if (move.endSquare == "c8") {
        this.board[squareToIndex("a8")] = "";
        this.board[squareToIndex("d8")] = "bR";
      }
      else if (move.endSquare == "g8") {
        this.board[squareToIndex("h8")] = "";
        this.board[squareToIndex("f8")] = "bR";
      }
    }

    if (move.isPromotion) {
      this.board[squareToIndex(move.endSquare)] = move.pieceMoved[0] + "Q";
    }


    if (!move.isCapture && move.pieceMoved[1] != "P") {
      this.halfMoveClock++;
    }
    else {
      this.halfMoveClock = 0;
    }

    if (move.pieceMoved[0] == "b") {
      this.fullMoveNumber += 1;
    }

    if (this.halfMoveClock == 100) {
      this.draw = true;
    }

    this.moveLog.push(move);
    this.enPassantLog.push(this.enPassant);
    this.castleLog.push(this.castling);
  }

  actuallyMakeMove(move: Move) {
    this.makeMove(move);
    this.gameStart = true;

    const oldSquare = document.getElementById(move.startSquare);
    const newSquare = document.getElementById(move.endSquare);

    oldSquare!.innerHTML = "";
    newSquare!.innerHTML = `<img src="/images/pieces/${move.pieceMoved}.png" class="piece-img w-full h-full object-contain">`;


    if (move.isEnPassant) {
      const targetSquare = document.getElementById(move.endSquare[0] + (parseInt(move.endSquare[1]) + (game.whiteToMove ? -1 : -1)));
      console.log(targetSquare);
      targetSquare!.innerHTML = "";
    }
    else if (move.isCastle) {
      if (move.endSquare == "c1") {
        document.getElementById("a1")!.innerHTML = "";
        document.getElementById("d1")!.innerHTML = `<img src="/images/pieces/wR.png" class="piece-img">`;
      }
      else if (move.endSquare == "g1") {
        document.getElementById("h1")!.innerHTML = "";
        document.getElementById("f1")!.innerHTML = `<img src="/images/pieces/wR.png" class="piece-img">`;
      }
      else if (move.endSquare == "c8") {
        document.getElementById("a8")!.innerHTML = "";
        document.getElementById("d8")!.innerHTML = `<img src="/images/pieces/bR.png" class="piece-img">`;
      }
      else if (move.endSquare == "g8") {
        document.getElementById("h8")!.innerHTML = "";
        document.getElementById("f8")!.innerHTML = `<img src="/images/pieces/bR.png" class="piece-img">`;
      }
    }
    else if (move.isPromotion) {
      newSquare!.innerHTML = `<img src="/images/pieces/${move.pieceMoved[0]}Q.png" class="piece-img">`;
    }

    const turnIndicator = document.getElementById("turn-indicator");
    if (!game.whiteToMove) {
      turnIndicator?.classList.add("bg-white");
      turnIndicator?.classList.remove("bg-black");
    }
    else {
      turnIndicator?.classList.remove("bg-white");
      turnIndicator?.classList.add("bg-black");
    }

    this.whiteToMove = !this.whiteToMove;
    const validMoves = this.getValidMoves();

    console.log(move);

    if (validMoves.length == 0) {
      this.gameStart = false;
      if (this.isInCheck()) {
        this.checkmate = true;
        this.winner = this.whiteToMove ? "Black" : "White";
        setTimeout(() => {
          alert(`Checkmate! ${this.winner} wins!`);
        }, 200);
      }
      else {
        this.draw = true;
        setTimeout(() => {
          alert("Draw!");
        }, 200);
      }
    }

  }

  undoMove() {
    const move = this.moveLog.pop();
    this.enPassantLog.pop();
    this.castleLog.pop();
    this.castling = this.castleLog.at(-1) || "KQkq";
    this.enPassant = this.enPassantLog.at(-1) || "-";
    if (!move) return undefined;
    this.board[squareToIndex(move.startSquare)] = move.pieceMoved;
    this.board[squareToIndex(move.endSquare)] = move.pieceCaptured;

    if (move.isEnPassant) {
      const direction = this.whiteToMove ? 1 : -1;
      this.board[squareToIndex(move.endSquare) + direction * 8] = move.pieceCaptured;
    }

    if (move.isCastle) {
      const rookStartSquare = move.endSquare === "c1" || move.endSquare === "c8" ? "a" : "h";
      const rookEndSquare = move.endSquare === "c1" || move.endSquare === "c8" ? "d" : "f";
      const rookType = move.pieceMoved[0].toLowerCase() + "R";
      this.board[squareToIndex(rookStartSquare + move.endSquare[1])] = rookType;
      this.board[squareToIndex(rookEndSquare + move.endSquare[1])] = "";
    }
    return move;
  }

  actuallyUndoMove() {
    const move = this.undoMove();
    if (!move) return;

    const oldSquare = document.getElementById(move.startSquare);
    const newSquare = document.getElementById(move.endSquare);

    oldSquare!.innerHTML = `<img src="/images/pieces/${move.pieceMoved}.png" class="piece-img w-full h-full object-contain">`;
    if (move.pieceCaptured == "") {
      newSquare!.innerHTML = "";
    }
    else {
      newSquare!.innerHTML = `<img src="/images/pieces/${move.pieceCaptured}.png" class="piece-img w-full h-full object-contain">`;
    }

    if (move.isEnPassant) {
      const targetSquare = document.getElementById(move.endSquare[0] + (parseInt(move.endSquare[1]) - (move.pieceMoved[0] == "w" ? 1 : -1)));
      targetSquare!.innerHTML = `<img src="/images/pieces/${move.pieceMoved[0] == "w" ? "b" : "w"}P.png" class="piece-img w-full h-full object-contain">`;
    }

    if (move.isCastle) {
      if (move.pieceMoved[0] == "w") {
        document.getElementById("e1")!.innerHTML = `<img src="/images/pieces/wK.png" class="piece-img w-full h-full object-contain">`;
        if (move.endSquare == "c1") {
          document.getElementById("d1")!.innerHTML = "";
          document.getElementById("c1")!.innerHTML = "";
          document.getElementById("a1")!.innerHTML = `<img src="/images/pieces/wR.png" class="piece-img w-full h-full object-contain">`;
        }
        else {
          document.getElementById("f1")!.innerHTML = "";
          document.getElementById("g1")!.innerHTML = "";
          document.getElementById("h1")!.innerHTML = `<img src="/images/pieces/wR.png" class="piece-img w-full h-full object-contain">`;
        }
      }
      else {
        document.getElementById("e8")!.innerHTML = `<img src="/images/pieces/bK.png" class="piece-img w-full h-full object-contain">`;
        if (move.endSquare == "c8") {
          document.getElementById("d8")!.innerHTML = "";
          document.getElementById("c8")!.innerHTML = "";
          document.getElementById("a8")!.innerHTML = `<img src="/images/pieces/bR.png" class="piece-img w-full h-full object-contain">`;
        }
        else {
          document.getElementById("f8")!.innerHTML = "";
          document.getElementById("g8")!.innerHTML = "";
          document.getElementById("h8")!.innerHTML = `<img src="/images/pieces/bR.png" class="piece-img w-full h-full object-contain">`;
        }
      }
    }

    const turnIndicator = document.getElementById("turn-indicator");
    if (!game.whiteToMove) {
      turnIndicator?.classList.add("bg-white");
      turnIndicator?.classList.remove("bg-black");
    }
    else {
      turnIndicator?.classList.remove("bg-white");
      turnIndicator?.classList.add("bg-black");
    }

    this.whiteToMove = !this.whiteToMove;
  }
}


export let game = new GameState();
game.getValidMoves();


class InputHandler {
  selectedSquare: string;

  constructor() {
    this.selectedSquare = "";
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key == "Escape") {
      if (this.selectedSquare != "") {
        const oldSquare = document.getElementById(this.selectedSquare);
        oldSquare?.classList.remove("bg-amber-200");
      }
      const guides = document.querySelectorAll(".guide");
      guides.forEach((guide) => {
        guide.remove();
      })
      this.selectedSquare = "";
    }

    if (event.key.toLowerCase() == "z") {

      if (this.selectedSquare != "") {
        const oldSquare = document.getElementById(this.selectedSquare);
        oldSquare?.classList.remove("bg-amber-200");
      }

      const guides = document.querySelectorAll(".guide");
      guides.forEach((guide) => {
        guide.remove();
      })

      this.selectedSquare = "";

      game.actuallyUndoMove();

      if ((!game.whiteToMove && !game.blackHuman) || (game.whiteToMove && !game.whiteHuman)) {
        game.actuallyUndoMove();
      }

    }
  }

  handleClick(square: string) {
    if (this.selectedSquare === "" && !game.board[squareToIndex(square)]) {
      return;
    }

    const moves = game.getValidMoves();

    if (this.selectedSquare == "") {
      if (game.board[squareToIndex(square)][0] !== (game.whiteToMove ? "w" : "b")) {
        return;
      }
      this.selectedSquare = square;
      const oldSquare = document.getElementById(square);
      oldSquare?.classList.add("bg-amber-200");

      let guideCircle = document.createElement("div");
      guideCircle.classList.add("guide", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2", "w-1/3", "aspect-square", "bg-black/30", "rounded-full");

      moves.forEach((move) => {
        if (move.startSquare === square) {
          const guideCircle = document.createElement("div");
          guideCircle.classList.add("guide", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2", "w-1/3", "aspect-square", "bg-black/30", "rounded-full");
          const newSquare = document.getElementById(move.endSquare);
          newSquare?.appendChild(guideCircle);
        }
      });
    } else {

      const selectedPiece = game.board[squareToIndex(this.selectedSquare)];
      const currentPiece = game.board[squareToIndex(square)];

      const oldSquare = document.getElementById(this.selectedSquare);

      const guides = document.querySelectorAll(".guide");
      guides.forEach((guide) => {
        guide.remove();
      })

      oldSquare?.classList.remove("bg-amber-200");

      if (selectedPiece[0] == currentPiece[0]) {
        this.selectedSquare = square;
        const oldSquare = document.getElementById(square);
        oldSquare?.classList.add("bg-amber-200");

        let guideCircle = document.createElement("div");
        guideCircle.classList.add("guide", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2", "w-1/3", "aspect-square", "bg-black/30", "rounded-full");

        moves.forEach((move) => {
          if (move.startSquare === square) {
            const guideCircle = document.createElement("div");
            guideCircle.classList.add("guide", "absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2", "w-1/3", "aspect-square", "bg-black/30", "rounded-full");
            const newSquare = document.getElementById(move.endSquare);
            newSquare?.appendChild(guideCircle);
          }
        })
        return;
      }

      const landindSquare = document.getElementById(square);
      const pieceCaptured = landindSquare?.querySelector("img")?.getAttribute("src")?.split("/").pop()?.split(".")[0] || "";
      const startSquare = document.getElementById(this.selectedSquare);
      const pieceMoved = startSquare?.querySelector("img")?.getAttribute("src")?.split("/").pop()?.split(".")[0] || "";


      const move = new Move(this.selectedSquare, square, pieceMoved, pieceCaptured);

      let foundMove = false;

      moves.forEach((m) => {
        if (m.startSquare == move.startSquare && m.endSquare == move.endSquare) {
          foundMove = true;
        }
      })

      if (foundMove) {
        game.actuallyMakeMove(move)
        if ((!game.blackHuman && !game.whiteToMove) || (!game.whiteHuman && game.whiteToMove)) {
          let aiMove = game.getBestMove()
          while (!aiMove) {
            aiMove = game.getBestMove()
          }
          game.actuallyMakeMove(aiMove)
        }
      }
      this.selectedSquare = "";
    }
  }
}

while (game.gameStart) {

}

export let inputHandler = new InputHandler();
