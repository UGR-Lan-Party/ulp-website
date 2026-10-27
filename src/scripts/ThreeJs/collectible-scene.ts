import { siteMotion } from '../../utils/site-motion.js';
import * as THREE from 'three';
import {
  nearestEquivalentAngle,
  fittedDistance,
} from '../../utils/collectible-view.js';
import { makeClothShirt, type ShirtDesign } from './cloth-shirt';
import { makeMinecraftSkin } from './minecraft-skin';

export async function mountCollectible(
  stage: HTMLElement,
  kind: 'shirt' | 'skin',
  design: ShirtDesign | string,
  signal: AbortSignal,
  onLost: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(39, 1, 0.01, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xc7c1b4, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9eaff, 1.2);
  fill.position.set(3, 2, -4);
  scene.add(fill);
  const pivot = new THREE.Group();
  scene.add(pivot);
  let model:
    | Awaited<ReturnType<typeof makeClothShirt>>
    | Awaited<ReturnType<typeof makeMinecraftSkin>>;
  try {
    model =
      kind === 'shirt'
        ? await makeClothShirt(design as ShirtDesign, signal)
        : await makeMinecraftSkin(design as string, signal);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  const fitPoints: number[][] = [];
  if (kind === 'skin') {
    model.group.updateMatrixWorld(true);
    model.group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const vertices = child.geometry.getAttribute('position');
      const point = new THREE.Vector3();
      for (let i = 0; i < vertices.count; i++) {
        point.fromBufferAttribute(vertices, i).applyMatrix4(child.matrixWorld);
        fitPoints.push(point.toArray());
      }
    });
  }
  pivot.add(model.group);
  const canvas = renderer.domElement;
  canvas.className = 'collectible-canvas';
  canvas.setAttribute(
    'aria-label',
    kind === 'shirt'
      ? 'Camiseta 3D; clic o Intro para ampliar; arrastra para girar o usa las flechas'
      : 'Skin oficial ULP en 3D; arrastra para girar o usa las flechas',
  );
  canvas.tabIndex = stage.closest('[data-rail-copy]') ? -1 : 0;
  canvas.style.touchAction = 'pan-y';
  stage.append(canvas);
  const reduced = siteMotion();
  const defaultYaw = kind === 'shirt' ? Math.PI - 0.24 : 0.4;
  const defaultPitch = kind === 'shirt' ? 0.03 : 0.08;
  const defaultZoom = 1;
  const maxZoom = kind === 'shirt' ? 1 : 1.16;
  let yaw = defaultYaw,
    targetYaw = yaw,
    pitch = defaultPitch,
    targetPitch = pitch;
  let previousSpin = 0,
    last = 0,
    physicsUntil = 0,
    frame = 0,
    visible = false,
    disposed = false,
    paused = kind === 'shirt';
  let pointer: { id: number; x: number; y: number } | null = null;
  let zoom = defaultZoom;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  };
  function render(now: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    const auto = !paused && !reduced.matches && !pointer;
    if (auto) targetYaw += dt * 0.25;
    const old = yaw;
    const blend = reduced.matches ? 1 : 1 - Math.exp(-dt * 14);
    yaw += (targetYaw - yaw) * blend;
    pitch += (targetPitch - pitch) * blend;
    const spin = (yaw - old) / dt,
      acceleration = (spin - previousSpin) / dt;
    previousSpin = spin;
    pivot.rotation.set(pitch, yaw, 0);
    const clothActive =
      kind === 'shirt' && !reduced.matches && now < physicsUntil;
    if (clothActive && 'update' in model) model.update(dt, spin, acceleration);
    if (kind === 'skin') frameSkin();
    renderer.render(scene, camera);
    if (
      auto ||
      pointer ||
      clothActive ||
      Math.abs(targetYaw - yaw) + Math.abs(targetPitch - pitch) > 0.001
    )
      frame = requestAnimationFrame(render);
    else last = 0;
  }
  function wake() {
    if (!disposed && visible && !document.hidden && !frame)
      frame = requestAnimationFrame(render);
  }
  function disturb() {
    physicsUntil = performance.now() + 2600;
    wake();
  }
  function frameSkin() {
    const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const comfort = fittedDistance(
      fitPoints,
      pitch,
      yaw,
      tangent,
      camera.aspect,
      0.84,
    );
    const closest = fittedDistance(
      fitPoints,
      pitch,
      yaw,
      tangent,
      camera.aspect,
      0.96,
    );
    camera.position.set(0, 0, Math.max(closest, comfort / zoom));
    camera.lookAt(0, 0, 0);
  }
  function resetView() {
    zoom = defaultZoom;
    targetYaw = nearestEquivalentAngle(yaw, defaultYaw);
    targetPitch = defaultPitch;
    if ('reset' in model) model.reset();
    resize();
    disturb();
  }
  function resize() {
    const { clientWidth: w, clientHeight: h } = stage;
    if (!w || !h) return;
    camera.aspect = w / h;
    const angle = THREE.MathUtils.degToRad(camera.fov) / 2;
    const fit =
      (model.radius /
        Math.sin(Math.min(angle, Math.atan(Math.tan(angle) * camera.aspect)))) *
      1.04;
    camera.position.set(0, kind === 'shirt' ? 0.18 : 0, fit / zoom);
    if (kind === 'skin') frameSkin();
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    wake();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else stop();
  });
  visibility.observe(stage);
  const visibilityChange = () => {
    if (document.hidden) stop();
    else wake();
  };
  const motionChange = () => {
    if (reduced.matches) {
      if ('reset' in model) model.reset();
      physicsUntil = 0;
    }
    wake();
  };
  reduced.addEventListener('change', motionChange);
  document.addEventListener('visibilitychange', visibilityChange);
  canvas.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return;
      pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      stage.dispatchEvent(
        new CustomEvent('collectible-interaction', {
          bubbles: true,
          detail: true,
        }),
      );
      disturb();
    },
    { signal },
  );
  canvas.addEventListener(
    'pointermove',
    (e) => {
      if (!pointer || pointer.id !== e.pointerId) return;
      targetYaw += (e.clientX - pointer.x) * 0.012;
      targetPitch = THREE.MathUtils.clamp(
        targetPitch + (e.clientY - pointer.y) * 0.007,
        0,
        0.65,
      );
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      disturb();
    },
    { signal },
  );
  const release = () => {
    if (!pointer) return;
    pointer = null;
    stage.dispatchEvent(
      new CustomEvent('collectible-interaction', {
        bubbles: true,
        detail: false,
      }),
    );
    disturb();
  };
  canvas.addEventListener('pointerup', release, { signal });
  canvas.addEventListener('pointercancel', release, { signal });
  canvas.addEventListener('lostpointercapture', release, { signal });
  canvas.addEventListener(
    'keydown',
    (e) => {
      if (
        ![
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'Home',
          '+',
          '-',
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      if (e.key === 'Home') {
        resetView();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
        targetYaw += (e.key === 'ArrowLeft' ? -1 : 1) * 0.4;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        targetPitch = THREE.MathUtils.clamp(
          targetPitch + (e.key === 'ArrowUp' ? 1 : -1) * 0.15,
          0,
          0.65,
        );
      else {
        zoom = THREE.MathUtils.clamp(
          zoom + (e.key === '+' ? 0.1 : -0.1),
          0.7,
          maxZoom,
        );
        resize();
      }
      disturb();
    },
    { signal },
  );
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      stop();
      onLost();
    },
    { signal },
  );
  return {
    zoomBy(factor: number) {
      zoom = THREE.MathUtils.clamp(zoom * factor, 0.7, maxZoom);
      resize();
    },
    pause(value: boolean) {
      paused = value;
      wake();
    },
    reset: resetView,
    dispose() {
      disposed = true;
      stop();
      observer.disconnect();
      visibility.disconnect();
      reduced.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', visibilityChange);
      const textures = new Set<THREE.Texture>(),
        materials = new Set<THREE.Material>();
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        (Array.isArray(child.material)
          ? child.material
          : [child.material]
        ).forEach((material) => {
          materials.add(material);
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) textures.add(value);
          });
        });
      });
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      if ('dispose' in model) model.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
