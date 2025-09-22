const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 450;

let keys = {};
let gravity = 0.1;
let speed = 2;
let jumpPower = -8;
let grounded = false;

let dashReady = true;
let dashCooldown = 5;
let dashTimer = 0;
let dashVelocity = 0;
let dashDuration = 12; // 프레임 단위 (0.2초 정도)

let doubleJumpReady = true;
let doubleJumpCooldown = 15;
let doubleJumpTimer = 0;
let lastJumpTime = 0; // 마지막 점프 입력 시간

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

// 캐릭터 이미지
const moveFrames = [
  "hoshino_move1.png",
  "hoshino_move2.png",
  "hoshino_move3.png",
  "hoshino_move4.png"
].map(src => {
  const img = new Image();
  img.src = src;
  return img;
});
const idleImg = moveFrames[0];

// 키 입력
document.addEventListener("keydown", e => {
  keys[e.code] = true;

  // 대쉬
  if (e.code === "KeyF" && dashReady) dash();

  // 점프 입력
  if (e.code === "Space" || e.code === "KeyW") {
    handleJump();
  }
});
document.addEventListener("keyup", e => keys[e.code] = false);

// 모바일 버튼 (대쉬만 그대로 둠)
document.getElementById("leftBtn").addEventListener("touchstart", () => keys["ArrowLeft"] = true);
document.getElementById("leftBtn").addEventListener("touchend", () => keys["ArrowLeft"] = false);
document.getElementById("rightBtn").addEventListener("touchstart", () => keys["ArrowRight"] = true);
document.getElementById("rightBtn").addEventListener("touchend", () => keys["ArrowRight"] = false);
document.getElementById("jumpBtn").addEventListener("touchstart", () => handleJump());
document.getElementById("dashBtn").addEventListener("touchstart", () => {
  if (dashReady) dash();
});

// 대쉬 함수
function dash() {
  if (keys["ArrowRight"]) dashVelocity = 30;
  else if (keys["ArrowLeft"]) dashVelocity = -30;
  else dashVelocity = (player.frame % 2 === 0 ? 6 : -6); // 정지시 임시 방향

  dashDuration = 12; // 0.2초 정도
  dashReady = false;
  dashTimer = dashCooldown;
}

// 점프 & 더블점프
function handleJump() {
  const now = performance.now();

  if (grounded) {
    // 일반 점프
    player.dy = jumpPower;
    grounded = false;
    lastJumpTime = now;
  } else if (doubleJumpReady && now - lastJumpTime < 1000) {
    // 1초 안에 두 번째 입력이면 더블점프
    player.dy = jumpPower * 1.2;
    doubleJumpReady = false;
    doubleJumpTimer = doubleJumpCooldown;
  }
}

// UI 업데이트
function updateCooldownUI() {
  const dashBar = document.getElementById("dashCooldown");
  const dashText = document.getElementById("dashText");
  dashBar.style.width = (dashReady ? "100%" : `${(dashTimer / dashCooldown) * 100}%`);
  dashText.textContent = `DASH (F) ${dashReady ? "0s" : dashTimer.toFixed(1) + "s"}`;

  const jumpBar = document.getElementById("doubleJumpCooldown");
  const jumpText = document.getElementById("jumpText");
  jumpBar.style.width = (doubleJumpReady ? "100%" : `${(doubleJumpTimer / doubleJumpCooldown) * 100}%`);
  jumpText.textContent = `DOUBLE JUMP (SPACE/W) ${doubleJumpReady ? "0s" : doubleJumpTimer.toFixed(1) + "s"}`;
}

// 메인 루프
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 이동
  player.dx = 0;
  player.moving = false;
  if (keys["ArrowLeft"]) { player.dx = -speed; player.moving = true; }
  if (keys["ArrowRight"]) { player.dx = speed; player.moving = true; }

  // 대쉬 적용
  if (dashDuration > 0) {
    player.x += dashVelocity;
    dashDuration--;
  }

  // 물리
  player.dy += gravity;
  player.x += player.dx;
  player.y += player.dy;

  // 땅 충돌
  if (player.y + player.height >= canvas.height - 20) {
    player.y = canvas.height - 20 - player.height;
    player.dy = 0;
    grounded = true;
  }

  // 애니메이션
  if (player.moving) {
    player.tick++;
    if (player.tick > 8) {
      player.frame = (player.frame + 1) % 4;
      player.tick = 0;
    }
    ctx.drawImage(moveFrames[player.frame], player.x, player.y, player.width, player.height);
  } else {
    ctx.drawImage(idleImg, player.x, player.y, player.width, player.height);
  }

  // 쿨타임 감소
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

gameLoop();


