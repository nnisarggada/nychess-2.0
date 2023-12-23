import * as brain from "../scripts/brain.ts";
import { useState, useEffect } from "react";

export default function Chessboard() {

  const squares = [
    "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
    "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
    "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
    "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
    "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
    "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
    "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
    "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1",
  ];

  const squareElements = [];
  const squareColors = ["bg-[#779556]", "bg-[#ebecd0]"];
  let squareColor = 0;
  let rounded = "";

  const board = brain.board;

  const loadBoard = (boardArray: Array<string>) => {
    for (let i = 0; i < boardArray.length; i++) {
      if (boardArray[i] == "") {
        continue;
      }
      const square = squares[i];
      const src = `/images/pieces/${boardArray[i]}.png`;
      const squareElement = document.getElementById(square);
      if (squareElement) {
        const img = document.createElement("img");
        img.setAttribute("class", "piece-img");
        img.setAttribute("src", src);
        squareElement.appendChild(img);
      }
    }
  };

  useEffect(() => {
    loadBoard(board);
  })

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
    <section id="board" className="w-full aspect-square bg-neutral-700 flex flex-wrap rounded overflow-hidden">
      {squareElements}
    </section>
  );
}
