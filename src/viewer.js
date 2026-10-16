/**
 * viewer.js — Reusable Three.js 3D Space Viewer
 * Preserves the exact 3D reconstructed room, materials, lighting,
 * Orbit showcase mode, PointerLock first-person navigation, and adds
 * fullscreen toggling, day/night lighting presets, and clean lifecycle management.
 */

import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createSpaceViewer(container, options = {}) {
  const {
    autoStartOrbit = true,
    showControlsBar = true,
    initialMode = "orbit", // 'orbit' or 'explore'
    onStatusChange = null,
    enableDayNightToggle = true
  } = options;

  if (!container) {
    console.error("createSpaceViewer: Container element required");
    return null;
  }

  // Clear any existing children in container
  container.innerHTML = "";
  container.style.position = "relative";

  // Viewer DOM structure
  const canvasWrapper = document.createElement("div");
  canvasWrapper.className = "viewer-canvas-host";
  canvasWrapper.style.width = "100%";
  canvasWrapper.style.height = "100%";
  canvasWrapper.style.position = "absolute";
  canvasWrapper.style.inset = "0";
  container.appendChild(canvasWrapper);

  // Loading Overlay
  const loadingEl = document.createElement("div");
  loadingEl.className = "viewer-loading-badge";
  loadingEl.innerHTML = `<span class="viewer-spinner"></span> Initializing 3D Room...`;
  container.appendChild(loadingEl);

  // Orbit Hint
  const orbitHintEl = document.createElement("div");
  orbitHintEl.className = "viewer-orbit-hint";
  orbitHintEl.innerHTML = `🖱 Drag to orbit · Scroll to zoom`;
  container.appendChild(orbitHintEl);

  // Error boundary overlay (hidden by default)
  const errorEl = document.createElement("div");
  errorEl.className = "viewer-error-badge";
  errorEl.style.display = "none";
  errorEl.innerHTML = `
    <div class="viewer-error-box">
      <span class="viewer-error-icon">⚠️</span>
      <h4>Unable to initialize 3D viewer</h4>
      <p>Your browser or graphics hardware could not load the WebGL context.</p>
      <button class="btn-primary btn-retry">Retry Scene</button>
    </div>
  `;
  container.appendChild(errorEl);

  // Fullscreen HUD overlay (for when in fullscreen mode)
  const fullscreenHud = document.createElement("div");
  fullscreenHud.className = "viewer-fs-hud";
  fullscreenHud.style.display = "none";
  fullscreenHud.innerHTML = `
    <div class="viewer-fs-bar">
      <div class="viewer-fs-title">
        <span class="viewer-dot"></span> AAKAR · 3D ENVIRONMENT
      </div>
      <div class="viewer-fs-actions">
        <button class="btn-fs-mode btn-mode-toggle" title="Toggle between Orbit and First-Person">
          🎮 Mode: <span>Orbit</span>
        </button>
        <button class="btn-fs-light btn-light-toggle" title="Toggle Day / Warm Night Lighting">
          ☀️ <span>Day</span>
        </button>
        <button class="btn-fs-exit" title="Exit Fullscreen (ESC)">
          ✕ Exit Fullscreen
        </button>
      </div>
    </div>
    <div class="viewer-fs-instructions">
      <span><b>W/A/S/D</b> or <b>Arrows</b> Move</span>
      <span><b>Mouse</b> Look around</span>
      <span><b>Click canvas</b> Lock mouse</span>
      <span><b>ESC</b> Unlock / Exit</span>
    </div>
  `;
  container.appendChild(fullscreenHud);

  let isDestroyed = false;
  let animationFrameId = null;
  let isDayTime = true;
  let isExploring = false;

  /* ─── WebGL Scene Setup ─── */
  let scene, camera, renderer, orbitControls, pointerControls;
  let sunLight, hemiLight, lampLight, winLight, fillLight;

  function initScene() {
    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color("#0b1c14");
      scene.fog = new THREE.FogExp2("#0b1c14", 0.045);

      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;

      camera = new THREE.PerspectiveCamera(68, w / h, 0.1, 80);
      camera.position.set(3.5, 2.8, 5.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      canvasWrapper.innerHTML = "";
      canvasWrapper.appendChild(renderer.domElement);

      /* ─── Lights ─── */
      const ambient = new THREE.AmbientLight(0xb8d9c8, 0.5);
      scene.add(ambient);

      hemiLight = new THREE.HemisphereLight(0xddeeff, 0x223322, 1.2);
      scene.add(hemiLight);

      sunLight = new THREE.DirectionalLight(0xfff4e0, 2.8);
      sunLight.position.set(4, 9, 5);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(2048, 2048);
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 30;
      sunLight.shadow.camera.left = -8;
      sunLight.shadow.camera.right = 8;
      sunLight.shadow.camera.top = 8;
      sunLight.shadow.camera.bottom = -8;
      sunLight.shadow.bias = -0.001;
      scene.add(sunLight);

      fillLight = new THREE.DirectionalLight(0x9ac4e8, 0.6);
      fillLight.position.set(-5, 4, 3);
      scene.add(fillLight);

      lampLight = new THREE.PointLight(0xffcc88, 3.5, 7, 2);
      lampLight.position.set(-1.5, 2.8, -2.5);
      lampLight.castShadow = true;
      scene.add(lampLight);

      /* ─── Room Geometry & Materials ─── */
      const floorMat = new THREE.MeshStandardMaterial({
        color: "#c8b89e",
        roughness: 0.82,
        metalness: 0.03
      });
      const wallMat = new THREE.MeshStandardMaterial({
        color: "#ece7db",
        roughness: 0.92,
        metalness: 0
      });
      const ceilMat = new THREE.MeshStandardMaterial({
        color: "#f3efe6",
        roughness: 1,
        metalness: 0
      });

      // Floor & Ceiling
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = 3.5;
      scene.add(ceiling);

      // Walls
      function wall(width, height, depth, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
        m.position.set(x, y, z);
        m.receiveShadow = true;
        scene.add(m);
        return m;
      }
      wall(10, 3.5, 0.12, 0, 1.75, -5); // back
      wall(0.12, 3.5, 10, -5, 1.75, 0); // left
      wall(0.12, 3.5, 10, 5, 1.75, 0); // right

      // Box helper
      function box(width, height, depth, color, x, y, z, rough = 0.78) {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(width, height, depth),
          new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 })
        );
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        scene.add(m);
        return m;
      }

      /* ─── Room Furniture ─── */
      // Wooden desk
      box(1.9, 0.08, 0.9, "#8a6040", -1.5, 0.97, -2.5);
      box(0.08, 0.97, 0.08, "#634530", -2.25, 0.485, -2.87);
      box(0.08, 0.97, 0.08, "#634530", -0.75, 0.485, -2.87);
      box(0.08, 0.97, 0.08, "#634530", -2.25, 0.485, -2.13);
      box(0.08, 0.97, 0.08, "#634530", -0.75, 0.485, -2.13);

      // Laptop
      box(0.52, 0.025, 0.34, "#2d2d2d", -1.5, 1.035, -2.5, 0.15);
      box(0.52, 0.3, 0.02, "#1a1a1a", -1.5, 1.18, -2.67, 0.1);

      // Monitor
      box(0.04, 0.45, 0.55, "#111", -0.78, 1.24, -2.5, 0.1);
      box(0.3, 0.04, 0.18, "#111", -0.78, 1.0, -2.44, 0.1);

      // Sofa
      box(2.4, 0.52, 0.9, "#78967d", 1.8, 0.28, -3.3, 0.9);
      box(2.4, 0.68, 0.18, "#4e6e57", 1.8, 0.8, -3.66, 0.9);
      box(0.2, 0.68, 0.9, "#4e6e57", 0.6, 0.52, -3.3, 0.9);
      box(0.2, 0.68, 0.9, "#4e6e57", 3.0, 0.52, -3.3, 0.9);
      box(1.1, 0.14, 0.5, "#8aac8e", 1.18, 0.6, -3.12, 0.95);
      box(1.1, 0.14, 0.5, "#8aac8e", 2.42, 0.6, -3.12, 0.95);

      // Bookshelf
      box(0.16, 2.6, 1.4, "#7a5a38", -4.46, 1.3, -3.5);
      box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 0.3, -3.5);
      box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 0.95, -3.5);
      box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 1.6, -3.5);
      box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 2.25, -3.5);
      box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 2.58, -3.5);

      // Books
      const bookCols = ["#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#16a085", "#e74c3c", "#3498db"];
      bookCols.forEach((c, i) => {
        const bh = 0.2 + (i % 3) * 0.04;
        box(0.065, bh, 0.24, c, -3.8 + i * 0.17, 0.98 + bh / 2, -3.5, 0.6);
      });
      ["#d35400", "#2c3e50", "#1abc9c", "#e91e63"].forEach((c, i) => {
        const bh = 0.18 + (i % 2) * 0.04;
        box(0.065, bh, 0.24, c, -3.8 + i * 0.18, 1.63 + bh / 2, -3.5, 0.6);
      });

      // Rug
      const rug = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 2.2),
        new THREE.MeshStandardMaterial({ color: "#7a4e3a", roughness: 0.96 })
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(1.8, 0.002, -2.8);
      rug.receiveShadow = true;
      scene.add(rug);

      const rugInner = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.6),
        new THREE.MeshStandardMaterial({ color: "#8f6050", roughness: 0.98 })
      );
      rugInner.rotation.x = -Math.PI / 2;
      rugInner.position.set(1.8, 0.003, -2.8);
      scene.add(rugInner);

      // Floor lamp
      box(0.06, 1.65, 0.06, "#c0a060", -1.4, 0.825, -2.45);
      box(0.22, 0.22, 0.22, "#b09050", -1.4, 1.72, -2.45);

      // Window
      const winGeo = new THREE.PlaneGeometry(1.8, 1.3);
      const winMat = new THREE.MeshStandardMaterial({
        color: "#c8e8ff",
        emissive: "#a0d0f8",
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.92
      });
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.set(2.6, 2.25, -4.93);
      scene.add(winMesh);

      box(0.06, 1.3, 0.08, "#d0c8b8", 1.72, 2.25, -4.93);
      box(0.06, 1.3, 0.08, "#d0c8b8", 3.48, 2.25, -4.93);
      box(1.84, 0.06, 0.08, "#d0c8b8", 2.6, 2.92, -4.93);
      box(1.84, 0.06, 0.08, "#d0c8b8", 2.6, 1.58, -4.93);
      box(0.06, 1.3, 0.08, "#d0c8b8", 2.6, 2.25, -4.93);

      winLight = new THREE.RectAreaLight(0xd0e8ff, 6, 1.8, 1.3);
      winLight.position.set(2.6, 2.25, -4.5);
      winLight.lookAt(2.6, 2.25, 0);
      scene.add(winLight);

      // Coffee table
      box(0.85, 0.06, 0.55, "#a07a50", 1.8, 0.42, -2.2);
      box(0.06, 0.42, 0.06, "#7a5a38", 1.48, 0.21, -1.98);
      box(0.06, 0.42, 0.06, "#7a5a38", 2.12, 0.21, -1.98);
      box(0.06, 0.42, 0.06, "#7a5a38", 1.48, 0.21, -2.42);
      box(0.06, 0.42, 0.06, "#7a5a38", 2.12, 0.21, -2.42);

      // Plant
      const potGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.18, 8);
      const potMat = new THREE.MeshStandardMaterial({ color: "#b05030", roughness: 0.9 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(-1.0, 1.06, -2.44);
      pot.castShadow = true;
      scene.add(pot);

      const plantGeo = new THREE.SphereGeometry(0.14, 8, 6);
      const plantMat = new THREE.MeshStandardMaterial({ color: "#3a8040", roughness: 0.9 });
      const plant = new THREE.Mesh(plantGeo, plantMat);
      plant.position.set(-1.0, 1.25, -2.44);
      plant.castShadow = true;
      scene.add(plant);

      /* ─── Controls Setup ─── */
      orbitControls = new OrbitControls(camera, renderer.domElement);
      orbitControls.target.set(0, 1.3, -2);
      orbitControls.autoRotate = autoStartOrbit;
      orbitControls.autoRotateSpeed = 0.55;
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.07;
      orbitControls.enablePan = false;
      orbitControls.minDistance = 2.0;
      orbitControls.maxDistance = 12;
      orbitControls.minPolarAngle = 0.2;
      orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
      orbitControls.update();

      pointerControls = new PointerLockControls(camera, container);

      pointerControls.addEventListener("lock", () => {
        isExploring = true;
        orbitControls.enabled = false;
        orbitHintEl.style.opacity = "0";
        loadingEl.textContent = "Press ESC to exit first-person";
        loadingEl.style.opacity = "1";
        updateFsHudMode("First-Person");
        if (onStatusChange) onStatusChange("Exploring");
      });

      pointerControls.addEventListener("unlock", () => {
        isExploring = false;
        orbitControls.enabled = true;
        orbitControls.autoRotate = true;
        orbitHintEl.style.opacity = "1";
        loadingEl.textContent = "3D Room Active · Showcase Orbit";
        updateFsHudMode("Orbit");
        if (onStatusChange) onStatusChange("Ready");
      });

      // Loading completed
      setTimeout(() => {
        if (!isDestroyed) {
          loadingEl.textContent = "3D Room Active · Click canvas or Start Exploring";
          setTimeout(() => {
            if (!isExploring && loadingEl) loadingEl.style.opacity = "0.75";
          }, 2500);
          if (onStatusChange) onStatusChange("Ready");
        }
      }, 400);

      // Start animation loop
      startAnimationLoop();
      return true;
    } catch (err) {
      console.error("Three.js initialization failed:", err);
      loadingEl.style.display = "none";
      errorEl.style.display = "flex";
      if (onStatusChange) onStatusChange("Error");
      return false;
    }
  }

  // Retry button
  const retryBtn = errorEl.querySelector(".btn-retry");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      errorEl.style.display = "none";
      loadingEl.style.display = "block";
      initScene();
    });
  }

  /* ─── Keyboard Controls ─── */
  const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
  };

  function onKeyDown(e) {
    if (e.code in keys) {
      keys[e.code] = true;
    }
  }

  function onKeyUp(e) {
    if (e.code in keys) {
      keys[e.code] = false;
    }
  }

  function onBlur() {
    for (const k in keys) keys[k] = false;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  /* ─── Animation Loop ─── */
  const clock = new THREE.Clock();
  const SPEED = 3.2;

  function startAnimationLoop() {
    function animate() {
      if (isDestroyed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (isExploring && pointerControls && pointerControls.isLocked) {
        const fwd = Number(keys.KeyW || keys.ArrowUp) - Number(keys.KeyS || keys.ArrowDown);
        const side = Number(keys.KeyD || keys.ArrowRight) - Number(keys.KeyA || keys.ArrowLeft);
        const len = Math.hypot(fwd, side);
        if (len > 0) {
          pointerControls.moveForward((fwd / len) * SPEED * delta);
          pointerControls.moveRight((side / len) * SPEED * delta);
        }
        camera.position.y = 1.6;
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.5, 4.5);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -4.5, 4.5);
      } else if (orbitControls) {
        orbitControls.update();
      }

      // Subtle light animations
      if (lampLight) {
        lampLight.intensity = (isDayTime ? 3.5 : 4.8) + Math.sin(t * 1.7) * 0.25 + Math.sin(t * 3.3) * 0.1;
      }
      if (winLight) {
        winLight.intensity = (isDayTime ? 6.0 : 0.8) + Math.sin(t * 0.4) * 0.2;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
    animate();
  }

  /* ─── Fullscreen & Viewport Handling ─── */
  let isFullscreen = false;

  function toggleFullscreen() {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }

  function enterFullscreen() {
    isFullscreen = true;
    container.classList.add("viewer-is-fullscreen");
    fullscreenHud.style.display = "flex";
    updateFsHudMode(isExploring ? "First-Person" : "Orbit");

    // Attempt Native browser Fullscreen API if allowed
    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {
        // Fallback to CSS full-viewport handled by viewer-is-fullscreen
      });
    }

    setTimeout(handleResize, 100);
  }

  function exitFullscreen() {
    isFullscreen = false;
    container.classList.remove("viewer-is-fullscreen");
    fullscreenHud.style.display = "none";

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    if (pointerControls && pointerControls.isLocked) {
      pointerControls.unlock();
    }

    setTimeout(handleResize, 100);
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && isFullscreen) {
      exitFullscreen();
    }
  });

  // HUD Buttons
  const fsExitBtn = fullscreenHud.querySelector(".btn-fs-exit");
  if (fsExitBtn) fsExitBtn.addEventListener("click", exitFullscreen);

  const fsModeBtn = fullscreenHud.querySelector(".btn-mode-toggle");
  if (fsModeBtn) {
    fsModeBtn.addEventListener("click", () => {
      if (isExploring) {
        if (pointerControls && pointerControls.isLocked) pointerControls.unlock();
      } else {
        enterExplore();
      }
    });
  }

  const fsLightBtn = fullscreenHud.querySelector(".btn-light-toggle");
  if (fsLightBtn) {
    fsLightBtn.addEventListener("click", toggleDayNight);
  }

  function updateFsHudMode(modeName) {
    const span = fullscreenHud.querySelector(".btn-mode-toggle span");
    if (span) span.textContent = modeName;
  }

  function toggleDayNight() {
    isDayTime = !isDayTime;
    const span = fullscreenHud.querySelector(".btn-light-toggle span");
    if (span) span.textContent = isDayTime ? "Day" : "Night";

    if (isDayTime) {
      scene.background.set("#0b1c14");
      scene.fog.color.set("#0b1c14");
      sunLight.intensity = 2.8;
      hemiLight.intensity = 1.2;
      fillLight.intensity = 0.6;
    } else {
      scene.background.set("#040d09");
      scene.fog.color.set("#040d09");
      sunLight.intensity = 0.3;
      hemiLight.intensity = 0.4;
      fillLight.intensity = 0.2;
    }
  }

  function enterExplore() {
    if (!pointerControls) return;
    camera.position.set(0, 1.6, 4);
    camera.lookAt(0, 1.4, -1);
    pointerControls.lock();
  }

  function resetCamera() {
    if (pointerControls && pointerControls.isLocked) {
      pointerControls.unlock();
    }
    camera.position.set(3.5, 2.8, 5.5);
    if (orbitControls) {
      orbitControls.target.set(0, 1.3, -2);
      orbitControls.update();
    }
  }

  /* ─── Resize Observer ─── */
  function handleResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(container);

  // Initialize
  initScene();

  // Public Viewer Controller API
  return {
    enterExplore,
    resetCamera,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleDayNight,
    getIsFullscreen: () => isFullscreen,
    getIsExploring: () => isExploring,
    destroy() {
      isDestroyed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      resizeObserver.disconnect();

      if (pointerControls && pointerControls.isLocked) {
        pointerControls.unlock();
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      container.innerHTML = "";
    }
  };
}
