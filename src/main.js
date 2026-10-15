import * as THREE from "three";
import "./style.css";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls }       from "three/addons/controls/OrbitControls.js";

/* ─── DOM refs ─── */
const viewer    = document.getElementById("viewer");
const startBtn  = document.getElementById("startBtn");
const status    = document.getElementById("status");
const loading   = document.getElementById("loading");
const orbitHint = document.getElementById("orbitHint");

/* ─── Scene ─── */
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0b1c14");
scene.fog = new THREE.FogExp2("#0b1c14", 0.045);

/* ─── Camera ─── */
const camera = new THREE.PerspectiveCamera(
  68,
  viewer.clientWidth / viewer.clientHeight,
  0.1,
  80
);
camera.position.set(3.5, 2.8, 5.5);

/* ─── Renderer ─── */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
viewer.appendChild(renderer.domElement);

/* ─── Lights ─── */
// Ambient
scene.add(new THREE.AmbientLight(0xb8d9c8, 0.5));

// Hemisphere
const hemi = new THREE.HemisphereLight(0xddeeff, 0x223322, 1.2);
scene.add(hemi);

// Main sun-through-window directional
const sunLight = new THREE.DirectionalLight(0xfff4e0, 2.8);
sunLight.position.set(4, 9, 5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 30;
sunLight.shadow.camera.left  = -8;
sunLight.shadow.camera.right =  8;
sunLight.shadow.camera.top   =  8;
sunLight.shadow.camera.bottom= -8;
sunLight.shadow.bias = -0.001;
scene.add(sunLight);

// Cool fill from opposite side
const fillLight = new THREE.DirectionalLight(0x9ac4e8, 0.6);
fillLight.position.set(-5, 4, 3);
scene.add(fillLight);

// Warm lamp point
const lampLight = new THREE.PointLight(0xffcc88, 3.5, 7, 2);
lampLight.position.set(-1.5, 2.8, -2.5);
lampLight.castShadow = true;
scene.add(lampLight);

/* ─── Materials ─── */
const floorMat = new THREE.MeshStandardMaterial({
  color: "#c8b89e", roughness: 0.82, metalness: 0.03
});
const wallMat = new THREE.MeshStandardMaterial({
  color: "#ece7db", roughness: 0.92, metalness: 0
});
const ceilMat = new THREE.MeshStandardMaterial({
  color: "#f3efe6", roughness: 1, metalness: 0
});

/* ─── Floor ─── */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

/* ─── Ceiling ─── */
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilMat);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 3.5;
scene.add(ceiling);

/* ─── Walls ─── */
function wall(w, h, d, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  m.position.set(x, y, z);
  m.receiveShadow = true;
  scene.add(m);
  return m;
}
wall(10, 3.5, 0.12, 0,  1.75, -5);   // back
wall(0.12, 3.5, 10, -5, 1.75,  0);   // left
wall(0.12, 3.5, 10,  5, 1.75,  0);   // right

/* ─── Helper: box object ─── */
function box(w, h, d, color, x, y, z, rough = 0.78) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 })
  );
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

/* ─── Furniture ─── */

// Wooden table
box(1.9, 0.08, 0.9, "#8a6040",  -1.5, 0.97, -2.5);
box(0.08, 0.97, 0.08, "#634530", -2.25, 0.485, -2.87);
box(0.08, 0.97, 0.08, "#634530", -0.75, 0.485, -2.87);
box(0.08, 0.97, 0.08, "#634530", -2.25, 0.485, -2.13);
box(0.08, 0.97, 0.08, "#634530", -0.75, 0.485, -2.13);

// Laptop on table
box(0.52, 0.025, 0.34, "#2d2d2d", -1.5, 1.035, -2.5, 0.15);
box(0.52, 0.30,  0.02, "#1a1a1a", -1.5, 1.18,  -2.67, 0.1);

// Monitor on table
box(0.04, 0.45, 0.55, "#111", -0.78, 1.24, -2.5, 0.1);
box(0.3, 0.04, 0.18, "#111", -0.78, 1.0, -2.44, 0.1);

// Sofa
box(2.4, 0.52, 0.9, "#78967d",  1.8, 0.28, -3.3, 0.9);
box(2.4, 0.68, 0.18, "#4e6e57", 1.8, 0.8, -3.66, 0.9);
box(0.2, 0.68, 0.9, "#4e6e57",  0.6, 0.52, -3.3, 0.9);   // left arm
box(0.2, 0.68, 0.9, "#4e6e57",  3.0, 0.52, -3.3, 0.9);   // right arm
// Sofa cushion
box(1.1, 0.14, 0.5, "#8aac8e", 1.18, 0.6, -3.12, 0.95);
box(1.1, 0.14, 0.5, "#8aac8e", 2.42, 0.6, -3.12, 0.95);

// Tall bookshelf
box(0.16, 2.6, 1.4, "#7a5a38", -4.46, 1.3, -3.5);
box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 0.3, -3.5);
box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 0.95, -3.5);
box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 1.6, -3.5);
box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 2.25, -3.5);
box(1.4, 0.05, 0.3, "#8a6a48", -4.46, 2.58, -3.5);

// Books
const bookCols = ["#c0392b","#2980b9","#27ae60","#f39c12","#8e44ad","#16a085","#e74c3c","#3498db"];
bookCols.forEach((c, i) => {
  const bh = 0.2 + Math.random() * 0.1;
  box(0.065, bh, 0.24, c, -3.8 + i * 0.17, 0.98 + bh/2, -3.5, 0.6);
});
// Second shelf books
["#d35400","#2c3e50","#1abc9c","#e91e63"].forEach((c, i) => {
  const bh = 0.18 + Math.random() * 0.08;
  box(0.065, bh, 0.24, c, -3.8 + i * 0.18, 1.63 + bh/2, -3.5, 0.6);
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

// Rug inner pattern suggestion
const rugInner = new THREE.Mesh(
  new THREE.PlaneGeometry(2.6, 1.6),
  new THREE.MeshStandardMaterial({ color: "#8f6050", roughness: 0.98 })
);
rugInner.rotation.x = -Math.PI / 2;
rugInner.position.set(1.8, 0.003, -2.8);
scene.add(rugInner);

// Floor lamp
box(0.06, 1.65, 0.06, "#c0a060", -1.4, 0.825, -2.45); // pole
box(0.22, 0.22, 0.22, "#b09050", -1.4, 1.72, -2.45);  // shade

// Window on back wall (light rectangle)
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

// Window frame
box(0.06, 1.3, 0.08, "#d0c8b8", 1.72, 2.25, -4.93);
box(0.06, 1.3, 0.08, "#d0c8b8", 3.48, 2.25, -4.93);
box(1.84, 0.06, 0.08, "#d0c8b8", 2.6, 2.92, -4.93);
box(1.84, 0.06, 0.08, "#d0c8b8", 2.6, 1.58, -4.93);
box(0.06, 1.3, 0.08, "#d0c8b8", 2.6, 2.25, -4.93); // cross piece

// Window light source
const winLight = new THREE.RectAreaLight(0xd0e8ff, 6, 1.8, 1.3);
winLight.position.set(2.6, 2.25, -4.5);
winLight.lookAt(2.6, 2.25, 0);
scene.add(winLight);

// Coffee table
box(0.85, 0.06, 0.55, "#a07a50", 1.8, 0.42, -2.2);
box(0.06, 0.42, 0.06, "#7a5a38", 1.48, 0.21, -1.98);
box(0.06, 0.42, 0.06, "#7a5a38", 2.12, 0.21, -1.98);
box(0.06, 0.42, 0.06, "#7a5a38", 1.48, 0.21, -2.42);
box(0.06, 0.42, 0.06, "#7a5a38", 2.12, 0.21, -2.42);

// Small plant pot
const potGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.18, 8);
const potMat = new THREE.MeshStandardMaterial({ color: "#b05030", roughness: 0.9 });
const pot = new THREE.Mesh(potGeo, potMat);
pot.position.set(-1.0, 1.06, -2.44);
pot.castShadow = true;
scene.add(pot);

// Plant sphere (leaves)
const plantGeo = new THREE.SphereGeometry(0.14, 8, 6);
const plantMat = new THREE.MeshStandardMaterial({ color: "#3a8040", roughness: 0.9 });
const plant = new THREE.Mesh(plantGeo, plantMat);
plant.position.set(-1.0, 1.25, -2.44);
plant.castShadow = true;
scene.add(plant);

/* ═══════════════════════════════════════
   CONTROLS
   ═══════════════════════════════════════ */

/* ─── Orbit Controls (Showcase Mode) ─── */
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.target.set(0, 1.3, -2);
orbitControls.autoRotate      = true;
orbitControls.autoRotateSpeed = 0.55;
orbitControls.enableDamping   = true;
orbitControls.dampingFactor   = 0.07;
orbitControls.enablePan       = false;
orbitControls.minDistance     = 2.5;
orbitControls.maxDistance     = 10;
orbitControls.minPolarAngle   = 0.25;
orbitControls.maxPolarAngle   = Math.PI / 2 - 0.08;
orbitControls.update();

/* ─── Pointer Lock Controls (Explore Mode) ─── */
const pointerControls = new PointerLockControls(camera, viewer);
let isExploring = false;

function enterExploreMode() {
  camera.position.set(0, 1.6, 4);
  camera.lookAt(0, 1.4, -1);
  pointerControls.lock();
}

startBtn.addEventListener("click", enterExploreMode);

pointerControls.addEventListener("lock", () => {
  isExploring = true;
  orbitControls.enabled = false;
  if (orbitHint) orbitHint.style.opacity = "0";
  status.textContent = "Exploring";
  loading.textContent = "Press ESC to exit";
});

pointerControls.addEventListener("unlock", () => {
  isExploring = false;
  orbitControls.enabled = true;
  orbitControls.autoRotate = true;
  if (orbitHint) orbitHint.style.opacity = "1";
  status.textContent = "Ready";
  loading.textContent = "Sample room ready";
  // Smoothly pull camera back to orbit position
  camera.position.set(3.5, 2.8, 5.5);
});

/* ─── Keyboard input ─── */
const keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
window.addEventListener("keydown", e => { if (e.code in keys) keys[e.code] = true; });
window.addEventListener("keyup",   e => { if (e.code in keys) keys[e.code] = false; });
window.addEventListener("blur",    () => { for (const k in keys) keys[k] = false; });

/* ═══════════════════════════════════════
   ANIMATION LOOP
   ═══════════════════════════════════════ */
const clock = new THREE.Clock();
const SPEED = 3.2;

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  const t     = clock.elapsedTime;

  if (isExploring && pointerControls.isLocked) {
    /* First-person movement */
    const fwd  = Number(keys.KeyW) - Number(keys.KeyS);
    const side = Number(keys.KeyD) - Number(keys.KeyA);
    const len  = Math.hypot(fwd, side);
    if (len > 0) {
      pointerControls.moveForward((fwd  / len) * SPEED * delta);
      pointerControls.moveRight  ((side / len) * SPEED * delta);
    }
    camera.position.y = 1.6;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -4.5, 4.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -4.5, 4.5);
  } else {
    orbitControls.update();
  }

  /* Lamp flicker */
  lampLight.intensity = 3.5 + Math.sin(t * 1.7) * 0.25 + Math.sin(t * 3.3) * 0.1;

  /* Window light pulse (daylight) */
  winLight.intensity = 6 + Math.sin(t * 0.4) * 0.3;

  renderer.render(scene, camera);
}

animate();

/* ─── Resize observer ─── */
const resizeObs = new ResizeObserver(() => {
  const w = viewer.clientWidth;
  const h = viewer.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
resizeObs.observe(viewer);

loading.textContent = "Sample room ready";
status.textContent  = "Ready";
