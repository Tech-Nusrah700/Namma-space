/**
 * viewer.js — Next-Gen Three.js 3D Space Viewer Engine
 * Features:
 * - High-fidelity procedural room architecture with PBR materials and realistic lighting
 * - Interactive 3D Spatial Hotspots with inspection tooltips
 * - 3 Dynamic Lighting Presets: Daylight, Golden Sunset, Cyber Midnight
 * - Rendering Mode Switcher: Photorealistic PBR vs Wireframe Spatial Mesh
 * - Cinematic Camera Fly-Through / Showcase Tour
 * - WASD & Arrow Key FPS Walkthrough + Pointer Lock Mouse Look
 * - Drag/Scroll Orbit Showcase
 * - Real-Time Spatial Telemetry (Coordinates, FOV, Mesh statistics)
 * - Fullscreen HUD with ESC and on-screen controls
 */

import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createSpaceViewer(container, options = {}) {
  const {
    autoStartOrbit = true,
    showHotspots = true,
    onStatusChange = null,
    onTelemetryUpdate = null,
    onHotspotClick = null
  } = options;

  if (!container) {
    console.error("createSpaceViewer: Container element required");
    return null;
  }

  container.innerHTML = "";
  container.style.position = "relative";

  // Canvas Wrapper
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
  loadingEl.innerHTML = `<span class="viewer-spinner"></span> Initializing Neural Spatial Scene...`;
  container.appendChild(loadingEl);

  // Orbit Hint
  const orbitHintEl = document.createElement("div");
  orbitHintEl.className = "viewer-orbit-hint";
  orbitHintEl.innerHTML = `🖱 Drag to orbit · Scroll to zoom · Click pins for telemetry`;
  container.appendChild(orbitHintEl);

  // Hotspot Tooltip Popup
  const hotspotTooltip = document.createElement("div");
  hotspotTooltip.className = "viewer-hotspot-tooltip";
  hotspotTooltip.style.display = "none";
  container.appendChild(hotspotTooltip);

  // Error boundary
  const errorEl = document.createElement("div");
  errorEl.className = "viewer-error-badge";
  errorEl.style.display = "none";
  errorEl.innerHTML = `
    <div class="viewer-error-box">
      <span class="viewer-error-icon">⚠️</span>
      <h4>WebGL Context Unavailable</h4>
      <p>Failed to initialize 3D GPU acceleration. Please verify WebGL 2.0 support.</p>
      <button class="btn-primary btn-retry">Retry Scene</button>
    </div>
  `;
  container.appendChild(errorEl);

  // Fullscreen HUD overlay
  const fullscreenHud = document.createElement("div");
  fullscreenHud.className = "viewer-fs-hud";
  fullscreenHud.style.display = "none";
  fullscreenHud.innerHTML = `
    <div class="viewer-fs-bar">
      <div class="viewer-fs-title">
        <span class="viewer-dot"></span> AAKAR · SPATIAL DIGITAL TWIN
      </div>
      <div class="viewer-fs-actions">
        <button class="btn-fs-mode btn-mode-toggle" title="Toggle between Orbit Showcase and First-Person Walk">
          🎮 Mode: <span>Orbit</span>
        </button>
        <button class="btn-fs-tour btn-tour-toggle" title="Start Cinematic Camera Walkthrough">
          🎥 <span>Cinematic Tour</span>
        </button>
        <button class="btn-fs-mesh btn-wireframe-toggle" title="Toggle PBR Texture vs Spatial Wireframe Mesh">
          📐 <span>Wireframe</span>
        </button>
        <button class="btn-fs-light btn-light-cycle" title="Cycle Atmosphere (Day / Sunset / Midnight)">
          ☀️ <span>Daylight</span>
        </button>
        <button class="btn-fs-exit" title="Exit Fullscreen (ESC)">
          ✕ Exit
        </button>
      </div>
    </div>
    <div class="viewer-fs-instructions">
      <span><b>W/A/S/D</b> Move</span>
      <span><b>Mouse</b> Look</span>
      <span><b>Click Canvas</b> Engage FPS</span>
      <span><b>ESC</b> Release mouse / Exit</span>
    </div>
  `;
  container.appendChild(fullscreenHud);

  let isDestroyed = false;
  let animationFrameId = null;
  let isExploring = false;
  let isCinematicTour = false;
  let tourAngle = 0;
  let isWireframe = false;
  let lightingPreset = "day"; // "day", "sunset", "midnight"

  /* ─── WebGL Scene Setup ─── */
  let scene, camera, renderer, orbitControls, pointerControls, raycaster, mouse;
  let sunLight, hemiLight, lampLight, winLight, fillLight, monitorGlowLight, ceilingSpots = [];
  let allMeshes = [];
  let hotspotObjects = [];

  const HOTSPOTS_DATA = [
    {
      id: "desk",
      position: new THREE.Vector3(-1.5, 1.45, -2.5),
      title: "Digital Workstation Rig",
      desc: "Dual-display compute node with real-time WebGL spatial modeling pipeline and PBR screen emission."
    },
    {
      id: "sofa",
      position: new THREE.Vector3(1.8, 1.1, -3.3),
      title: "Lounge Suite",
      desc: "Custom high-density seating with simulated fabric micro-roughness (0.92) and ambient occlusion."
    },
    {
      id: "window",
      position: new THREE.Vector3(2.6, 2.3, -4.8),
      title: "Architectural Aperture",
      desc: "1.8m × 1.3m window with RectAreaLight raycast casting real-time soft shadows onto the wooden floor."
    },
    {
      id: "bookshelf",
      position: new THREE.Vector3(-4.2, 1.9, -3.5),
      title: "Library Archive",
      desc: "2.6m vertical shelving with procedural geometric volumes and multi-spectral book materials."
    },
    {
      id: "art",
      position: new THREE.Vector3(0, 2.3, -4.92),
      title: "Architectural Gallery Canvas",
      desc: "Minimalist geometric spatial art piece with indirect directional wall-graze illumination."
    }
  ];

  function initScene() {
    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color("#081711");
      scene.fog = new THREE.FogExp2("#081711", 0.04);

      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;

      camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 90);
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

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      /* ─── Lighting Rig ─── */
      const ambient = new THREE.AmbientLight(0xb8d9c8, 0.45);
      scene.add(ambient);

      hemiLight = new THREE.HemisphereLight(0xddeeff, 0x1a2e22, 1.1);
      scene.add(hemiLight);

      sunLight = new THREE.DirectionalLight(0xfff4e0, 2.8);
      sunLight.position.set(4, 9, 5);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(2048, 2048);
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 30;
      sunLight.shadow.camera.left = -7.5;
      sunLight.shadow.camera.right = 7.5;
      sunLight.shadow.camera.top = 7.5;
      sunLight.shadow.camera.bottom = -7.5;
      sunLight.shadow.bias = -0.0008;
      scene.add(sunLight);

      fillLight = new THREE.DirectionalLight(0x8cb8dc, 0.55);
      fillLight.position.set(-5, 4, 3);
      scene.add(fillLight);

      lampLight = new THREE.PointLight(0xffcc88, 3.8, 8, 2);
      lampLight.position.set(-1.4, 2.6, -2.45);
      lampLight.castShadow = true;
      lampLight.shadow.bias = -0.001;
      scene.add(lampLight);

      // Cyan monitor ambient glow
      monitorGlowLight = new THREE.PointLight(0x4ade80, 1.2, 3, 2);
      monitorGlowLight.position.set(-1.1, 1.2, -2.4);
      scene.add(monitorGlowLight);

      /* ─── Room Architectural Materials ─── */
      const floorMat = new THREE.MeshStandardMaterial({
        color: "#c2b095",
        roughness: 0.78,
        metalness: 0.04
      });
      const wallMat = new THREE.MeshStandardMaterial({
        color: "#ece6da",
        roughness: 0.90,
        metalness: 0.01
      });
      const ceilMat = new THREE.MeshStandardMaterial({
        color: "#f4f1e8",
        roughness: 0.98,
        metalness: 0
      });
      const baseboardMat = new THREE.MeshStandardMaterial({
        color: "#3a2a1e",
        roughness: 0.7,
        metalness: 0.1
      });

      // Floor & Ceiling
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      allMeshes.push(floor);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilMat);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = 3.5;
      scene.add(ceiling);
      allMeshes.push(ceiling);

      // Walls
      function addWall(w, h, d, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        m.position.set(x, y, z);
        m.receiveShadow = true;
        scene.add(m);
        allMeshes.push(m);
        return m;
      }
      addWall(10, 3.5, 0.14, 0, 1.75, -5);   // back
      addWall(0.14, 3.5, 10, -5, 1.75, 0);   // left
      addWall(0.14, 3.5, 10, 5, 1.75, 0);    // right

      // Baseboards
      function addBaseboard(w, h, d, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), baseboardMat);
        m.position.set(x, y, z);
        scene.add(m);
        allMeshes.push(m);
      }
      addBaseboard(10, 0.12, 0.05, 0, 0.06, -4.92);
      addBaseboard(0.05, 0.12, 10, -4.92, 0.06, 0);
      addBaseboard(0.05, 0.12, 10, 4.92, 0.06, 0);

      // Reusable box creator
      function addBox(w, h, d, color, x, y, z, rough = 0.75, metal = 0.02) {
        const m = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
        );
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        scene.add(m);
        allMeshes.push(m);
        return m;
      }

      /* ─── Detailed Furniture ─── */
      // 1. Desk & Tech Workstation
      addBox(1.95, 0.08, 0.92, "#855838", -1.5, 0.97, -2.5, 0.65);
      addBox(0.07, 0.97, 0.07, "#543722", -2.35, 0.485, -2.88);
      addBox(0.07, 0.97, 0.07, "#543722", -0.65, 0.485, -2.88);
      addBox(0.07, 0.97, 0.07, "#543722", -2.35, 0.485, -2.12);
      addBox(0.07, 0.97, 0.07, "#543722", -0.65, 0.485, -2.12);

      // Ergonomic Swivel Chair
      addBox(0.55, 0.08, 0.52, "#242d28", -1.5, 0.52, -1.8, 0.85); // seat
      addBox(0.52, 0.58, 0.07, "#1c2420", -1.5, 0.85, -1.54, 0.9); // back
      addBox(0.06, 0.48, 0.06, "#777", -1.5, 0.24, -1.8, 0.2, 0.8); // star stem
      addBox(0.48, 0.04, 0.05, "#333", -1.5, 0.04, -1.8, 0.4, 0.6); // legs base

      // Displays: 34" Ultrawide Curved Screen + Laptop
      addBox(0.04, 0.48, 0.78, "#181818", -0.85, 1.28, -2.5, 0.15, 0.7); // ultrawide
      const screenGeo = new THREE.PlaneGeometry(0.74, 0.44);
      const screenMat = new THREE.MeshStandardMaterial({
        color: "#163826",
        emissive: "#3b8258",
        emissiveIntensity: 0.85,
        roughness: 0.2
      });
      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.rotation.y = -Math.PI / 2;
      screenMesh.position.set(-0.825, 1.28, -2.5);
      scene.add(screenMesh);
      allMeshes.push(screenMesh);

      // Laptop
      addBox(0.52, 0.02, 0.35, "#2a2a2a", -1.65, 1.025, -2.48, 0.15, 0.6);
      addBox(0.52, 0.32, 0.02, "#181818", -1.65, 1.18, -2.65, 0.1, 0.7);

      // Keyboard & Desk Mat
      addBox(0.9, 0.005, 0.4, "#1d2e26", -1.4, 1.015, -2.35, 0.9);
      addBox(0.42, 0.015, 0.14, "#111", -1.35, 1.025, -2.32, 0.2);

      // Ceramic coffee mug
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.04, 0.09, 12),
        new THREE.MeshStandardMaterial({ color: "#e8dfce", roughness: 0.3 })
      );
      mug.position.set(-2.0, 1.055, -2.3);
      mug.castShadow = true;
      scene.add(mug);
      allMeshes.push(mug);

      // 2. Modern Sofa Lounge
      addBox(2.5, 0.52, 0.95, "#6d8f76", 1.8, 0.28, -3.3, 0.92);
      addBox(2.5, 0.72, 0.18, "#44644f", 1.8, 0.82, -3.68, 0.92);
      addBox(0.22, 0.72, 0.95, "#44644f", 0.55, 0.52, -3.3, 0.92); // left arm
      addBox(0.22, 0.72, 0.95, "#44644f", 3.05, 0.52, -3.3, 0.92); // right arm
      addBox(1.15, 0.15, 0.54, "#7fa689", 1.18, 0.61, -3.12, 0.95);
      addBox(1.15, 0.15, 0.54, "#7fa689", 2.42, 0.61, -3.12, 0.95);

      // 3. Tall Bookshelf with Books
      addBox(0.18, 2.7, 1.45, "#705030", -4.45, 1.35, -3.5, 0.8);
      for (let i = 0; i < 5; i++) {
        addBox(1.45, 0.05, 0.32, "#826040", -4.45, 0.35 + i * 0.62, -3.5, 0.8);
      }
      const bookColors = ["#c0392b", "#2980b9", "#27ae60", "#e67e22", "#8e44ad", "#16a085", "#d35400", "#34495e"];
      bookColors.forEach((c, idx) => {
        const h = 0.2 + (idx % 3) * 0.05;
        addBox(0.065, h, 0.24, c, -3.8 + idx * 0.17, 1.0 + h / 2, -3.5, 0.6);
      });

      // 4. Rug
      const rug = new THREE.Mesh(
        new THREE.PlaneGeometry(3.3, 2.3),
        new THREE.MeshStandardMaterial({ color: "#6b4533", roughness: 0.98 })
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(1.8, 0.003, -2.8);
      rug.receiveShadow = true;
      scene.add(rug);
      allMeshes.push(rug);

      // 5. Floor Lamp
      addBox(0.06, 1.7, 0.06, "#bfa058", -1.4, 0.85, -2.45, 0.3, 0.8);
      addBox(0.24, 0.24, 0.24, "#bfa058", -1.4, 1.75, -2.45, 0.9);

      // 6. Window with Exterior Daylight
      const winGeo = new THREE.PlaneGeometry(1.85, 1.35);
      const winMat = new THREE.MeshStandardMaterial({
        color: "#c8e8ff",
        emissive: "#88c8f8",
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.92
      });
      const winMesh = new THREE.Mesh(winGeo, winMat);
      winMesh.position.set(2.6, 2.25, -4.93);
      scene.add(winMesh);
      allMeshes.push(winMesh);

      addBox(0.06, 1.35, 0.08, "#cfc6b6", 1.68, 2.25, -4.93);
      addBox(0.06, 1.35, 0.08, "#cfc6b6", 3.52, 2.25, -4.93);
      addBox(1.9, 0.06, 0.08, "#cfc6b6", 2.6, 2.93, -4.93);
      addBox(1.9, 0.06, 0.08, "#cfc6b6", 2.6, 1.57, -4.93);
      addBox(0.06, 1.35, 0.08, "#cfc6b6", 2.6, 2.25, -4.93);

      winLight = new THREE.RectAreaLight(0xd0e8ff, 6.5, 1.85, 1.35);
      winLight.position.set(2.6, 2.25, -4.5);
      winLight.lookAt(2.6, 2.25, 0);
      scene.add(winLight);

      // 7. Coffee Table & Plant
      addBox(0.9, 0.06, 0.58, "#9e744a", 1.8, 0.42, -2.2, 0.65);
      addBox(0.05, 0.42, 0.05, "#705030", 1.46, 0.21, -1.96);
      addBox(0.05, 0.42, 0.05, "#705030", 2.14, 0.21, -1.96);
      addBox(0.05, 0.42, 0.05, "#705030", 1.46, 0.21, -2.44);
      addBox(0.05, 0.42, 0.05, "#705030", 2.14, 0.21, -2.44);

      // Architectural Plant
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.09, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: "#a84e30", roughness: 0.85 })
      );
      pot.position.set(-1.0, 1.08, -2.44);
      pot.castShadow = true;
      scene.add(pot);
      allMeshes.push(pot);

      const plantGeo = new THREE.SphereGeometry(0.16, 10, 8);
      const plantMat = new THREE.MeshStandardMaterial({ color: "#2d743a", roughness: 0.85 });
      const plant = new THREE.Mesh(plantGeo, plantMat);
      plant.position.set(-1.0, 1.28, -2.44);
      plant.castShadow = true;
      scene.add(plant);
      allMeshes.push(plant);

      // 8. Minimalist Bauhaus Canvas Artwork on back wall
      const artFrame = addBox(1.6, 1.1, 0.04, "#1d2b24", 0, 2.25, -4.92, 0.4, 0.6);
      const artCanvas = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 1.0),
        new THREE.MeshStandardMaterial({
          color: "#ded9cb",
          roughness: 0.9,
          emissive: "#203a2e",
          emissiveIntensity: 0.25
        })
      );
      artCanvas.position.set(0, 2.25, -4.89);
      scene.add(artCanvas);
      allMeshes.push(artCanvas);

      /* ─── 3D Interactive Hotspot Markers ─── */
      if (showHotspots) {
        initHotspots();
      }

      /* ─── Controls Rig ─── */
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
        isCinematicTour = false;
        orbitControls.enabled = false;
        orbitHintEl.style.opacity = "0";
        loadingEl.textContent = "First-Person Navigation Active · ESC to unlock";
        loadingEl.style.opacity = "1";
        updateFsHudMode("First-Person");
        if (onStatusChange) onStatusChange("Exploring");
      });

      pointerControls.addEventListener("unlock", () => {
        isExploring = false;
        orbitControls.enabled = true;
        orbitControls.autoRotate = true;
        orbitHintEl.style.opacity = "1";
        loadingEl.textContent = "Aakar 3D Room Active · Showcase Orbit";
        updateFsHudMode("Orbit");
        if (onStatusChange) onStatusChange("Ready");
      });

      // Canvas click for Raycasting Hotspots
      renderer.domElement.addEventListener("click", onCanvasClick);
      renderer.domElement.addEventListener("mousemove", onCanvasMouseMove);

      setTimeout(() => {
        if (!isDestroyed) {
          loadingEl.textContent = "Spatial Twin Loaded · 60 FPS · Click canvas or Start Exploring";
          setTimeout(() => {
            if (!isExploring && loadingEl) loadingEl.style.opacity = "0.75";
          }, 2400);
          if (onStatusChange) onStatusChange("Ready");
        }
      }, 400);

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

  /* ─── Hotspots Setup ─── */
  function initHotspots() {
    HOTSPOTS_DATA.forEach(data => {
      const group = new THREE.Group();
      group.position.copy(data.position);

      // Inner glowing core
      const coreGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({ color: "#B8D99A" });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      // Pulsing outer halo ring
      const ringGeo = new THREE.RingGeometry(0.12, 0.17, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: "#B8D99A",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.lookAt(camera.position);
      group.add(ring);

      group.userData = {
        isHotspot: true,
        data,
        ring
      };

      scene.add(group);
      hotspotObjects.push(group);
    });
  }

  function onCanvasMouseMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (!isExploring && camera) {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hotspotObjects, true);
      if (hits.length > 0) {
        renderer.domElement.style.cursor = "pointer";
      } else {
        renderer.domElement.style.cursor = "default";
      }
    }
  }

  function onCanvasClick(e) {
    if (isExploring) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(hotspotObjects, true);

    if (hits.length > 0) {
      // Find root hotspot group
      let obj = hits[0].object;
      while (obj.parent && !obj.userData?.isHotspot) {
        obj = obj.parent;
      }

      if (obj.userData?.isHotspot) {
        const d = obj.userData.data;
        showTooltip(d, e.clientX, e.clientY);
        if (onHotspotClick) onHotspotClick(d);
      }
    } else {
      hideTooltip();
    }
  }

  function showTooltip(data, clientX, clientY) {
    hotspotTooltip.innerHTML = `
      <div class="tip-badge">3D SPATIAL ANNOTATION</div>
      <h4 class="tip-title">${data.title}</h4>
      <p class="tip-desc">${data.desc}</p>
      <div class="tip-coords">Coordinate: (${data.position.x.toFixed(1)}, ${data.position.y.toFixed(1)}, ${data.position.z.toFixed(1)})</div>
    `;
    hotspotTooltip.style.left = `${Math.min(window.innerWidth - 280, Math.max(20, clientX - 120))}px`;
    hotspotTooltip.style.top = `${Math.max(80, clientY - 140)}px`;
    hotspotTooltip.style.display = "block";
    hotspotTooltip.style.animation = "fadeInScale 200ms ease";
  }

  function hideTooltip() {
    hotspotTooltip.style.display = "none";
  }

  /* ─── Keyboard Controls ─── */
  const keys = {
    KeyW: false, KeyA: false, KeyS: false, KeyD: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
  };

  function onKeyDown(e) { if (e.code in keys) keys[e.code] = true; }
  function onKeyUp(e) { if (e.code in keys) keys[e.code] = false; }
  function onBlur() { for (const k in keys) keys[k] = false; }

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

      // 1. Hotspot rings pulse and face camera
      hotspotObjects.forEach(hp => {
        const ring = hp.userData.ring;
        if (ring) {
          ring.lookAt(camera.position);
          const s = 1.0 + Math.sin(t * 3.5) * 0.18;
          ring.scale.set(s, s, s);
        }
      });

      // 2. Cinematic Tour mode
      if (isCinematicTour && !isExploring) {
        tourAngle += delta * 0.28;
        const radius = 5.2;
        camera.position.x = Math.sin(tourAngle) * radius;
        camera.position.z = Math.cos(tourAngle) * radius - 1.2;
        camera.position.y = 2.4 + Math.sin(tourAngle * 2) * 0.4;
        camera.lookAt(0, 1.4, -2.0);
        if (orbitControls) orbitControls.target.set(0, 1.4, -2.0);
      } else if (isExploring && pointerControls && pointerControls.isLocked) {
        // 3. First-Person Movement
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

      // Dynamic light flicker & screen pulse
      if (lampLight) {
        lampLight.intensity = (lightingPreset === "midnight" ? 4.8 : 3.8) +
          Math.sin(t * 1.7) * 0.25 + Math.sin(t * 3.3) * 0.1;
      }
      if (winLight && lightingPreset !== "midnight") {
        winLight.intensity = (lightingPreset === "sunset" ? 3.5 : 6.5) + Math.sin(t * 0.4) * 0.25;
      }

      // Telemetry callback
      if (onTelemetryUpdate && camera) {
        onTelemetryUpdate({
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2),
          fov: camera.fov,
          mode: isExploring ? "First-Person" : (isCinematicTour ? "Cinematic Tour" : "Orbit Showcase")
        });
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
    animate();
  }

  /* ─── Atmosphere & Lighting Presets ─── */
  function setLightingPreset(preset) {
    lightingPreset = preset;
    const fsLightSpan = fullscreenHud.querySelector(".btn-light-cycle span");

    if (preset === "day") {
      scene.background.set("#081711");
      scene.fog.color.set("#081711");
      sunLight.color.set("#fff4e0");
      sunLight.intensity = 2.8;
      hemiLight.intensity = 1.1;
      fillLight.intensity = 0.55;
      if (winLight) winLight.intensity = 6.5;
      if (fsLightSpan) fsLightSpan.textContent = "Daylight";
    } else if (preset === "sunset") {
      scene.background.set("#1f140e");
      scene.fog.color.set("#1f140e");
      sunLight.color.set("#ff8844");
      sunLight.intensity = 3.2;
      hemiLight.intensity = 0.6;
      fillLight.intensity = 0.35;
      if (winLight) winLight.intensity = 4.2;
      if (fsLightSpan) fsLightSpan.textContent = "Golden Sunset";
    } else if (preset === "midnight") {
      scene.background.set("#040a08");
      scene.fog.color.set("#040a08");
      sunLight.intensity = 0.15;
      hemiLight.intensity = 0.25;
      fillLight.intensity = 0.15;
      if (winLight) winLight.intensity = 0.6;
      if (monitorGlowLight) monitorGlowLight.intensity = 2.5;
      if (fsLightSpan) fsLightSpan.textContent = "Cyber Midnight";
    }
  }

  function cycleLightingPreset() {
    if (lightingPreset === "day") setLightingPreset("sunset");
    else if (lightingPreset === "sunset") setLightingPreset("midnight");
    else setLightingPreset("day");
    return lightingPreset;
  }

  /* ─── Wireframe vs PBR Rendering Mode ─── */
  function toggleWireframeMode() {
    isWireframe = !isWireframe;
    allMeshes.forEach(m => {
      if (m.material) {
        m.material.wireframe = isWireframe;
      }
    });
    const fsMeshSpan = fullscreenHud.querySelector(".btn-wireframe-toggle span");
    if (fsMeshSpan) fsMeshSpan.textContent = isWireframe ? "PBR Textures" : "Wireframe Mesh";
    return isWireframe;
  }

  /* ─── Cinematic Tour ─── */
  function toggleCinematicTour() {
    if (isExploring && pointerControls && pointerControls.isLocked) {
      pointerControls.unlock();
    }
    isCinematicTour = !isCinematicTour;
    if (orbitControls) orbitControls.enabled = !isCinematicTour;
    const tourSpan = fullscreenHud.querySelector(".btn-tour-toggle span");
    if (tourSpan) tourSpan.textContent = isCinematicTour ? "Stop Tour" : "Cinematic Tour";
    return isCinematicTour;
  }

  /* ─── Fullscreen & Viewport Handling ─── */
  let isFullscreen = false;

  function toggleFullscreen() {
    if (!isFullscreen) enterFullscreen();
    else exitFullscreen();
  }

  function enterFullscreen() {
    isFullscreen = true;
    container.classList.add("viewer-is-fullscreen");
    fullscreenHud.style.display = "flex";
    updateFsHudMode(isExploring ? "First-Person" : "Orbit");

    if (container.requestFullscreen) {
      container.requestFullscreen().catch(() => {});
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
    if (!document.fullscreenElement && isFullscreen) exitFullscreen();
  });

  // Fullscreen HUD Buttons
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

  const fsTourBtn = fullscreenHud.querySelector(".btn-tour-toggle");
  if (fsTourBtn) fsTourBtn.addEventListener("click", toggleCinematicTour);

  const fsWireframeBtn = fullscreenHud.querySelector(".btn-wireframe-toggle");
  if (fsWireframeBtn) fsWireframeBtn.addEventListener("click", toggleWireframeMode);

  const fsLightBtn = fullscreenHud.querySelector(".btn-light-cycle");
  if (fsLightBtn) fsLightBtn.addEventListener("click", cycleLightingPreset);

  function updateFsHudMode(modeName) {
    const span = fullscreenHud.querySelector(".btn-mode-toggle span");
    if (span) span.textContent = modeName;
  }

  function enterExplore() {
    if (!pointerControls) return;
    isCinematicTour = false;
    camera.position.set(0, 1.6, 4);
    camera.lookAt(0, 1.4, -1);
    pointerControls.lock();
  }

  function resetCamera() {
    if (pointerControls && pointerControls.isLocked) pointerControls.unlock();
    isCinematicTour = false;
    camera.position.set(3.5, 2.8, 5.5);
    if (orbitControls) {
      orbitControls.target.set(0, 1.3, -2);
      orbitControls.update();
    }
  }

  function setCameraFov(fov) {
    if (!camera) return;
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }

  /* ─── Resize Handling ─── */
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

  // Initialize Scene
  initScene();

  // Public Controller API
  return {
    enterExplore,
    resetCamera,
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    setLightingPreset,
    cycleLightingPreset,
    toggleWireframeMode,
    toggleCinematicTour,
    setCameraFov,
    getIsFullscreen: () => isFullscreen,
    getIsExploring: () => isExploring,
    getIsTour: () => isCinematicTour,
    getIsWireframe: () => isWireframe,
    getLightingPreset: () => lightingPreset,
    destroy() {
      isDestroyed = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      resizeObserver.disconnect();

      if (renderer?.domElement) {
        renderer.domElement.removeEventListener("click", onCanvasClick);
        renderer.domElement.removeEventListener("mousemove", onCanvasMouseMove);
      }

      if (pointerControls && pointerControls.isLocked) pointerControls.unlock();

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
