import { createPhoneModel, bindThreeShape } from './phone.js';
import { clamp, lerp, supportsWebGL, nextSection } from './utils.js';
import { SECTION_ORDER } from './portfolioData.js';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

export async function initScene({ canvas, profile, getActiveSection, onSectionRequest }) {
  if (!canvas || !supportsWebGL()) {
    activateFallback();
    return createFallbackApi();
  }

  let THREE;
  try {
    THREE = await import(THREE_URL);
  } catch (error) {
    console.warn('Three.js could not be loaded:', error);
    activateFallback();
    return createFallbackApi();
  }

  bindThreeShape(THREE);

  canvas.style.pointerEvents = 'auto';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: profile.antialias,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(profile.maxPixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = profile.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(0, 0.12, 8.2);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x050506, 1.25);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 3.4);
  key.position.set(3.8, 4.8, 5.5);
  key.castShadow = profile.shadows;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xcfd7e3, 2.2);
  rim.position.set(-4.5, 1.5, 3.2);
  scene.add(rim);

  const soft = new THREE.PointLight(0xffffff, 1.4, 10);
  soft.position.set(0.2, -1.2, 3.4);
  scene.add(soft);

  const phone = createPhoneModel(THREE, profile);
  scene.add(phone.group);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();

  const state = {
    width: 1,
    height: 1,
    targetRotX: 0,
    targetRotY: 0,
    rotX: 0,
    rotY: 0,
    targetCamX: 0,
    targetCamY: 0,
    camX: 0,
    camY: 0.12,
    targetZoom: 8.2,
    zoom: 8.2,
    targetPhoneX: 1.18,
    phoneX: 1.18,
    pointerDown: null,
    active: true,
  };

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    const isMobile = state.width < 900;
    const isTablet = state.width < 1080;

    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
    renderer.setSize(state.width, state.height, false);

    const scale = isMobile ? 0.76 : isTablet ? 0.86 : 1;
    phone.group.scale.setScalar(scale);
    state.targetPhoneX = isMobile ? 0 : isTablet ? 0 : 1.18;
  }

  function updatePointer(event) {
    const nx = (event.clientX / state.width - 0.5) * 2;
    const ny = (event.clientY / state.height - 0.5) * 2;
    const closeness = 1 - clamp(Math.hypot(nx - 0.28, ny * 0.75), 0, 1);

    if (!profile.reducedMotion) {
      state.targetRotY = clamp(nx * 0.36, -0.36, 0.36);
      state.targetRotX = clamp(-ny * 0.22, -0.22, 0.22);
      state.targetCamX = nx * 0.18;
      state.targetCamY = 0.12 + -ny * 0.08;
      state.targetZoom = 8.2 - closeness * 0.52;
    }

    document.body.classList.toggle('cursor-phone', closeness > 0.48 && !profile.touch);
  }

  function pointerToNdc(event) {
    pointer.x = (event.clientX / state.width) * 2 - 1;
    pointer.y = -(event.clientY / state.height) * 2 + 1;
  }

  function getScreenUv(event) {
    pointerToNdc(event);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(phone.screenMesh, false);
    return hits.length ? hits[0].uv : null;
  }

  function onPointerDown(event) {
    state.pointerDown = {
      x: event.clientX,
      y: event.clientY,
      uv: getScreenUv(event),
    };
  }

  function onPointerUp(event) {
    if (!state.pointerDown) return;
    const dx = event.clientX - state.pointerDown.x;
    const dy = event.clientY - state.pointerDown.y;
    const distance = Math.hypot(dx, dy);
    const uv = getScreenUv(event) || state.pointerDown.uv;

    if (uv && Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy)) {
      const section = nextSection(SECTION_ORDER, getActiveSection(), dx < 0 ? 1 : -1);
      onSectionRequest(section);
    } else if (uv && distance < 14) {
      const requested = phone.handleScreenTap(uv);
      if (requested) onSectionRequest(requested);
    }

    state.pointerDown = null;
  }

  function render() {
    if (!state.active) return;
    const elapsed = clock.getElapsedTime();
    const delta = Math.min(clock.getDelta(), 0.033);

    state.rotX = lerp(state.rotX, state.targetRotX, 0.075);
    state.rotY = lerp(state.rotY, state.targetRotY, 0.075);
    state.camX = lerp(state.camX, state.targetCamX, 0.055);
    state.camY = lerp(state.camY, state.targetCamY, 0.055);
    state.zoom = lerp(state.zoom, state.targetZoom, 0.055);
    state.phoneX = lerp(state.phoneX, state.targetPhoneX, 0.06);

    const floatY = profile.reducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.075;
    phone.group.position.set(state.phoneX, floatY - 0.06, 0);
    phone.group.rotation.x = state.rotX;
    phone.group.rotation.y = state.rotY;
    phone.group.rotation.z = Math.sin(elapsed * 0.55) * 0.012;

    camera.position.x = state.camX;
    camera.position.y = state.camY;
    camera.position.z = state.zoom;
    camera.lookAt(state.phoneX * 0.48, 0, 0);

    phone.updateScreen(delta);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  resize();
  phone.setSection(getActiveSection());

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', updatePointer, { passive: true });
  canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });

  requestAnimationFrame(render);

  return {
    setSection(section) {
      phone.setSection(section);
    },
    destroy() {
      state.active = false;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      phone.dispose();
      renderer.dispose();
    },
  };
}

function activateFallback() {
  document.body.classList.add('webgl-fallback-active');
}

function createFallbackApi() {
  return {
    setSection() {},
    destroy() {},
  };
}