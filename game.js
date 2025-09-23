const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 화면 크기에 맞게 캔버스 조정
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 배경 이미지
const bgImg = new Image();
bgImg.src = "abydos.jpg";

let keys = {};
let gravity = 0.3;
let speed = 2.5;
let jumpPower = -7;
let grounded = false;
let canDoubleJump = true;
let doubleJumpReady = true;
let dashReady = true;

let dashCooldown = 5;
let doubleJumpCooldown = 15;

let dashTimer = 0;
let doubleJumpTimer = 0;

const player = {
  x: 100,
  y: 300,
  width: 48,
  height: 48,
  dx: 0,
  dy: 0,
  frame: 0,
  tick: 0,
  moving: false
};

const moveFrameSources = [
  "hoshino_move1.png",
  "hoshino_move2.png",
  "hoshino_move3.png",
  "hoshino_move4.png"
];

const moveFrames = [];
let imagesLoaded = 0;

moveFrameSources.forEach(src => {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === moveFrameSources.length) {
      gameLoop();
    }
  };
  moveFrames.push(img);
});

const idleImg = moveFrames[0];

document.addEventListener("keydown", e => {
  keys[e.code] = true;
  if (e.code === "KeyF" && dashReady) dash();
});
document.addEventListener("keyup", e => keys[e.code] = false);

// 모바일 버튼 연결
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");
const dashBtn = document.getElementById("dashBtn");

if (leftBtn) {
  leftBtn.addEventListener("touchstart", () => keys["ArrowLeft"] = true);
  leftBtn.addEventListener("touchend", () => keys["ArrowLeft"] = false);
}
if (rightBtn) {
  rightBtn.addEventListener("touchstart", () => keys["ArrowRight"] = true);
  rightBtn.addEventListener("touchend", () => keys["ArrowRight"] = false);
}
if (jumpBtn) {
  jumpBtn.addEventListener("touchstart", () => keys["Space"] = true);
  jumpBtn.addEventListener("touchend", () => keys["Space"] = false);
}
if (dashBtn) {
  dashBtn.addEventListener("touchstart", () => {
    if (dashReady) dash();
  });
}

function dash() {
  player.dx = (keys["ArrowRight"] ? 6 : keys["ArrowLeft"] ? -6 : 0);
  dashReady = false;
  dashTimer = dashCooldown;
}

function handleJump() {
  if (keys["Space"]) {
    if (grounded) {
      player.dy = jumpPower;
      grounded = false;
      canDoubleJump = true;
    } else if (canDoubleJump && doubleJumpReady) {
      player.dy = jumpPower * 1.2;
      canDoubleJump = false;
      doubleJumpReady = false;
      doubleJumpTimer = doubleJumpCooldown;
    }
  }
}

function updateCooldownUI() {
  const dashBar = document.getElementById("dashBar");
  const dashText = document.getElementById("dashText");
  if (dashBar && dashText) {
    dashBar.style.width = (dashReady ? "100%" : `${(dashTimer / dashCooldown) * 100}%`);
    dashText.textContent = dashReady ? "DASH READY" : `DASH (${dashTimer.toFixed(1)}s)`;
  }

  const jumpBar = document.getElementById("jumpBar");
  const jumpText = document.getElementById("jumpText");
  if (jumpBar && jumpText) {
    jumpBar.style.width = (doubleJumpReady ? "100%" : `${(doubleJumpTimer / doubleJumpCooldown) * 100}%`);
    jumpText.textContent = doubleJumpReady ? "DOUBLE JUMP READY" : `DOUBLE JUMP (${doubleJumpTimer.toFixed(1)}s)`;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경 그리기 (화면 전체에 맞춤)
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  player.dx = 0;
  player.moving = false;
  if (keys["ArrowLeft"]) { player.dx = -speed; player.moving = true; }
  if (keys["ArrowRight"]) { player.dx = speed; player.moving = true; }

  handleJump();

  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  if (player.y + player.height >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.height;
    player.dy = 0;
    grounded = true;
  }

  if (player.moving) {
    player.tick++;
    if (player.tick > 8) {
      player.frame = (player.frame + 1) % moveFrames.length;
      player.tick = 0;
    }
    ctx.drawImage(moveFrames[player.frame], player.x, player.y, player.width, player.height);
  } else {
    ctx.drawImage(idleImg, player.x, player.y, player.width, player.height);
  }

  if (!dashReady) {
    dashTimer -= 0.016;
    if (dashTimer <= 0) dashReady = true;
  }
  if (!doubleJumpReady) {
    doubleJumpTimer -= 0.016;
    if (doubleJumpTimer <= 0) doubleJumpReady = true;
  }

  updateCooldownUI();
  requestAnimationFrame(gameLoop);
}
