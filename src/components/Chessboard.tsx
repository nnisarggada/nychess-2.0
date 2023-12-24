import { game, inputHandler, startingFen } from "../scripts/brain.ts";
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

  const board = game.board;

  const [fenVal, setFenVal] = useState(startingFen);

  const loadBoard = (boardArray: Array<string>) => {

    const prevImgs = document.querySelectorAll(".piece-img");
    prevImgs.forEach((img) => {
      img.remove();
    })

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
  });

  const handleNewGame = (fen: string) => {
    setFenVal("");
    const board = inputHandler.startNewGame(fen);
    loadBoard(board);
  };

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
      <button tabIndex={-1} key={square} id={square} onClick={() => inputHandler.handleClick(square)} className={`square betterhover:hover:bg-opacity-50 relative w-[12.5%] aspect-square grid place-items-center ${squareColors[squareColor]} ${rounded}`}>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <section id="board" className="w-full aspect-square bg-neutral-700 flex flex-wrap rounded overflow-hidden shadow-xl">
        {squareElements}
      </section>
      <div className="w-full flex flex-col gap-4 p-2">
        <div className="w-full flex justify-between items-center">
          <div id="turn-indicator" className="w-4 aspect-square rounded-full bg-white"></div>
          <div className="flex gap-2 text-nowrap">
            <button className="bg-neutral-900/50 text-white p-2 rounded" onClick={() => game.actuallyUndoMove()}>Undo</button>
            <button className="bg-neutral-900/50 text-white p-2 rounded" onClick={() => handleNewGame()}>New Game</button>
          </div>
        </div>
        <div className="w-full flex gap-2">
          <input id="fen-input" className="flex-grow bg-neutral-900/50 text-white p-2 rounded" placeholder="FEN" value={fenVal} onChange={(e) => setFenVal(e.target.value)} />
          <button className="w-max bg-neutral-900/50 text-white p-2 rounded" onClick={() => handleNewGame(fenVal)}>Load FEN</button>
        </div>
      </div>
    </div >
  );
}
