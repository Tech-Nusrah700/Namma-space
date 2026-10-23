/**
 * HomePage.js — High-Impact Hackathon Landing Page with 3D Spatial Digital Twin
 *
 * Implements:
 * 1. Professional Hero Section with main headline: "Bridging physical architecture with the spatial web."
 * 2. Two clear primary actions: "Explore 3D Space" & "How It Works"
 * 3. High-fidelity interactive 3D digital twin room viewer
 * 4. Redesigned Problem & Solution side-by-side comparison cards (warm off-white background, green accents)
 * 5. Clear 3-step Reconstruction Workflow (Capture -> Reconstruct -> WebGL Telepresence)
 * 6. Three Engineering Capabilities feature cards with simple icons, 1-sentence explanations, and working links
 * 7. Hackathon Demo Quickstart banner for judges
 */

import { createSpaceViewer } from "../viewer.js";
import { router } from "../router.js";
import { initParticles } from "../effects.js";

export function createHomePage() {
  const container = document.createElement("div");
  container.className = "page-home";

  container.innerHTML = `
    <!-- ═══════════════════════════ HERO SECTION ═══════════════════════════ -->
    <section class="hero-section">
      <canvas id="particles-canvas" class="home-particles" aria-hidden="true"></canvas>
      <div class="hero-glow hero-glow--left" aria-hidden="true"></div>
      <div class="hero-glow hero-glow--right" aria-hidden="true"></div>

      <div class="hero-inner">
        <!-- Left: Text Column -->
        <div class="intro">
          <div class="hero-badge-pill">
            <span class="pulse-dot-green"></span>
            <span>INTERACTIVE 3D SPATIAL DIGITAL TWIN</span>
          </div>

          <h1>Bridging physical architecture<br/><em>with the spatial web.</em></h1>
          
          <p class="description">
            Explore high-fidelity 3D spatial digital twins directly in your browser. Walk inside, inspect architectural dimensions, and experience spaces interactively without specialized software.
          </p>

          <!-- Two Clear Hero Buttons -->
          <div class="hero-cta-group">
            <a href="/explore" class="btn-primary hero-btn-main" data-route="/explore">
              <span class="btn-icon">🕹</span> Explore 3D Space ↗
            </a>
            <a href="#workflow" class="btn-ghost hero-btn-sub" id="heroHowItWorksBtn">
              <span class="btn-icon">⚙️</span> How It Works ↓
            </a>
          </div>

          <p class="hint">
            ⌨️ <b>WASD / Arrows</b> to move &nbsp;·&nbsp; 🖱 <b>Mouse drag</b> to orbit &nbsp;·&nbsp; 💡 <b>Click pins</b> to inspect objects
          </p>

          <!-- Telemetry Quick Strip -->
          <div class="hero-quick-stats">
            <div class="q-stat">
              <span class="q-num">10m × 10m</span>
              <span class="q-lbl">Room Dimensions</span>
            </div>
            <div class="q-stat-sep">/</div>
            <div class="q-stat">
              <span class="q-num">WebGL 2.0</span>
              <span class="q-lbl">Native Browser Access</span>
            </div>
            <div class="q-stat-sep">/</div>
            <div class="q-stat">
              <span class="q-num">60 FPS</span>
              <span class="q-lbl">Real-Time Shaders</span>
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
              <button id="cardResetBtn" class="viewer-mini-btn" title="Reset Camera View to origin">
                ↺ Reset View
              </button>
              <button id="homeLightBtn" class="viewer-mini-btn" title="Cycle Atmosphere Mood (Day / Sunset / Midnight)">
                ☀️ Mood
              </button>
              <button id="homeWireframeBtn" class="viewer-mini-btn" title="Toggle Wireframe Mesh">
                📐 Mesh
              </button>
              <button id="cardFsBtn" class="viewer-mini-btn btn-highlight-mini" title="Expand Fullscreen Viewport">
                ⛶ Fullscreen
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
            <button id="cardWalkInsideBtn" class="viewer-inline-walk-btn" title="Engage First-Person Walk Mode">
              🕹 Walk Inside ↗
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ PROBLEM & SOLUTION SECTION ═══════════════════════════ -->
    <section class="problem-solution-section" id="value-proposition">
      <div class="section-inner">
        <div class="ps-header">
          <span class="ps-badge">THE PARADIGM SHIFT</span>
          <h2 class="ps-title">
            Reimagining physical spaces<br />
            <em>for the interactive web.</em>
          </h2>
          <p class="ps-lead">
            Traditional architectural documentation flattens the built environment. AAKAR creates authentic spatial presence that anyone can walk through directly from their web browser.
          </p>
        </div>

        <div class="ps-grid">
          <!-- 01 THE PROBLEM CARD -->
          <article class="ps-card problem-card">
            <div class="ps-card-header">
              <span class="ps-card-num">01</span>
              <span class="ps-card-tag tag-problem">THE CHALLENGE</span>
            </div>
            <h3 class="ps-card-title">Flat 2D media cannot convey true space.</h3>
            <p class="ps-card-desc">
              Photographs, static floor plans, and pre-recorded videos lose depth perception and spatial proportions.
            </p>

            <ul class="ps-points-list">
              <li class="ps-point">
                <span class="ps-point-icon cross" aria-hidden="true">✕</span>
                <div>
                  <strong>No Depth Perception:</strong> Flat images flatten room volume and make it difficult to evaluate ceiling height and clearances.
                </div>
              </li>
              <li class="ps-point">
                <span class="ps-point-icon cross" aria-hidden="true">✕</span>
                <div>
                  <strong>Installation Friction:</strong> Heavy proprietary CAD applications create software barriers for clients and collaborators.
                </div>
              </li>
              <li class="ps-point">
                <span class="ps-point-icon cross" aria-hidden="true">✕</span>
                <div>
                  <strong>Static Lighting Context:</strong> Impossible to evaluate how natural daylight, sun angles, or fixtures interact with architectural materials.
                </div>
              </li>
            </ul>

            <div class="ps-card-footer">
              <span class="ps-footer-dot dot-problem"></span>
              <span>Traditional 2D Architectural Workflows</span>
            </div>
          </article>

          <!-- 02 THE SOLUTION CARD (MORE PROMINENT) -->
          <article class="ps-card solution-card prominent">
            <div class="ps-highlight-ribbon">RECOMMENDED SOLUTION</div>
            <div class="ps-card-header">
              <span class="ps-card-num">02</span>
              <span class="ps-card-tag tag-solution">THE AAKAR SOLUTION</span>
            </div>
            <h3 class="ps-card-title">Interactive 3D spaces, native to the browser.</h3>
            <p class="ps-card-desc">
              AAKAR reconstructs physical environments into responsive WebGL digital twins that anyone can navigate and inspect instantly.
            </p>

            <ul class="ps-points-list">
              <li class="ps-point">
                <span class="ps-point-icon check" aria-hidden="true">✓</span>
                <div>
                  <strong>Real-Time 6-DoF Walk:</strong> Move freely through the room in first-person with smooth 60 FPS WebGL rendering.
                </div>
              </li>
              <li class="ps-point">
                <span class="ps-point-icon check" aria-hidden="true">✓</span>
                <div>
                  <strong>Zero Installation:</strong> Runs instantly in any standard modern web browser without plugins or downloads.
                </div>
              </li>
              <li class="ps-point">
                <span class="ps-point-icon check" aria-hidden="true">✓</span>
                <div>
                  <strong>Interactive Spatial Telemetry:</strong> Inspect clickable hotspot annotations, dimension footprints, and lighting cycles.
                </div>
              </li>
            </ul>

            <div class="ps-card-footer">
              <span class="ps-footer-dot dot-solution"></span>
              <span>The AAKAR Digital Twin Experience</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ RECONSTRUCTION WORKFLOW ═══════════════════════════ -->
    <section class="workflow-section" id="workflow">
      <div class="section-inner">
        <div class="workflow-header">
          <span class="section-label">HOW IT WORKS</span>
          <h2 class="section-title light">
            From multi-angle photos to<br />
            <em>interactive 3D spaces.</em>
          </h2>
          <p class="workflow-lead">
            A simple 3-stage pipeline that converts standard smartphone photographs into responsive, dimension-aware digital twins.
          </p>
        </div>

        <div class="workflow-grid">
          <!-- STEP 1 -->
          <div class="wf-card">
            <div class="wf-step-badge">STAGE 01</div>
            <div class="wf-icon">📸</div>
            <h3>Multi-Angle Photo Capture</h3>
            <p>
              Take overlapping photos (60–80% overlap) walking around walls and furniture using any standard smartphone camera.
            </p>
            <span class="wf-tech-tag">Standard Mobile Cameras · Zero Hardware Needed</span>
          </div>

          <!-- STEP 2 -->
          <div class="wf-card">
            <div class="wf-step-badge">STAGE 02</div>
            <div class="wf-icon">⚙️</div>
            <h3>Spatial Reconstruction</h3>
            <p>
              Structure-from-Motion (SfM) identifies feature keypoints, solves camera poses, and generates an architecturally scaled 3D mesh.
            </p>
            <span class="wf-tech-tag">Point Cloud Estimation · Poisson Surface Synthesis</span>
          </div>

          <!-- STEP 3 -->
          <div class="wf-card">
            <div class="wf-step-badge">STAGE 03</div>
            <div class="wf-icon">🌐</div>
            <h3>Interactive 3D Exploration</h3>
            <p>
              Load the digital twin instantly in your browser at 60 FPS with first-person navigation, lighting modes, and spatial annotations.
            </p>
            <span class="wf-tech-tag">Three.js WebGL 2.0 · Real-Time Shaders</span>
          </div>
        </div>

        <!-- Workflow CTA Banner -->
        <div class="workflow-cta-strip">
          <div class="wf-cta-text">
            <h4>Ready to experience the 3D room?</h4>
            <p>Walk inside the living room digital twin or upload photos in the workspace.</p>
          </div>
          <div class="wf-cta-actions">
            <a href="/explore" data-route="/explore" class="btn-primary">
              <span class="btn-icon">🕹</span> Launch 3D Explorer ↗
            </a>
            <a href="/workspace" data-route="/workspace" class="btn-ghost">
              <span class="btn-icon">📁</span> Open Workspace
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ ENGINEERING CAPABILITIES ═══════════════════════════ -->
    <section class="highlights-section" id="capabilities">
      <div class="section-inner">
        <div class="highlights-header">
          <span class="section-label">ENGINEERING CAPABILITIES</span>
          <h2 class="section-title light">
            Engineered for<br />
            <em>spatial precision.</em>
          </h2>
          <p class="highlights-description">
            Three core working capabilities built for architects, interior designers, and spatial web explorers.
          </p>
        </div>

        <div class="highlights-grid">
          <!-- CAPABILITY 1 -->
          <article class="highlight-card">
            <div class="hl-card-top">
              <div class="hl-icon" aria-hidden="true">🕹️</div>
              <span class="hl-index">01 / NAVIGATION</span>
            </div>
            <h3>Interactive 3D Exploration</h3>
            <p>
              Navigate architectural spaces in first-person or orbit mode with responsive controls and real-time lighting.
            </p>
            <a href="/explore" data-route="/explore" class="hl-link">
              Explore 3D Viewer <span aria-hidden="true">↗</span>
            </a>
          </article>

          <!-- CAPABILITY 2 -->
          <article class="highlight-card">
            <div class="hl-card-top">
              <div class="hl-icon" aria-hidden="true">📐</div>
              <span class="hl-index">02 / DIMENSIONS</span>
            </div>
            <h3>Spatial Measurements</h3>
            <p>
              Inspect architectural room dimensions (10m × 10m footprint, 3.5m ceiling), surface materials, and interactive spatial hotspots.
            </p>
            <a href="/about" data-route="/about" class="hl-link">
              View Technical Specs <span aria-hidden="true">↗</span>
            </a>
          </article>

          <!-- CAPABILITY 3 -->
          <article class="highlight-card">
            <div class="hl-card-top">
              <div class="hl-icon" aria-hidden="true">📁</div>
              <span class="hl-index">03 / WORKSPACE</span>
            </div>
            <h3>Spatial Workspace</h3>
            <p>
              Manage space photographs, track 4-stage reconstruction pipeline stages, and test custom indoor captures.
            </p>
            <a href="/workspace" data-route="/workspace" class="hl-link">
              Open Workspace <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════ HACKATHON DEMO QUICK-START ═══════════════════════════ -->
    <section class="demo-quickstart-section">
      <div class="section-inner">
        <div class="demo-quickstart-card">
          <div class="demo-badge">AAKAR HACKATHON ENTRY · VISIONARY MINDS</div>
          <h3>Ready to test the digital twin?</h3>
          <p>
            Step directly into our 10m × 10m reconstructed architectural space. Test camera controls, toggle wireframe shaders, and inspect spatial annotations with zero installations.
          </p>
          <div class="demo-action-buttons">
            <a href="/explore" data-route="/explore" class="btn-primary">
              <span class="btn-icon">🕹</span> Open 3D Space Explorer ↗
            </a>
            <a href="/about" data-route="/about" class="btn-ghost">
              <span class="btn-icon">📄</span> Technical Whitepaper
            </a>
            <a href="https://github.com/Tech-Nusrah700/Namma-space.git" target="_blank" rel="noopener noreferrer" class="btn-ghost">
              <span class="btn-icon">⚡</span> GitHub Repository ↗
            </a>
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

  // Smooth scroll for "How It Works" button
  const howBtn = container.querySelector("#heroHowItWorksBtn");
  if (howBtn) {
    howBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const workflowSection = container.querySelector("#workflow");
      if (workflowSection) {
        workflowSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Viewer Controls inside hero card
  const cardWalkInsideBtn = container.querySelector("#cardWalkInsideBtn");
  if (cardWalkInsideBtn && viewerInstance) {
    cardWalkInsideBtn.addEventListener("click", () => {
      viewerInstance.enterExplore();
    });
  }

  const cardResetBtn = container.querySelector("#cardResetBtn");
  if (cardResetBtn && viewerInstance) {
    cardResetBtn.addEventListener("click", () => {
      viewerInstance.resetCamera();
    });
  }

  const cardFsBtn = container.querySelector("#cardFsBtn");
  if (cardFsBtn && viewerInstance) {
    cardFsBtn.addEventListener("click", () => {
      viewerInstance.toggleFullscreen();
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

  // Link interceptor for SPA navigation
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