const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const stats = document.getElementById('stats');

let beta = 0;
let gamma = 0;

let ball = { x: 200, y: 350, r: 15, vx: 0, vy: 0 };

const holeCount = 5;
let holes = [];
let currentHole = 0;
let startTime = null;
let finished = false;

function getRandomHole(xRange, yRange, excludeList = []) {
  let newHole;
  do {
    newHole = {
      x: Math.random() * (xRange[1] - xRange[0]) + xRange[0],
      y: Math.random() * (yRange[1] - yRange[0]) + yRange[0],
      r: 20,
      type: Math.random() < 0.3 ? (Math.random() < 0.5 ? 'teleport' : 'moving') : 'normal',
      vx: 0,
      vy: 0
    };
  } while (excludeList.some(h => Math.hypot(h.x - newHole.x, h.y - newHole.y) < 80));
  if (newHole.type === 'moving') {
    newHole.vx = (Math.random() * 2 - 1) * 0.5;
    newHole.vy = (Math.random() * 2 - 1) * 0.5;
  }
  return newHole;
}

function setupHoles() {
  holes = [];
  for (let i = 0; i < holeCount; i++) {
    holes.push(getRandomHole([20, 380], [20, 680], holes));
  }
}

function updateBall() {
  ball.vx += gamma * 0.05;
  ball.vy += beta * 0.05;
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= 0.98;
  ball.vy *= 0.98;

  if (ball.x < ball.r) { ball.x = ball.r; ball.vx *= -0.5; }
  if (ball.x > canvas.width - ball.r) { ball.x = canvas.width - ball.r; ball.vx *= -0.5; }
  if (ball.y < ball.r) { ball.y = ball.r; ball.vy *= -0.5; }
  if (ball.y > canvas.height - ball.r) { ball.y = canvas.height - ball.r; ball.vy *= -0.5; }
}

function updateHoles() {
  holes.forEach(hole => {
    if (hole.type === 'moving') {
      hole.x += hole.vx;
      hole.y += hole.vy;
      if (hole.x < 20 || hole.x > 380) hole.vx *= -1;
      if (hole.y < 20 || hole.y > 680) hole.vy *= -1;
    }
  });
}

function checkCollision() {
  const hole = holes[currentHole];
  const dx = ball.x - hole.x;
  const dy = ball.y - hole.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < ball.r + hole.r) {
    if (hole.type === 'teleport') {
      const target = holes.find((h, i) => i !== currentHole && h.type !== 'teleport');
      if (target) {
        ball.x = target.x;
        ball.y = target.y;
      }
    } else {
      currentHole++;
      if (currentHole >= holes.length) {
        finished = true;
        alert("Koniec! Czas: " + Math.floor((Date.now() - startTime) / 1000) + "s");
      } else {
        ball.x = 200;
        ball.y = 350;
        ball.vx = 0;
        ball.vy = 0;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  holes.forEach((hole, index) => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    ctx.fillStyle =
      index === currentHole ? '#222' :
      hole.type === 'teleport' ? '#888' :
      hole.type === 'moving' ? '#f00' : '#aaa';
    ctx.fill();
  });

  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = '#2c7';
  ctx.fill();
}

function updateStats() {
  if (!finished) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    stats.textContent = `Czas: ${elapsed}s | Postęp: ${currentHole} / ${holeCount}`;
  }
}

function loop() {
  if (!finished) {
    updateBall();
    updateHoles();
    checkCollision();
    draw();
    updateStats();
    requestAnimationFrame(loop);
  }
}

window.addEventListener('deviceorientation', (e) => {
  beta = e.beta || 0;
  gamma = e.gamma || 0;
});

setupHoles();
startTime = Date.now();
requestAnimationFrame(loop);
