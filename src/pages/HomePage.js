/**
 * HomePage.js — High-Impact Hackathon Landing Page with 3D Spatial Digital Twin
 */

import { createSpaceViewer } from "../viewer.js";
import { router } from "../router.js";
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
        <!-- Left: Text Column -->
        <div class="intro">
          <div class="hero-badge-pill">
            <span class="pulse-dot-green"></span>
            <span>INTERACTIVE 3D SPACES</span>
          </div>

          <h1>Reconstructing reality into interactive<br/><em>3D digital twins.</em></h1>
          <p class="description">
            Explore a detailed 3D room right in your browser. Move through the space, inspect its features, and experience architecture from a new perspective.
          </p>

          <div class="hero-cta-group">
            <button id="heroStartBtn" class="btn-primary">
              <span class="btn-icon">🕹</span> Walk Inside ↗
            </button>
            <button id="heroTourBtn" class="btn-ghost">
              <span class="btn-icon">🎥</span> Cinematic Tour
            </button>
            <button id="heroFullscreenBtn" class="btn-ghost">
              <span class="btn-icon">⛶</span> Full Screen
            </button>
            <a href="/explore" class="btn-ghost" data-route="/explore">
              Dedicated Explorer →
            </a>
          </div>

          <p class="hint">
            ⌨️ <b>WASD / Arrows</b> to move &nbsp;·&nbsp; 🖱 <b>Mouse</b> to look &nbsp;·&nbsp; 💡 <b>Click glowing pins</b> to inspect objects
          </p>

          <!-- Telemetry Quick Strip -->
          <div class="hero-quick-stats">
            <div class="q-stat">
              <span class="q-num">In browser</span>
              <span class="q-lbl">No installation needed</span>
            </div>
            <div class="q-stat-sep">/</div>
            <div class="q-stat">
              <span class="q-num">10m × 10m</span>
              <span class="q-lbl">Room dimensions</span>
            </div>
            <div class="q-stat-sep">/</div>
            <div class="q-stat">
              <span class="q-num">WebGL</span>
              <span class="q-lbl">Native Browser Access</span>
            </div>
          </div>
        </div>

        <!-- Right: 3D Room Viewer Card -->
        <div class="viewer-card" id="viewer-card-hero">
          <div class="viewer-header">
            <span class="viewer-label">
              <span class="viewer-dot"></span> 3D DIGITAL TWIN · LIVING WORKSPACE
            </span>
            <div class="viewer-header-actions">
              <button id="homeWireframeBtn" class="viewer-mini-btn" title="Toggle Wireframe Mesh">
                📐 Mesh
              </button>
              <button id="homeLightBtn" class="viewer-mini-btn" title="Cycle Atmosphere (Day / Sunset / Midnight)">
                ☀️ Mood
              </button>
              <button id="cardFsBtn" class="viewer-mini-btn btn-highlight-mini" title="Expand Full Screen">
                ⛶ Fullscreen
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
            <span><b>Mouse</b> Look around</span>
            <span class="controls-sep">|</span>
            <span class="controls-hint-active">💡 Interactive 3D pins active</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ HACKATHON VALUE PROPOSITION ═══════════════════════════ -->
    <section class="problem-solution-section">
      <div class="section-inner">
        <div class="ps-header">
          <span class="section-label">THE PARADIGM SHIFT</span>
          <h2 class="section-title">Bridging physical architecture<br/><em>with real-time spatial web.</em></h2>
        </div>

        <div class="ps-grid">
          <div class="ps-card problem-card">
            <div class="ps-tag">THE PROBLEM</div>
            <h3>Flat Media Cannot Convey Space</h3>
            <p>
              Traditional architectural surveying, real estate walkthroughs, and spatial documentation rely on flat 2D photography and static video pans. They lose perspective, obscure true room proportions, and require expensive specialized lidar or proprietary desktop viewers.
            </p>
            <ul class="ps-list">
              <li>❌ Zero depth perception or interactive spatial walkthroughs</li>
              <li>❌ Expensive proprietary software with heavy installation hurdles</li>
              <li>❌ Inability to verify real-world millimeter scale directly in-browser</li>
            </ul>
          </div>

          <div class="ps-card solution-card">
            <div class="ps-tag tag-solution">THE AAKAR SOLUTION</div>
            <h3>Universal Browser-Native 3D Twins</h3>
            <p>
              Aakar presents interactive 3D spaces in the browser, with first-person navigation and clickable points of interest. Open the experience on a supported phone, tablet, or computer without installing an app.
            </p>
            <ul class="ps-list list-check">
              <li>✓ First-person telepresence with realistic physics and camera height</li>
              <li>✓ Zero downloads: runs instantly on any phone, tablet, or PC</li>
              <li>✓ Interactive spatial telemetry, annotations, and exportable GLB assets</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ ARCHITECTURAL CAPABILITIES ═══════════════════════════ -->
    <section class="highlights-section">
      <div class="section-inner">
        <div class="section-label">ENGINEERING CAPABILITIES</div>
        <h2 class="section-title light">Engineered for <em>spatial precision.</em></h2>

        <div class="highlights-grid">
          <div class="highlight-card">
            <div class="hl-icon">⚡</div>
            <h3>Sub-Second WebGL Rendering</h3>
            <p>Explore the room with smooth, real-time rendering. Performance depends on your device and browser.</p>
            <a href="/explore" data-route="/explore" class="hl-link">Explore in Fullscreen Viewer →</a>
          </div>

          <div class="highlight-card">
            <div class="hl-icon">📐</div>
            <h3>True Millimeter Scale</h3>
            <p>Calibrated coordinate space preserves exact 1:1 architectural dimensions, floor clearances, and furniture layouts.</p>
            <a href="/about" data-route="/about" class="hl-link">Read Technical Pipeline →</a>
          </div>

          <div class="highlight-card">
            <div class="hl-icon">🔒</div>
            <h3>Private Spatial Vault</h3>
            <p>Upload room photo datasets to your isolated private workspace. Ingest images, extract camera metadata, and query the spatial AI.</p>
            <a href="/workspace" data-route="/workspace" class="hl-link">Enter Workspace →</a>
          </div>
        </div>
      </div>
    </section>
  `;

  // Initialize 3D Space Viewer
  let viewerInstance = null;
  const viewerContainer = container.querySelector("#home3DContainer");

  if (viewerContainer) {
    viewerInstance = createSpaceViewer(viewerContainer, {
      autoStartOrbit: true,
      showHotspots: true
    });
  }

  // Hero Actions
  const startBtn = container.querySelector("#heroStartBtn");
  if (startBtn && viewerInstance) {
    startBtn.addEventListener("click", () => {
      viewerInstance.enterExplore();
    });
  }

  const tourBtn = container.querySelector("#heroTourBtn");
  if (tourBtn && viewerInstance) {
    tourBtn.addEventListener("click", () => {
      const isRunning = viewerInstance.toggleCinematicTour();
      tourBtn.innerHTML = isRunning
        ? `<span class="btn-icon">⏹</span> Stop Tour`
        : `<span class="btn-icon">🎥</span> Cinematic Tour`;
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

  const wireframeBtn = container.querySelector("#homeWireframeBtn");
  if (wireframeBtn && viewerInstance) {
    wireframeBtn.addEventListener("click", () => {
      const isWire = viewerInstance.toggleWireframeMode();
      wireframeBtn.textContent = isWire ? "Textures" : "Mesh";
    });
  }

  const lightBtn = container.querySelector("#homeLightBtn");
  if (lightBtn && viewerInstance) {
    lightBtn.addEventListener("click", () => {
      const preset = viewerInstance.cycleLightingPreset();
      lightBtn.textContent = preset === "day" ? "Daylight" : (preset === "sunset" ? "Sunset" : "Midnight");
    });
  }

  // Particle canvas
  const canvasEl = container.querySelector("#particles-canvas");
  const particleController = initParticles(canvasEl);

  // Link interceptor
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
