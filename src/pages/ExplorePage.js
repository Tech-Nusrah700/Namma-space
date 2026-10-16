/**
 * ExplorePage.js — Dedicated Immersive 3D Viewer Page
 */

import { createSpaceViewer } from "../viewer.js";
import { router } from "../router.js";

export function createExplorePage() {
  const container = document.createElement("div");
  container.className = "page-explore";

  container.innerHTML = `
    <div class="explore-layout">
      <!-- Top Explorer Bar -->
      <div class="explore-top-bar">
        <div class="explore-title-block">
          <span class="explore-live-dot"></span>
          <div>
            <h1 class="explore-title">Reconstructed Indoor Space</h1>
            <p class="explore-subtitle">Living Room & Workspace · Real-time WebGL</p>
          </div>
        </div>

        <div class="explore-toolbar">
          <button id="expModeBtn" class="explore-tool-btn" title="Toggle between Orbit and First-Person Walk">
            🕹 Mode: <span>Orbit Showcase</span>
          </button>
          <button id="expLightBtn" class="explore-tool-btn" title="Toggle Day / Warm Night Lighting">
            ☀️ <span>Day Mode</span>
          </button>
          <button id="expResetBtn" class="explore-tool-btn" title="Reset Camera to Origin">
            ↺ Reset
          </button>
          <button id="expFsBtn" class="explore-tool-btn btn-highlight" title="Toggle Fullscreen">
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      <!-- Main 3D Canvas Viewport -->
      <div class="explore-canvas-container" id="explore3DContainer"></div>

      <!-- Bottom Floating Status & Navigation Bar -->
      <div class="explore-bottom-bar">
        <div class="explore-instructions">
          <div class="ins-key-group">
            <span class="ins-badge">W</span>
            <span class="ins-badge">A</span>
            <span class="ins-badge">S</span>
            <span class="ins-badge">D</span>
            <span class="ins-label">Move Forward/Back/Strafe</span>
          </div>
          <div class="ins-sep"></div>
          <div class="ins-key-group">
            <span class="ins-badge">Mouse</span>
            <span class="ins-label">Look around in FPS mode</span>
          </div>
          <div class="ins-sep"></div>
          <div class="ins-key-group">
            <span class="ins-badge">ESC</span>
            <span class="ins-label">Release mouse lock</span>
          </div>
        </div>

        <div class="explore-meta-badges">
          <span class="meta-pill">Room: 10m × 10m</span>
          <span class="meta-pill">Ceiling: 3.5m</span>
          <span class="meta-pill">Renderer: Three.js</span>
          <button id="expStartFpsBtn" class="btn-primary btn-sm">
            Walk Inside Space ↗
          </button>
        </div>
      </div>
    </div>
  `;

  let viewerInstance = null;
  const canvasContainer = container.querySelector("#explore3DContainer");
  const modeBtn = container.querySelector("#expModeBtn");
  const modeSpan = modeBtn ? modeBtn.querySelector("span") : null;

  if (canvasContainer) {
    viewerInstance = createSpaceViewer(canvasContainer, {
      autoStartOrbit: true,
      onStatusChange: (status) => {
        if (modeSpan) {
          modeSpan.textContent = status === "Exploring" ? "First-Person" : "Orbit Showcase";
        }
      }
    });
  }

  // Toolbar Actions
  if (modeBtn && viewerInstance) {
    modeBtn.addEventListener("click", () => {
      if (viewerInstance.getIsExploring()) {
        viewerInstance.resetCamera();
      } else {
        viewerInstance.enterExplore();
      }
    });
  }

  const startFpsBtn = container.querySelector("#expStartFpsBtn");
  if (startFpsBtn && viewerInstance) {
    startFpsBtn.addEventListener("click", () => {
      viewerInstance.enterExplore();
    });
  }

  const lightBtn = container.querySelector("#expLightBtn");
  if (lightBtn && viewerInstance) {
    lightBtn.addEventListener("click", () => {
      viewerInstance.toggleDayNight();
    });
  }

  const resetBtn = container.querySelector("#expResetBtn");
  if (resetBtn && viewerInstance) {
    resetBtn.addEventListener("click", () => {
      viewerInstance.resetCamera();
    });
  }

  const fsBtn = container.querySelector("#expFsBtn");
  if (fsBtn && viewerInstance) {
    fsBtn.addEventListener("click", () => {
      viewerInstance.toggleFullscreen();
    });
  }

  return {
    element: container,
    destroy() {
      if (viewerInstance) {
        viewerInstance.destroy();
        viewerInstance = null;
      }
    }
  };
}
