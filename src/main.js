import * as THREE from "three";
import "./style.css";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js"; 

const viewer = document.getElementById("viewer");
console.log("Viewer element:", viewer);
console.log("Viewer ID exists:", document.getElementById("viewer"));
console.log("HTML contains viewer:", document.documentElement.innerHTML.includes('id="viewer"'));
const startBtn = document.getElementById("startBtn");
const status = document.getElementById("status");
const loading = document.getElementById("loading");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#c4d4c5");

// Camera
const camera = new THREE.PerspectiveCamera(
  70,
  viewer.clientWidth / viewer.clientHeight,
  0.1,
  100
);

camera.position.set(0, 1.6, 4);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;

viewer.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x667766, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(3, 8, 5);
light.castShadow = true;
scene.add(light);

// Materials
const floorMaterial = new THREE.MeshStandardMaterial({
  color: "#c6b69a"
});

const wallMaterial = new THREE.MeshStandardMaterial({
  color: "#eee9dd"
});

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  floorMaterial
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Room walls
function addWall(width, height, depth, x, y, z) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    wallMaterial
  );

  wall.position.set(x, y, z);
  wall.receiveShadow = true;
  scene.add(wall);
}

addWall(10, 3.5, 0.15, 0, 1.75, -5);
addWall(0.15, 3.5, 10, -5, 1.75, 0);
addWall(0.15, 3.5, 10, 5, 1.75, 0);

// Temporary furniture
function addBox(width, height, depth, color, x, y, z) {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshStandardMaterial({ color })
  );

  object.position.set(x, y, z);
  object.castShadow = true;
  object.receiveShadow = true;
  scene.add(object);
}

// Table
addBox(1.8, 0.15, 1, "#875e40", -1.4, 0.9, -1.5);
addBox(0.12, 0.9, 0.12, "#62432f", -2.15, 0.45, -1.9);
addBox(0.12, 0.9, 0.12, "#62432f", -0.65, 0.45, -1.9);
addBox(0.12, 0.9, 0.12, "#62432f", -2.15, 0.45, -1.1);
addBox(0.12, 0.9, 0.12, "#62432f", -0.65, 0.45, -1.1);

// Sofa
addBox(2.2, 0.6, 0.8, "#78967d", 1.5, 0.35, -3);
addBox(2.2, 0.7, 0.2, "#52725b", 1.5, 0.8, -3.3);

// Mouse controls
const controls = new PointerLockControls(camera, viewer);

startBtn.addEventListener("click", () => {
  controls.lock();
});

controls.addEventListener("lock", () => {
  status.textContent = "Exploring";
  loading.textContent = "Press ESC to exit";
});

controls.addEventListener("unlock", () => {
  status.textContent = "Ready";
  loading.textContent = "Click Start Exploring to continue";
});

// Keyboard input
const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false
};

window.addEventListener("keydown", (event) => {
  if (event.code in keys) {
    keys[event.code] = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code in keys) {
    keys[event.code] = false;
  }
});

window.addEventListener("blur", () => {
  for (const key in keys) {
    keys[key] = false;
  }
});

// Animation and movement
const clock = new THREE.Clock();
const speed = 3;

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (controls.isLocked) {
    const forward =
      Number(keys.KeyW) - Number(keys.KeyS);

    const sideways =
      Number(keys.KeyD) - Number(keys.KeyA);

    const length = Math.hypot(forward, sideways);

    if (length > 0) {
      controls.moveForward(
        (forward / length) * speed * delta
      );

      controls.moveRight(
        (sideways / length) * speed * delta
      );
    }

    camera.position.y = 1.6;

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x, -4.5, 4.5
    );

    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z, -4.5, 4.5
    );
  }

  renderer.render(scene, camera);
}

animate();

// Resize the 3D view
const observer = new ResizeObserver(() => {
  const width = viewer.clientWidth;
  const height = viewer.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

observer.observe(viewer);

loading.textContent = "Sample room ready";
status.textContent = "Ready";
