const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let balls = [];
let mouse = { x: 0, y: 0, active: false };

class Ball {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 5 + 2;
    this.mass = this.radius;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < this.radius || this.x > canvas.width - this.radius) this.vx *= -1;
    if (this.y < this.radius || this.y > canvas.height - this.radius) this.vy *= -1;

    if (mouse.active) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 100) {
        const force = +document.getElementById("mouseForce").value;
        this.vx += (dx / dist) * force / 10;
        this.vy += (dy / dist) * force / 10;
      }
    }

    this.energyTransfer();
  }

  energy() {
    const xF = +document.getElementById("xFactor").value;
    const yF = +document.getElementById("yFactor").value;
    return xF * Math.hypot(this.vx, this.vy) + yF * this.mass;
  }

  energyTransfer() {
    balls.forEach(other => {
      if (other === this) return;
      const dx = other.x - this.x;
      const dy = other.y - this.y;
      const dist = Math.hypot(dx, dy);
      const range = (+document.getElementById("range").value / 100) * canvas.width;

      if (dist < range) {
        if (other.energy() > this.energy()) {
          const diff = (other.energy() - this.energy()) * 0.001;
          this.mass -= diff;
          other.mass += diff;
        }
      }
    });
    this.radius = this.mass;
    if (this.mass < 1) this.dead = true;
    const speed = Math.hypot(this.vx, this.vy);
    const scale = 10 / this.mass;
    this.vx = (this.vx / speed) * scale;
    this.vy = (this.vy / speed) * scale;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

function drawLines() {
  const range = (+document.getElementById("range").value / 100) * canvas.width;
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < range) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,${1 - dist / range})`;
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawLines();
  balls.forEach(b => {
    b.update();
    b.draw();
  });
  balls = balls.filter(b => !b.dead);
  requestAnimationFrame(animate);
}

canvas.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});

canvas.addEventListener("mouseleave", () => {
  mouse.active = false;
});

canvas.addEventListener("click", e => {
  balls.forEach((b, i) => {
    const dx = b.x - e.clientX;
    const dy = b.y - e.clientY;
    if (Math.hypot(dx, dy) < b.radius) {
      balls.splice(i, 1);
      balls.push(new Ball(), new Ball());
    }
  });
});

function reset() {
  balls = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function start() {
  reset();
  const count = +document.getElementById("ballCount").value;
  for (let i = 0; i < count; i++) {
    balls.push(new Ball());
  }
  animate();
}
