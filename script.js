// ===== ELEMENTS =====
const board = document.querySelector(".board");
const playBtn = document.querySelector(".btn");
const resetBtn = document.querySelector(".reset");
const displayScore = document.querySelector(".score");
const displayLevel = document.querySelector(".level");
const displayLives = document.querySelector(".lives");
const displayHighScore = document.querySelector(".high");
const gameOverEl = document.querySelector(".game-over");
const input = document.querySelector("#input");

const boxSize = 50;

// ===== STATES =====

let rows;
let cols;
let blocks = [];
let intervalId = null;
let snake = [{ x: Math.floor(rows / 2), y: Math.floor(cols / 2) }];
let food = {};
let direction = "right"; // movement
let nextDirection = "right"; // movement
let headDirection = "right"; // eyes

let score = Number(localStorage.getItem("score")) || 0;
let level = Number(localStorage.getItem("level")) || 0;
let lives = Number(localStorage.getItem("lives")) || 3;
let speed = Number(localStorage.getItem("speed")) || 600;
let highScore = Number(localStorage.getItem("highScore")) || 30;

displayScore.innerText = `Score : ${score}`;
displayLevel.innerText = `Level : ${level}`;
displayLives.innerText = `Lives : ${lives}`;
displayHighScore.innerText = `HighScore : ${highScore}`;

// ===== CREATE BOARD =====

function createGrid() {
  board.innerHTML = "";
  blocks = []

  rows = Math.floor(board.clientHeight / boxSize);
  cols = Math.floor(board.clientWidth / boxSize);

  board.style.gridTemplateColumns = `repeat(${cols}),$({boxSize}px)`;
  board.style.gridTemplateRows = `repeat(${rows}),$({boxSize}px)`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const box = document.createElement("div");
      box.classList.add("box");
      board.appendChild(box);
      blocks[`${row}-${col}`] = box;
    }
  }
}

// ===== RENDER SNAKE  =====
function renderSnake() {
  snake.forEach((part, index) => {
    const box = blocks[`${part.x}-${part.y}`];
    if (!box) return;

    if (index === 0) {
      box.classList.add("snake-head", headDirection); // instant eyes
    } else {
      box.classList.add("snake");
    }
  });
}

// ===== RESPAWN SNAKE  =====
function respawnSnake() {
  const length = snake.length || 3;
  const startX = Math.floor(rows / 2);
  const startY = Math.floor(cols / 2);

  snake = [];

  for (let i = 0; i < length; i++) {
    snake.push({ x: startX, y: startY - i });
  }

  direction = "right";
  nextDirection = "right";
  headDirection = "right";

  renderSnake();
}

// ===== FOOD =====
function renderFood() {
  do {
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
  } while (snake.some((p) => p.x === food.x && p.y === food.y));

  blocks[`${food.x}-${food.y}`].classList.add("food");
}

// ===== GAME LOOP =====
function startGame() {
  clearInterval(intervalId);

  intervalId = setInterval(() => {

    direction = nextDirection; // APPLY buffered direction ONCE

    let head = { ...snake[0] };

    if (direction === "right") head.y++;
    if (direction === "left") head.y--;
    if (direction === "up") head.x--;
    if (direction === "down") head.x++;

    // WALL COLLISION
    if (head.x < 0 || head.y < 0 || head.x >= rows || head.y >= cols) {
      loseLife();
      return;
    }

    // SELF COLLISION
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        loseLife();
        return;
      }
    }

    // FOOD
    if (head.x === food.x && head.y === food.y) {
      blocks[`${food.x}-${food.y}`].classList.remove("food");
      snake.unshift(head);
      score++;
      displayScore.innerText = `Score : ${score}`;
      localStorage.setItem("score", score);
      updateLevel();
      renderFood();
    } else {
      snake.unshift(head);
      snake.pop();
    }

    // CLEAR OLD
    document
      .querySelectorAll(".snake, .snake-head")
      .forEach((el) =>
        el.classList.remove(
          "snake",
          "snake-head",
          "up",
          "down",
          "left",
          "right"
        )
      );

    renderSnake();
    canChangeDirection = true; // UNLOCK direction
  }, speed);
}

// ===== LEVEL SYSTEM =====
function updateLevel() {
  if ([5, 10, 15, 20, 25, 40].includes(score)) {
    level++;
    speed = Math.max(100, speed - 150);
    displayLevel.innerText = `Level : ${level}`;
    localStorage.setItem("level", level);
    localStorage.setItem("speed", speed);
    startGame();
  }
}

// ===== LIFE LOST =====
function loseLife() {
  lives--;
  displayLives.innerText = `Lives : ${lives}`;
  localStorage.setItem("lives", lives);
  clearInterval(intervalId);
  playBtn.classList.remove("play");

  setTimeout(() => {
    document
      .querySelectorAll(".snake, .snake-head")
      .forEach((el) =>
        el.classList.remove(
          "snake",
          "snake-head",
          "up",
          "down",
          "left",
          "right"
        )
      );
  }, 100);

  if (lives <= 0) {
    gameOverEl.style.display = "flex";
    localStorage.clear();
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }
    return;
  }

  setTimeout(() => {
    respawnSnake();
  }, 300);

  blocks[`${food.x}-${food.y}`]?.classList.remove("food");
  renderFood();
}

// ===== CONTROLS (INSTANT EYES) =====
document.addEventListener("keydown", (e) => {
  if (!canChangeDirection) return;

  if (e.key === "ArrowUp" && direction !== "down") {
    nextDirection = "up";
    headDirection = "up";
  } else if (e.key === "ArrowDown" && direction !== "up") {
    nextDirection = "down";
    headDirection = "down";
  } else if (e.key === "ArrowLeft" && direction !== "right") {
    nextDirection = "left";
    headDirection = "left";
  } else if (e.key === "ArrowRight" && direction !== "left") {
    nextDirection = "right";
    headDirection = "right";
  } else if (e.key === " " && lives === 0) {
    location.reload();
  }

  canChangeDirection = false;
});

// ===== BUTTONS =====
playBtn.addEventListener("click", function () {
  startGame();
  playBtn.classList.add("play");
});

resetBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  localStorage.clear();
  location.reload();
});

// THROTTLING CONCEPT FOR CALCULATING GRID WHILE RESIZING THE SCREEN
function throttle(fn, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

let onResize = throttle(function () {
  clearInterval(intervalId);
  playBtn.classList.remove("play");
  createGrid();
  respawnSnake();
  renderFood();
}, 100);

window.addEventListener("resize", onResize);

// INIT
createGrid();
respawnSnake();
renderFood();
renderSnake();