/**
 * HomePage.js — Landing Page with Prominent 3D Room Experience
 */

import { createSpaceViewer } from "../viewer.js";
import { router } from "../router.js";
import { auth } from "../auth.js";
import { initParticles } from "../effects.js";

export function createHomePage() {
  const container = document.createElement("div");
  container.className = "page-home";

  container.innerHTML = `
    <!-- ═══════════════════════════ HERO ═══════════════════════════ -->
    <section class="hero-section">
      <canvas id="particles-canvas" class="home-particles" aria-hidden="true"></canvas>
      <div class="hero-glow hero-glow--left" aria-hidden="true"></div>
      <div class="hero-glow hero-glow--right" aria-hidden="true"></div>

      <div class="hero-inner">
        <!-- Left: Text -->
        <div class="intro">
          <p class="eyebrow">REAL SPACES. DIGITAL EXPERIENCES.</p>
          <h1>Step inside<br/>your <em>space.</em></h1>
          <p class="description">
            Explore an indoor environment reconstructed in true 3D.
            Walk around, look anywhere, and discover the space directly in your browser — no downloads, no headset required.
          </p>

          <div class="hero-cta-group">
            <button id="heroStartBtn" class="btn-primary">
              <span class="btn-icon">🕹</span> Start Exploring ↗
            </button>
            <button id="heroFullscreenBtn" class="btn-ghost">
              <span class="btn-icon">⛶</span> Full Screen
            </button>
            <a href="/explore" class="btn-ghost" data-route="/explore">
              Dedicated Viewer →
            </a>
          </div>

          <p class="hint">WASD / Arrow keys to move &nbsp;·&nbsp; Mouse to look &nbsp;·&nbsp; ESC to exit</p>

          <div class="hero-quick-stats">
            <div class="q-stat">
              <span class="q-num">100%</span>
              <span class="q-lbl">Browser Native</span>
            </div>
            <div class="q-stat-sep">/</div>
            <div class="q-stat">
              <span class="q-num">WebGL</span>
              <span class="q-lbl">Real-time 3D</span>
            </div>
            <div class="q-stat-sep">/</div>
            <div class="q-stat">
              <span class="q-num">Zero</span>
              <span class="q-lbl">Downloads</span>
            </div>
          </div>
        </div>

        <!-- Right: 3D Room Viewer Card -->
        <div class="viewer-card" id="viewer-card-hero">
          <div class="viewer-header">
            <span class="viewer-label">
              <span class="viewer-dot"></span> 3D ROOM VIEWER
            </span>
            <div class="viewer-header-actions">
              <span id="heroViewerStatus" class="viewer-status-text">Ready</span>
              <button id="cardFsBtn" class="viewer-mini-btn" title="Expand Full Screen">
                ⛶ Expand
              </button>
              <button id="cardResetBtn" class="viewer-mini-btn" title="Reset Camera">
                ↺ Reset
              </button>
            </div>
          </div>

          <div id="home3DContainer" class="home-viewer-viewport"></div>

          <div class="controls">
            <span><b>W</b> Forward</span>
            <span><b>A</b> Left</span>
            <span><b>S</b> Back</span>
            <span><b>D</b> Right</span>
            <span class="controls-sep">|</span>
            <span><b>Mouse</b> Look</span>
            <span class="controls-sep">|</span>
            <span><b>Click Viewer</b> to Enter</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ HIGHLIGHTS STRIP ═══════════════════════════ -->
    <section class="highlights-section">
      <div class="section-inner">
        <div class="highlights-grid">
          <div class="highlight-card">
            <div class="hl-icon">🏛</div>
            <h3>High-Fidelity Reconstruction</h3>
            <p>Every corner, surface, and light reflection mapped with millimeter accuracy.</p>
            <a href="/about" data-route="/about" class="hl-link">Learn about the process →</a>
          </div>
          <div class="highlight-card">
            <div class="hl-icon">📐</div>
            <h3>Interactive Spatial Navigation</h3>
            <p>Walk through physical architecture in real-time first person mode with WASD controls.</p>
            <a href="/explore" data-route="/explore" class="hl-link">Open Fullscreen Viewer →</a>
          </div>
          <div class="highlight-card">
            <div class="hl-icon">📸</div>
            <h3>Reconstruct Your Own Space</h3>
            <p>Upload room photographs to your private workspace and chat with our 3D assistant.</p>
            <a href="/workspace" data-route="/workspace" class="hl-link">Enter Workspace →</a>
          </div>
        </div>
      </div>
    </section>
  `;

  // Initialize 3D Space Viewer
  let viewerInstance = null;
  const viewerContainer = container.querySelector("#home3DContainer");
  const statusEl = container.querySelector("#heroViewerStatus");

  if (viewerContainer) {
    viewerInstance = createSpaceViewer(viewerContainer, {
      autoStartOrbit: true,
      onStatusChange: (status) => {
        if (statusEl) statusEl.textContent = status;
      }
    });
  }

  // Hero Actions
  const startBtn = container.querySelector("#heroStartBtn");
  if (startBtn && viewerInstance) {
    startBtn.addEventListener("click", () => {
      viewerInstance.enterExplore();
    });
  }

  const fsBtn = container.querySelector("#heroFullscreenBtn");
  if (fsBtn && viewerInstance) {
    fsBtn.addEventListener("click", () => {
      viewerInstance.enterFullscreen();
    });
  }

  const cardFsBtn = container.querySelector("#cardFsBtn");
  if (cardFsBtn && viewerInstance) {
    cardFsBtn.addEventListener("click", () => {
      viewerInstance.toggleFullscreen();
    });
  }

  const cardResetBtn = container.querySelector("#cardResetBtn");
  if (cardResetBtn && viewerInstance) {
    cardResetBtn.addEventListener("click", () => {
      viewerInstance.resetCamera();
    });
  }

  // Initialize particle canvas
  const canvasEl = container.querySelector("#particles-canvas");
  const particleController = initParticles(canvasEl);

  // Intercept internal links
  container.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute("data-route"));
    });
  });

  return {
    element: container,
    destroy() {
      if (particleController && typeof particleController.destroy === "function") {
        particleController.destroy();
      }
      if (viewerInstance) {
        viewerInstance.destroy();
        viewerInstance = null;
      }
    }
  };
}
