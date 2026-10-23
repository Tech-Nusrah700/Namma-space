/**
 * ExplorePage.js — Dedicated Spatial Digital Twin Explorer
 *
 * Implements:
 * 1. Real 3D interactive room navigation with Three.js WebGL 2.0
 * 2. Visible on-screen instructions for first-person walk and orbit showcase
 * 3. Quick-access Reset View control
 * 4. Atmospheric lighting presets (Daylight, Sunset, Midnight)
 * 5. PBR textures vs. Wireframe spatial mesh inspection
 * 6. Live telemetry HUD (coordinates, camera mode, dimensions)
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
            <h1 class="explore-title">Aakar Spatial Digital Twin · Living Room & Tech Hub</h1>
            <p class="explore-subtitle">Dimension-Aware WebGL 2.0 Spatial Digital Twin · 1:1 Architectural Scale</p>
          </div>
        </div>

        <div class="explore-toolbar">
          <button id="expModeToggleBtn" class="explore-tool-btn btn-highlight" title="Engage First-Person Walk Mode">
            🕹 <span>Engage Walk Mode</span>
          </button>
          <button id="expResetBtn" class="explore-tool-btn" title="Reset Camera to default viewpoint">
            ↺ <span>Reset View</span>
          </button>
          <button id="expLightBtn" class="explore-tool-btn" title="Cycle Atmosphere Mood (Daylight, Sunset, Midnight)">
            ☀️ <span>Daylight Mood</span>
          </button>
          <button id="expWireframeBtn" class="explore-tool-btn" title="Toggle between PBR Textures and Wireframe Spatial Mesh">
            📐 <span>Wireframe Mesh</span>
          </button>
          <button id="expTourBtn" class="explore-tool-btn" title="Start Automated 360° Cinematic Camera Tour">
            🎥 <span>Cinematic Tour</span>
          </button>
          <div class="fov-selector-group">
            <span class="fov-label">Lens:</span>
            <select id="expFovSelect" class="fov-select" title="Camera Field of View">
              <option value="65">65° (Human Eye)</option>
              <option value="50">50° (Cinematic 50mm)</option>
              <option value="85">85° (Ultra-Wide 18mm)</option>
            </select>
          </div>
          <button id="expFsBtn" class="explore-tool-btn" title="Toggle Fullscreen Viewport">
            ⛶ <span>Fullscreen</span>
          </button>
        </div>
      </div>

      <!-- Main 3D Canvas Viewport -->
      <div class="explore-canvas-container" id="explore3DContainer">
        <!-- Live Telemetry Floating HUD -->
        <div class="explore-telemetry-hud" id="telemetryHud">
          <div class="telemetry-header">SPATIAL TELEMETRY</div>
          <div class="telemetry-row">
            <span class="t-label">Coordinates:</span>
            <span class="t-val" id="telemetryCoords">X: 3.5m | Y: 2.8m | Z: 5.5m</span>
          </div>
          <div class="telemetry-row">
            <span class="t-label">Active Mode:</span>
            <span class="t-val" id="telemetryMode">Orbit Showcase</span>
          </div>
          <div class="telemetry-row">
            <span class="t-label">Lighting Preset:</span>
            <span class="t-val" id="telemetryMood">Daylight Mood</span>
          </div>
          <div class="telemetry-row">
            <span class="t-label">Interactive Pins:</span>
            <span class="t-val highlight">5 Hotspots Active</span>
          </div>
        </div>
      </div>

      <!-- Bottom Floating Status & Navigation Bar -->
      <div class="explore-bottom-bar">
        <div class="explore-instructions">
          <div class="ins-key-group">
            <span class="ins-badge">W</span>
            <span class="ins-badge">A</span>
            <span class="ins-badge">S</span>
            <span class="ins-badge">D</span>
            <span class="ins-label">Walk / Strafe</span>
          </div>
          <div class="ins-sep"></div>
          <div class="ins-key-group">
            <span class="ins-badge">Mouse</span>
            <span class="ins-label">Look in First-Person</span>
          </div>
          <div class="ins-sep"></div>
          <div class="ins-key-group">
            <span class="ins-badge">Click Pin</span>
            <span class="ins-label">Inspect 3D Metadata</span>
          </div>
          <div class="ins-sep"></div>
          <div class="ins-key-group">
            <span class="ins-badge">ESC</span>
            <span class="ins-label">Release Mouse</span>
          </div>
        </div>

        <div class="explore-meta-badges">
          <span class="meta-pill">Room Footprint: 10m × 10m</span>
          <span class="meta-pill">Ceiling: 3.5m</span>
          <span class="meta-pill">Shader: ACES Filmic</span>
          <button id="expResetBottomBtn" class="btn-ghost btn-sm" title="Reset View">
            ↺ Reset View
          </button>
          <button id="expStartFpsBtn" class="btn-primary btn-sm">
            Engage Walk Mode ↗
          </button>
        </div>
      </div>
    </div>
  `;

  let viewerInstance = null;
  const canvasContainer = container.querySelector("#explore3DContainer");
  const coordsEl = container.querySelector("#telemetryCoords");
  const modeEl = container.querySelector("#telemetryMode");
  const moodEl = container.querySelector("#telemetryMood");
  const modeToggleBtn = container.querySelector("#expModeToggleBtn");

  if (canvasContainer) {
    viewerInstance = createSpaceViewer(canvasContainer, {
      autoStartOrbit: true,
      showHotspots: true,
      onTelemetryUpdate: (data) => {
        if (coordsEl) coordsEl.textContent = `X: ${data.x}m | Y: ${data.y}m | Z: ${data.z}m`;
        if (modeEl) modeEl.textContent = data.mode;
        if (modeToggleBtn) {
          const isWalk = data.mode.includes("First-Person");
          modeToggleBtn.querySelector("span").textContent = isWalk ? "Orbit Showcase" : "Engage Walk Mode";
          modeToggleBtn.classList.toggle("btn-active-mode", isWalk);
        }
      }
    });
  }

  // Toolbar Actions
  if (modeToggleBtn && viewerInstance) {
    modeToggleBtn.addEventListener("click", () => {
      if (viewerInstance.getIsExploring()) {
        viewerInstance.resetCamera();
      } else {
        viewerInstance.enterExplore();
      }
    });
  }

  const tourBtn = container.querySelector("#expTourBtn");
  if (tourBtn && viewerInstance) {
    tourBtn.addEventListener("click", () => {
      const isTour = viewerInstance.toggleCinematicTour();
      tourBtn.querySelector("span").textContent = isTour ? "Stop Tour" : "Cinematic Tour";
      tourBtn.classList.toggle("btn-active-mode", isTour);
    });
  }

  const wireframeBtn = container.querySelector("#expWireframeBtn");
  if (wireframeBtn && viewerInstance) {
    wireframeBtn.addEventListener("click", () => {
      const isWire = viewerInstance.toggleWireframeMode();
      wireframeBtn.querySelector("span").textContent = isWire ? "PBR Textures" : "Wireframe Mesh";
      wireframeBtn.classList.toggle("btn-active-mode", isWire);
    });
  }

  const lightBtn = container.querySelector("#expLightBtn");
  if (lightBtn && viewerInstance) {
    lightBtn.addEventListener("click", () => {
      const preset = viewerInstance.cycleLightingPreset();
      const label = preset === "day" ? "Daylight Mood" : (preset === "sunset" ? "Sunset Mood" : "Midnight Mood");
      lightBtn.querySelector("span").textContent = label;
      if (moodEl) moodEl.textContent = label;
    });
  }

  const fovSelect = container.querySelector("#expFovSelect");
  if (fovSelect && viewerInstance) {
    fovSelect.addEventListener("change", () => {
      viewerInstance.setCameraFov(parseFloat(fovSelect.value));
    });
  }

  const resetBtn = container.querySelector("#expResetBtn");
  if (resetBtn && viewerInstance) {
    resetBtn.addEventListener("click", () => {
      viewerInstance.resetCamera();
    });
  }

  const resetBottomBtn = container.querySelector("#expResetBottomBtn");
  if (resetBottomBtn && viewerInstance) {
    resetBottomBtn.addEventListener("click", () => {
      viewerInstance.resetCamera();
    });
  }

  const fsBtn = container.querySelector("#expFsBtn");
  if (fsBtn && viewerInstance) {
    fsBtn.addEventListener("click", () => {
      viewerInstance.toggleFullscreen();
    });
  }

  const startFpsBtn = container.querySelector("#expStartFpsBtn");
  if (startFpsBtn && viewerInstance) {
    startFpsBtn.addEventListener("click", () => {
      viewerInstance.enterExplore();
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