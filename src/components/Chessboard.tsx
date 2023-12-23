import * as brain from "../scripts/brain.ts";
import { useState, useEffect } from "react";

export default function Chessboard() {

  const squares = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1", "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"];
  const squareElements = [];
  const squareColors = ["bg-[#779556]", "bg-[#ebecd0]"];
  let squareColor = 0;
  let rounded = "";
  const pieceImages = {
    "k": "/images/pieces/wK.png",
    "q": "/images/pieces/wQ.png",
    "r": "/images/pieces/wR.png",
    "b": "/images/pieces/wB.png",
    "n": "/images/pieces/wN.png",
    "p": "/images/pieces/wP.png",
    "K": "/images/pieces/bK.png",
    "Q": "/images/pieces/bQ.png",
    "R": "/images/pieces/bR.png",
    "B": "/images/pieces/bB.png",
    "N": "/images/pieces/bN.png",
    "P": "/images/pieces/bP.png",
  }
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  const loadFen = (fen: string) => {
    const board = document.getElementById("board");
    if (!board) return;

    const ranks = fen.split(' ')[0].split('/');
    const squares = board.querySelectorAll('.square');

    let squareIndex = 0;

    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];

      for (let j = 0; j < rank.length; j++) {
        const piece = rank[j];
        let num = parseInt(piece);
        if (!isNaN(num)) {
          squareIndex += num;
        } else {
          const square = squares[squareIndex];
          square.innerHTML = `<img className="piece absolute top-0 left-0 w-full h-full z-50" src="${pieceImages[piece as keyof typeof pieceImages]}" alt="${piece}">`;
          squareIndex++;
        }
      }
    }
  };

  useEffect(() => {
    loadFen(fen);
  }, [fen]);

  for (let i = 0; i < squares.length; i++) {
    const square = squares[i];
    squareColor ^= 1;
    if (i % 8 === 0) {
      squareColor ^= 1;
    }

    switch (i) {
      case 0:
        rounded = "rounded-bl";
        break;
      case 7:
        rounded = "rounded-br";
        break;
      case 56:
        rounded = "rounded-tl";
        break;
      case 63:
        rounded = "rounded-tr";
        break;
      default:
        rounded = "";
    }

    squareElements.push(
      <button tabIndex={-1} key={square} id={square} onClick={() => brain.handleClick(square)} className={`square betterhover:hover:bg-opacity-50 relative w-[12.5%] aspect-square grid place-items-center ${squareColors[squareColor]} ${rounded}`}>
      </button>
    );
  }

  return (
    <section id="board" className="w-full aspect-square bg-neutral-700 flex flex-wrap-reverse rounded overflow-hidden">
      {squareElements}
    </section>
  );
}
