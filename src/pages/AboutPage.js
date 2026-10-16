/**
 * AboutPage.js — Project Information, Reconstruction Process, and Capabilities
 */

import { router } from "../router.js";

export function createAboutPage() {
  const container = document.createElement("div");
  container.className = "page-about";

  container.innerHTML = `
    <!-- Header Banner -->
    <section class="about-hero-banner">
      <div class="section-inner">
        <span class="about-tag">ABOUT THE PROJECT</span>
        <h1 class="about-main-title">Where physical <em>spaces meet</em><br/>digital reality.</h1>
        <p class="about-main-lead">
          <strong>Aakar</strong> is an interactive 3D indoor-space exploration platform that digitally reconstructs real indoor environments — making them accessible, navigable, and interactive right in a web browser.
        </p>
      </div>
    </section>

    <!-- Detailed About Grid -->
    <section class="about-section">
      <div class="section-inner">
        <div class="about-grid">
          <div class="about-headline">
            <h2>High-accuracy spatial reconstruction for the modern web.</h2>
            <div class="about-stats">
              <div class="stat">
                <span class="stat-num">3D</span>
                <span class="stat-label">Real-time Rendering</span>
              </div>
              <div class="stat">
                <span class="stat-num">0</span>
                <span class="stat-label">Downloads Needed</span>
              </div>
              <div class="stat">
                <span class="stat-num">360°</span>
                <span class="stat-label">Spatial Freedom</span>
              </div>
            </div>
          </div>

          <div class="about-body">
            <p>
              Traditional photography captures spaces as flat, static images. <strong>Aakar</strong> breaks this boundary by transforming physical interiors into fully navigable 3D models.
            </p>
            <p>
              Users can walk through rooms using familiar WASD controls and fluid mouse-look, exactly like in a physical walk-through. Every desk, sofa, bookshelf, and light source is spatially accurate to scale.
            </p>
            <p>
              With zero app installations, no VR headset required, and full cross-device compatibility, anyone can explore indoor spaces instantly from any phone, laptop, or desktop browser.
            </p>
            <div class="about-action-group">
              <a href="/explore" data-route="/explore" class="btn-primary">
                Launch 3D Viewer ↗
              </a>
              <a href="/workspace" data-route="/workspace" class="btn-ghost">
                Upload Your Photos →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4-Step Process -->
    <section class="howitworks-section">
      <div class="section-inner">
        <div class="section-label">THE PIPELINE</div>
        <h2 class="section-title light">How it <em>comes alive.</em></h2>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-num">01</div>
            <div class="step-icon">📸</div>
            <h3>Capture</h3>
            <p>Photograph the physical indoor room from multiple angles and overlap points to record spatial information.</p>
          </div>

          <div class="step-connector" aria-hidden="true"></div>

          <div class="step-card">
            <div class="step-num">02</div>
            <div class="step-icon">⚙️</div>
            <h3>Reconstruct</h3>
            <p>Process image sequences using photogrammetry and spatial computing to synthesize detailed 3D geometry and textures.</p>
          </div>

          <div class="step-connector" aria-hidden="true"></div>

          <div class="step-card">
            <div class="step-num">03</div>
            <div class="step-icon">📦</div>
            <h3>Load</h3>
            <p>Export spatial scenes as optimized <code>.glb</code> / glTF assets or Three.js meshes configured for low-latency WebGL.</p>
          </div>

          <div class="step-connector" aria-hidden="true"></div>

          <div class="step-card">
            <div class="step-num">04</div>
            <div class="step-icon">🌍</div>
            <h3>Explore</h3>
            <p>Freely navigate the reconstructed room in first-person mode with realistic lighting, shadows, and smooth controls.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities / Features Grid -->
    <section class="features-section">
      <div class="section-inner">
        <div class="section-label">CAPABILITIES</div>
        <h2 class="section-title">Built for <em>real experiences.</em></h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🏛</div>
            <h3>Immersive 3D Visualization</h3>
            <p>Spaces reconstructed with high-fidelity geometry and realistic lighting, rendered smoothly with WebGL.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🕹</div>
            <h3>Interactive Navigation</h3>
            <p>Walk freely using intuitive WASD / Arrow controls and mouse-look for authentic first-person presence.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📐</div>
            <h3>True-Scale Representation</h3>
            <p>Spaces are reconstructed at real-world scale, preserving accurate proportions, dimensions, and depth.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h3>Browser-Based Access</h3>
            <p>No plugins or heavyweight installs. The entire 3D experience runs natively in any modern web browser.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>Orbit Showcase Mode</h3>
            <p>Auto-rotating preview lets anyone appreciate the space from every angle before exploring first-person.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Responsive Interface</h3>
            <p>Adapts fluidly across mobile phones, tablets, laptops, and ultra-wide displays with polished UI.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Stack & Project Card -->
    <section class="tech-section">
      <div class="section-inner">
        <div class="tech-grid">
          <div class="tech-left">
            <div class="section-label">TECHNOLOGY STACK</div>
            <h2>Powered by <em>open web standards.</em></h2>
            <p>
              Built entirely with modern web technologies to deliver real-time 3D without any dependencies outside the browser.
            </p>
            <div class="tech-pills">
              <span class="tech-pill">Three.js</span>
              <span class="tech-pill">JavaScript (ES Modules)</span>
              <span class="tech-pill">WebGL 2.0</span>
              <span class="tech-pill">HTML5 Canvas</span>
              <span class="tech-pill">CSS3 Flex/Grid</span>
              <span class="tech-pill">Vite</span>
              <span class="tech-pill">GLB / glTF</span>
            </div>
          </div>

          <div class="tech-right">
            <div class="project-card">
              <div class="project-card-header">PROJECT</div>
              <h3>Aakar</h3>
              <p>Indoor 3D Space Reconstruction & Browser-Based Exploration Platform</p>
              <div class="project-meta">
                <div class="meta-item">
                  <span class="meta-label">Team</span>
                  <span class="meta-val">Visionary Minds</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Stack</span>
                  <span class="meta-val">Three.js + Vite</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Format</span>
                  <span class="meta-val">WebGL / Three.js</span>
                </div>
              </div>
              <a href="https://github.com/Tech-Nusrah700/Namma-space.git"
                 target="_blank" rel="noopener noreferrer"
                 class="github-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll("a[data-route]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute("data-route"));
    });
  });

  return container;
}
