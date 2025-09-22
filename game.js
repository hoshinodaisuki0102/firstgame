const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 배경
const bgImg = new Image();
bgImg.src = "abydos.jpg";

// 캐릭터 프레임 로드
const frames = [new Image(), new Image(), new Image(), new Image()];
frames[0].src = "hoshino_move1.png"; // 기본
frames[1].src = "hoshino_move2.png";
frames[2].src = "hoshino_move3.png";
frames[3].src = "hoshino_move4.png";

// 플레이어
let player = {
  x: 200, y: 0,
  width: 80, height: 80,
  vx: 0, vy: 0,
  speed: 2.5,       // 이동속도 ↓ (원래 4)
  jumping: false,
  canDoubleJump: true,
  frame: 0,
  moving: false
};

// 애니메이션
const animOrder = [0, 1, 2, 0, 1, 3];
let animIndex = 0, animTimer = 0;
const animSpeed = 150;

// 물리
const gravity = 0.45; // ↓ 중력 낮춤 (체공 ↑)
const groundLevel = canvas.height - 120;

// 입력
let keys = {};

// 대쉬 쿨타임
let dashCooldown = 10000, lastDashTime = -dashCooldown, dashReady = true;
const dashBar = document.getElementById("dashBar");
const dashText = document.getElementById("dashText");

// 더블 점프 쿨타임
let jumpCooldown = 15000, lastJumpTime = -jumpCooldown, jumpReady = true;
const jumpBar = document.getElementById("jumpBar");
const jumpText = document.getElementById("jumpText");

function updateCooldown(bar, text, lastTime, cooldown, label) {
  const now = Date.now();
  const elapsed = now - lastTime;
  if (elapsed >= cooldown) {
    bar.style.width = "100%";
    text.innerText = `${label} READY`;
    return true;
  } else {
    const remaining = Math.ceil((cooldown - elapsed) / 1000);
    const percent = (elapsed / cooldown) * 100;
    bar.style.width = percent + "%";
    text.innerText = `${label} (${remaining}s)`;
    return false;
  }
}

function handleInput() {
  player.moving = false;

  if (keys["ArrowLeft"] || keys["a"]) {
    player.vx = -player.speed;
    player.moving = true;
  } else if (keys["ArrowRight"] || keys["d"]) {
    player.vx = player.speed;
    player.moving = true;
  } else {
    player.vx = 0;
  }

  // 점프
  if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && !player.jumping) {
    player.vy = -12;
    player.jumping = true;
    player.canDoubleJump = true;
  }

  // 더블 점프
  if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && player.jumping && player.canDoubleJump && jumpReady) {
    player.vy = -12;
    player.canDoubleJump = false;
    lastJumpTime = Date.now();
  }

  // 대쉬
  if (keys["f"] && dashReady) {
    player.vx *= 3;
    lastDashTime = Date.now();
  }
}

function updatePlayer(deltaTime) {
  handleInput();

  // 중력
  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;

  // 바닥 충돌
  if (player.y + player.height > groundLevel) {
    player.y = groundLevel - player.height;
    player.vy = 0;
    player.jumping = false;
  }

  // 애니메이션
  if (player.moving) {
    animTimer += deltaTime;
    if (animTimer > animSpeed) {
      animTimer = 0;
      animIndex = (animIndex + 1) % animOrder.length;
      player.frame = animOrder[animIndex];
    }
  } else {
    player.frame = 0;
    animIndex = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(frames[player.frame], player.x, player.y, player.width, player.height);
}

let lastTime = 0;
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  updatePlayer(deltaTime);

  // UI 업데이트
  dashReady = updateCooldown(dashBar, dashText, lastDashTime, dashCooldown, "DASH");
  jumpReady = updateCooldown(jumpBar, jumpText, lastJumpTime, jumpCooldown, "DOUBLE JUMP");

  draw();
  requestAnimationFrame(gameLoop);
}

// 입력
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

gameLoop();

