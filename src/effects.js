/**
 * effects.js — Namma Space
 * Handles: Particle canvas, 3D card tilt, scroll reveal,
 *          navbar scroll effect, hamburger menu, launch button
 */

/* ═══════════════════════════════════════
   PARTICLE CANVAS
   ═══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const PARTICLE_COUNT = 70;
  const CONNECT_DIST   = 110;
  const COLOR          = "184, 217, 154"; // sage rgb

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function rand(min, max) { return Math.random() * (max - min) + min; }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x:    rand(0, window.innerWidth),
      y:    rand(0, window.innerHeight),
      vx:   rand(-0.28, 0.28),
      vy:   rand(-0.28, 0.28),
      r:    rand(0.6, 1.8),
      a:    rand(0.12, 0.45),
    });
  }

  // Mouse parallax
  let mx = W / 2, my = H / 2;
  window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Subtle mouse attraction
      const dx = mx - p.x, dy = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        p.vx += dx * 0.000012;
        p.vy += dy * 0.000012;
      }

      // Speed cap
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 0.5) { p.vx *= 0.5 / speed; p.vy *= 0.5 / speed; }

      p.x += p.vx; p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, ${p.a})`;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q  = particles[j];
        const ex = p.x - q.x, ey = p.y - q.y;
        const d  = Math.sqrt(ex * ex + ey * ey);
        if (d < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${COLOR}, ${0.07 * (1 - d / CONNECT_DIST)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();


/* ═══════════════════════════════════════
   3D CARD TILT (mouse follow)
   ═══════════════════════════════════════ */
(function initTilt() {
  document.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / (rect.height / 2)) * -10;
      const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  10;
      card.style.transform =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px) scale(1.02)`;
      card.style.boxShadow = `${-ry * 0.8}px ${rx * 0.8}px 40px rgba(26,46,36,0.18)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform  = "perspective(900px) rotateX(0) rotateY(0) translateZ(0) scale(1)";
      card.style.boxShadow  = "";
      card.style.transition = "transform 500ms ease, box-shadow 500ms ease";
    });

    card.addEventListener("mouseenter", () => {
      card.style.transition = "none";
    });
  });
})();


/* ═══════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  els.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════
   NAVBAR — scroll class + active link
   ═══════════════════════════════════════ */
(function initNavbar() {
  const navbar   = document.getElementById("navbar");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  // Scroll glass effect
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);

    // Active section highlighting
    let current = "";
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${current}`
      );
    });
  }, { passive: true });
})();


/* ═══════════════════════════════════════
   HAMBURGER MENU
   ═══════════════════════════════════════ */
(function initHamburger() {
  const btn      = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (!btn || !navLinks) return;

  btn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    btn.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open);
  });

  // Close on nav-link click
  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      btn.classList.remove("open");
    });
  });
})();


/* ═══════════════════════════════════════
   LAUNCH BUTTON (Experience section)
   Scrolls to hero viewer + triggers exploration
   ═══════════════════════════════════════ */
(function initLaunch() {
  const launchBtn = document.getElementById("launchBtn");
  const viewerEl  = document.getElementById("viewer");
  const startBtnEl= document.getElementById("startBtn");
  if (!launchBtn) return;

  launchBtn.addEventListener("click", () => {
    // 1. Scroll viewer into view
    viewerEl?.scrollIntoView({ behavior: "smooth", block: "center" });

    // 2. After scroll animation, attempt fullscreen + pointer lock
    setTimeout(() => {
      const tryLock = () => startBtnEl?.click();

      if (viewerEl?.requestFullscreen) {
        viewerEl.requestFullscreen()
          .then(tryLock)
          .catch(tryLock); // fallback if fullscreen denied
      } else {
        tryLock();
      }
    }, 600);
  });
})();


/* ═══════════════════════════════════════
   VIEWER CARD — 3D hover tilt in hero
   ═══════════════════════════════════════ */
(function initViewerTilt() {
  const card = document.getElementById("viewer-card-hero");
  if (!card) return;

  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const rx   = ((e.clientY - cy) / (rect.height / 2)) * -4;
    const ry   = ((e.clientX - cx) / (rect.width  / 2)) *  4;
    card.style.transform  = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.transition = "none";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform  = "perspective(1200px) rotateX(0) rotateY(0)";
    card.style.transition = "transform 600ms ease";
  });
})();


/* ═══════════════════════════════════════
   TECH PILLS — staggered entrance animation
   ═══════════════════════════════════════ */
(function initPills() {
  const pills = document.querySelectorAll(".tech-pill");
  pills.forEach((pill, i) => {
    pill.style.opacity   = "0";
    pill.style.transform = "translateY(12px)";

    const pillObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          pill.style.transition = `opacity 500ms ease, transform 500ms ease`;
          pill.style.opacity    = "1";
          pill.style.transform  = "translateY(0)";
        }, i * 60);
        pillObs.disconnect();
      }
    }, { threshold: 0.3 });

    pillObs.observe(pill);
  });
})();
