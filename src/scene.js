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
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = profile.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 90);
  camera.position.set(0, 0.18, 11.4);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x050506, 1.35);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 3.6);
  key.position.set(4.2, 5.2, 6.5);
  key.castShadow = profile.shadows;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xcfd7e3, 2.6);
  rim.position.set(-5.2, 1.7, 4.2);
  scene.add(rim);

  const soft = new THREE.PointLight(0xffffff, 1.55, 12);
  soft.position.set(0.2, -1.2, 4.2);
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
    targetRotY: -0.16,
    rotX: 0,
    rotY: -0.16,
    targetCamX: 0,
    targetCamY: 0.18,
    camX: 0,
    camY: 0.18,
    baseZoom: 11.4,
    targetZoom: 11.4,
    zoom: 11.4,
    targetPhoneX: 2.35,
    phoneX: 2.35,
    targetPhoneY: -0.08,
    phoneY: -0.08,
    pointerDown: null,
    active: true,
  };

  function layoutForViewport() {
    const isMobile = state.width < 760;
    const isTablet = state.width >= 760 && state.width < 1080;
    const isShort = state.height < 760;

    if (isMobile) {
      return {
        scale: isShort ? 0.56 : 0.62,
        phoneX: 0,
        phoneY: -0.55,
        zoom: 12.2,
        fov: 34,
        lookAtX: 0,
      };
    }

    if (isTablet) {
      return {
        scale: 0.64,
        phoneX: 0.95,
        phoneY: -0.18,
        zoom: 12.0,
        fov: 33,
        lookAtX: 0.34,
      };
    }

    return {
      scale: isShort ? 0.62 : 0.69,
      phoneX: 2.35,
      phoneY: isShort ? -0.18 : -0.08,
      zoom: isShort ? 12.4 : 11.4,
      fov: 32,
      lookAtX: 0.78,
    };
  }

  let layout = layoutForViewport();

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    layout = layoutForViewport();

    camera.aspect = state.width / state.height;
    camera.fov = layout.fov;
    camera.updateProjectionMatrix();
    renderer.setSize(state.width, state.height, false);

    phone.group.scale.setScalar(layout.scale);
    state.targetPhoneX = layout.phoneX;
    state.targetPhoneY = layout.phoneY;
    state.baseZoom = layout.zoom;
    state.targetZoom = layout.zoom;
  }

  function updatePointer(event) {
    const nx = (event.clientX / state.width - 0.5) * 2;
    const ny = (event.clientY / state.height - 0.5) * 2;
    const phoneScreenX = state.width < 760 ? 0 : 0.45;
    const closeness = 1 - clamp(Math.hypot(nx - phoneScreenX, ny * 0.72), 0, 1);

    if (!profile.reducedMotion) {
      state.targetRotY = -0.16 + clamp(nx * 0.28, -0.26, 0.26);
      state.targetRotX = clamp(-ny * 0.18, -0.18, 0.18);
      state.targetCamX = nx * 0.12;
      state.targetCamY = layout.phoneY * 0.06 + 0.18 + -ny * 0.055;
      state.targetZoom = state.baseZoom - closeness * 0.38;
    }

    document.body.classList.toggle('cursor-phone', closeness > 0.45 && !profile.touch);
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
    state.phoneY = lerp(state.phoneY, state.targetPhoneY, 0.06);

    const floatY = profile.reducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.065;
    phone.group.position.set(state.phoneX, state.phoneY + floatY, 0);
    phone.group.rotation.x = state.rotX;
    phone.group.rotation.y = state.rotY;
    phone.group.rotation.z = Math.sin(elapsed * 0.55) * 0.01;

    camera.position.x = state.camX;
    camera.position.y = state.camY;
    camera.position.z = state.zoom;
    camera.lookAt(layout.lookAtX, state.phoneY * 0.15, 0);

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