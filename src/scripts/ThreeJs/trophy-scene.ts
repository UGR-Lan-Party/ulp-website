import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadTrophy } from './ULPTrophy';
import { applyTrophyFinish } from './trophy-finish';
import {
  trophyFitDistance,
  measureTrophyBounds,
} from '../../utils/trophy-framing.js';

export async function mountTrophy(
  container: HTMLElement,
  path: string,
  signal: AbortSignal,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(15, 10, 15);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI / 2;
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  if (path.endsWith('/lol.obj')) {
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  }
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(20, 20, 20);
  scene.add(light);
  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  backLight.position.set(5, 8, -15);
  scene.add(backLight);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let visible = true;
  let disposed = false;
  let trophy: THREE.Group;
  let radius = 1;
  let fitted = false;
  const cameraOffset = new THREE.Vector3();

  function disposeScene() {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.geometry.dispose();
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        material.dispose();
      });
    });
    controls.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  try {
    const model = await loadTrophy(path, signal);
    applyTrophyFinish(model);
    const sphere = measureTrophyBounds(model);
    radius = sphere.radius || 1;
    // Rotate about the model's center rather than the OBJ's export origin.
    model.position.sub(sphere.center);
    trophy = new THREE.Group();
    trophy.add(model);
    scene.add(trophy);
    signal.throwIfAborted();
  } catch (error) {
    disposeScene();
    throw error;
  }

  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Trofeo 3D interactivo');
  renderer.domElement.style.touchAction = 'pan-y';
  renderer.domElement.tabIndex = 0;
  controls.listenToKeyEvents(renderer.domElement);

  function render() {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    if (!reducedMotion.matches) trophy.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
    if (!reducedMotion.matches) frame = requestAnimationFrame(render);
  }
  function updateVisibility() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!disposed && visible && !document.hidden) render();
  }
  function renderInteraction() {
    if (reducedMotion.matches && !frame) frame = requestAnimationFrame(render);
  }
  controls.addEventListener('change', renderInteraction);
  reducedMotion.addEventListener('change', updateVisibility);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateVisibility();
  });
  visibility.observe(container);
  document.addEventListener('visibilitychange', updateVisibility);
  function resizeCanvas() {
    const { clientWidth: width, clientHeight: height } = container;
    if (!width || !height) return;
    camera.aspect = width / height;
    const previousMinimum = controls.minDistance;
    const zoomRatio = fitted
      ? camera.position.distanceTo(controls.target) / previousMinimum
      : 1.2;
    controls.minDistance = trophyFitDistance(radius, camera.fov, camera.aspect);
    controls.maxDistance = controls.minDistance * 2.5;
    cameraOffset.copy(camera.position).sub(controls.target).normalize();
    camera.position
      .copy(controls.target)
      .addScaledVector(
        cameraOffset,
        controls.minDistance * THREE.MathUtils.clamp(zoomRatio, 1, 2.5),
      );
    camera.near = Math.max(radius * 0.001, 0.0001);
    camera.far = controls.maxDistance + radius * 3;
    camera.updateProjectionMatrix();
    controls.update();
    fitted = true;
    renderer.setSize(width, height);
    updateVisibility();
  }
  const resize = new ResizeObserver(resizeCanvas);
  resize.observe(container);
  resizeCanvas();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    visibility.disconnect();
    resize.disconnect();
    controls.removeEventListener('change', renderInteraction);
    reducedMotion.removeEventListener('change', updateVisibility);
    document.removeEventListener('visibilitychange', updateVisibility);
    disposeScene();
  };
}
