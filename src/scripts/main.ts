import { inputHandler } from "./brain.ts";

document.addEventListener("keydown", (event) => {
  inputHandler.handleKeydown(event);
});

const whiteHuman = true;
const blackHuman = true;
