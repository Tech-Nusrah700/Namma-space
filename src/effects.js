/**
 * effects.js — Interactive visual effects
 * Exports particle canvas animation and card tilt helpers
 */

export function initParticles(canvas) {
  if (!canvas) return { destroy: () => {} };

  const ctx = canvas.getContext("2d");
  const PARTICLE_COUNT = 60;
  const CONNECT_DIST = 105;
  const COLOR = "184, 217, 154"; // sage rgb

  let W, H;
  let particles = [];
  let animId = null;

  function resize() {
    W = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    H = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function rand(min, max) { return Math.random() * (max - min) + min; }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: rand(0, W || window.innerWidth),
      y: rand(0, H || window.innerHeight),
      vx: rand(-0.25, 0.25),
      vy: rand(-0.25, 0.25),
      r: rand(0.6, 1.8),
      a: rand(0.12, 0.45)
    });
  }

  // Mouse parallax
  let mx = W / 2, my = H / 2;
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  }
  window.addEventListener("mousemove", onMouseMove);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const dx = mx - p.x;
      const dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        p.vx += dx * 0.00001;
        p.vy += dy * 0.00001;
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 0.45) {
        p.vx *= 0.45 / speed;
        p.vy *= 0.45 / speed;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, ${p.a})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const ex = p.x - q.x;
        const ey = p.y - q.y;
        const d = Math.sqrt(ex * ex + ey * ey);
        if (d < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${COLOR}, ${0.06 * (1 - d / CONNECT_DIST)})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  draw();

  return {
    destroy() {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    }
  };
}
