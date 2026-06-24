import { SECTION_ORDER, portfolio } from './portfolioData.js';
import { clamp, lerp } from './utils.js';

export function createPhoneModel(THREE, profile) {
  const group = new THREE.Group();
  group.name = 'ShahineProceduralPhone';

  const phoneWidth = 3.08;
  const phoneHeight = 6.42;
  const phoneDepth = 0.34;
  const screenWidth = 2.72;
  const screenHeight = 5.84;
  const bevelSegments = profile.lowPower ? 5 : 9;

  const chassisGeometry = new THREE.ExtrudeGeometry(roundedRectShape(phoneWidth, phoneHeight, 0.46), {
    depth: phoneDepth,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.05,
    bevelSegments,
    curveSegments: profile.lowPower ? 10 : 18,
  });
  chassisGeometry.translate(0, 0, -phoneDepth * 0.5);

  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb9bdc4,
    metalness: 0.94,
    roughness: 0.24,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  });

  const chassis = new THREE.Mesh(chassisGeometry, metalMaterial);
  chassis.castShadow = profile.shadows;
  chassis.receiveShadow = profile.shadows;
  group.add(chassis);

  const innerFrameGeometry = new THREE.ExtrudeGeometry(roundedRectShape(2.88, 6.16, 0.39), {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.018,
    bevelSegments: profile.lowPower ? 3 : 5,
    curveSegments: 12,
  });
  innerFrameGeometry.translate(0, 0, phoneDepth * 0.5 + 0.006);

  const frameMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050607,
    metalness: 0.55,
    roughness: 0.34,
    clearcoat: 0.55,
  });

  const innerFrame = new THREE.Mesh(innerFrameGeometry, frameMaterial);
  group.add(innerFrame);

  const screen = createScreenSurface(THREE, profile, screenWidth, screenHeight, phoneDepth);
  group.add(screen.mesh);

  const island = createIsland(THREE, phoneDepth);
  group.add(island);

  const glassGeometry = new THREE.PlaneGeometry(screenWidth * 0.985, screenHeight * 0.985);
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.11,
    roughness: 0.05,
    metalness: 0,
    transmission: profile.lowPower ? 0 : 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    depthWrite: false,
  });
  const glass = new THREE.Mesh(glassGeometry, glassMaterial);
  glass.position.z = phoneDepth * 0.5 + 0.029;
  group.add(glass);

  createButtons(THREE, group, metalMaterial, phoneWidth, phoneDepth);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.82, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false })
  );
  shadow.position.set(0.1, -3.82, -0.52);
  shadow.scale.set(1.28, 0.28, 1);
  group.add(shadow);

  return {
    group,
    screenMesh: screen.mesh,
    setSection: screen.setSection,
    updateScreen: screen.update,
    handleScreenTap: screen.handleTap,
    dispose() {
      [chassisGeometry, innerFrameGeometry, glassGeometry].forEach((geometry) => geometry.dispose());
      [metalMaterial, frameMaterial, glassMaterial].forEach((material) => material.dispose());
      screen.dispose();
    },
  };
}

function createScreenSurface(THREE, profile, width, height, depth) {
  const textureSize = profile.screenTextureSize;
  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = Math.round(textureSize * 2.08);

  const ctx = canvas.getContext('2d', { alpha: false });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'InteractivePortfolioScreen';
  mesh.position.z = depth * 0.5 + 0.021;

  const state = {
    activeSection: 'home',
    skillProgress: 0,
    pulse: 0,
    needsRedraw: true,
  };

  function setSection(section) {
    if (!SECTION_ORDER.includes(section)) return;
    state.activeSection = section;
    state.skillProgress = section === 'skills' ? 0 : state.skillProgress;
    state.needsRedraw = true;
  }

  function update(delta) {
    state.pulse += delta;
    if (state.activeSection === 'skills') {
      const next = lerp(state.skillProgress, 1, 0.07);
      if (Math.abs(next - state.skillProgress) > 0.001) {
        state.skillProgress = next;
        state.needsRedraw = true;
      }
    }

    if (state.activeSection === 'edits' && !profile.reducedMotion) {
      state.needsRedraw = true;
    }

    if (state.needsRedraw) {
      drawPortfolioScreen(ctx, canvas, state, profile);
      texture.needsUpdate = true;
      state.needsRedraw = false;
    }
  }

  function handleTap(uv) {
    if (!uv) return null;
    if (uv.y < 0.13) {
      const index = clamp(Math.floor(uv.x * SECTION_ORDER.length), 0, SECTION_ORDER.length - 1);
      return SECTION_ORDER[index];
    }

    if (state.activeSection === 'home' && uv.y < 0.32) return 'edits';
    return SECTION_ORDER[(SECTION_ORDER.indexOf(state.activeSection) + 1) % SECTION_ORDER.length];
  }

  drawPortfolioScreen(ctx, canvas, state, profile);
  texture.needsUpdate = true;

  return {
    mesh,
    setSection,
    update,
    handleTap,
    dispose() {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

function drawPortfolioScreen(ctx, canvas, state, profile) {
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#11141a');
  bg.addColorStop(0.52, '#07080b');
  bg.addColorStop(1, '#030405');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, w * 0.72);
  glow.addColorStop(0, 'rgba(255,255,255,0.15)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  drawGrid(ctx, w, h, profile.lowPower ? 72 : 54);
  drawStatus(ctx, w);

  if (state.activeSection === 'home') drawHome(ctx, w, h);
  if (state.activeSection === 'edits') drawEdits(ctx, w, h, state.pulse);
  if (state.activeSection === 'skills') drawSkills(ctx, w, h, state.skillProgress);
  if (state.activeSection === 'contact') drawContact(ctx, w, h);

  drawNav(ctx, w, h, state.activeSection);
}

function drawStatus(ctx, w) {
  ctx.save();
  ctx.fillStyle = 'rgba(245,245,245,0.68)';
  ctx.font = '700 20px Inter, Arial, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('SHAHINE', 52, 112);
  ctx.beginPath();
  ctx.arc(w - 58, 104, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245,245,245,0.92)';
  ctx.shadowColor = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.restore();
}

function drawHome(ctx, w, h) {
  drawLabel(ctx, 'PORTFOLIO MOBILE', 52, 190);
  drawChromeText(ctx, portfolio.name, 52, 282, 72);
  ctx.fillStyle = 'rgba(215,219,224,0.9)';
  ctx.font = '600 32px Inter, Arial, sans-serif';
  ctx.fillText(portfolio.role, 54, 330);
  drawParagraph(ctx, portfolio.tagline, 54, 390, w - 108, 34, 'rgba(205,210,216,0.88)', 28);

  const cardY = 492;
  const gap = 18;
  const cardW = (w - 104 - gap * 2) / 3;
  portfolio.stats.forEach((stat, index) => {
    const x = 52 + index * (cardW + gap);
    glassRect(ctx, x, cardY, cardW, 116, 26);
    ctx.fillStyle = '#f4f2ec';
    ctx.font = '800 31px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stat.value, x + cardW / 2, cardY + 48);
    ctx.fillStyle = 'rgba(157,163,173,0.94)';
    ctx.font = '600 18px Inter, Arial, sans-serif';
    ctx.fillText(stat.label, x + cardW / 2, cardY + 82);
    ctx.textAlign = 'left';
  });

  glassRect(ctx, 52, h - 345, w - 104, 96, 34, 'rgba(245,245,245,0.88)', true);
  ctx.fillStyle = '#07080b';
  ctx.font = '800 25px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Explore edits', w / 2, h - 286);
  ctx.textAlign = 'left';
}

function drawEdits(ctx, w, h, pulse) {
  drawLabel(ctx, 'SELECTED EDITS', 52, 190);
  drawChromeText(ctx, 'Edits', 52, 278, 66);

  const startY = 330;
  const cardH = 118;
  const gap = 16;
  portfolio.projects.forEach((project, index) => {
    const y = startY + index * (cardH + gap);
    if (y > h - 170) return;
    glassRect(ctx, 52, y, w - 104, cardH, 28);
    drawThumb(ctx, 76, y + 22, 92, 74, project.tone, pulse + index * 0.42);
    ctx.fillStyle = '#f2f1eb';
    ctx.font = '800 25px Inter, Arial, sans-serif';
    ctx.fillText(project.title, 188, y + 49);
    ctx.fillStyle = 'rgba(157,163,173,0.96)';
    ctx.font = '600 18px Inter, Arial, sans-serif';
    ctx.fillText(project.meta, 188, y + 82);
  });
}

function drawSkills(ctx, w, h, progress) {
  drawLabel(ctx, 'CREATIVE TOOLKIT', 52, 190);
  drawChromeText(ctx, 'Skills', 52, 278, 66);

  const startY = 338;
  portfolio.skills.forEach((skill, index) => {
    const y = startY + index * 94;
    if (y > h - 180) return;
    glassRect(ctx, 52, y, w - 104, 70, 22);
    ctx.fillStyle = '#dedfe1';
    ctx.font = '800 20px Inter, Arial, sans-serif';
    ctx.fillText(skill.name, 78, y + 29);

    const barX = 78;
    const barY = y + 46;
    const barW = w - 156;
    roundedRect(ctx, barX, barY, barW, 8, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    ctx.fill();

    const ratio = (skill.value / 100) * progress;
    roundedRect(ctx, barX, barY, barW * ratio, 8, 8);
    const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    grad.addColorStop(0, '#737982');
    grad.addColorStop(0.52, '#f2f3f4');
    grad.addColorStop(1, '#9ba1aa');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(255,255,255,0.18)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function drawContact(ctx, w, h) {
  drawLabel(ctx, 'BOOKING', 52, 190);
  drawChromeText(ctx, 'Contact', 52, 278, 64);
  drawParagraph(ctx, portfolio.description, 54, 342, w - 108, 32, 'rgba(205,210,216,0.88)', 24);

  const startY = 492;
  portfolio.contact.forEach((item, index) => {
    const y = startY + index * 112;
    glassRect(ctx, 52, y, w - 104, 88, 26);
    ctx.fillStyle = '#f2f1eb';
    ctx.font = '800 24px Inter, Arial, sans-serif';
    ctx.fillText(item.label, 78, y + 36);
    ctx.fillStyle = 'rgba(157,163,173,0.96)';
    ctx.font = '600 19px Inter, Arial, sans-serif';
    ctx.fillText(item.value, 78, y + 64);
  });

  glassRect(ctx, 52, h - 345, w - 104, 96, 34, 'rgba(245,245,245,0.88)', true);
  ctx.fillStyle = '#07080b';
  ctx.font = '800 25px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Work with me', w / 2, h - 286);
  ctx.textAlign = 'left';
}

function drawNav(ctx, w, h, active) {
  const navX = 38;
  const navY = h - 136;
  const navW = w - 76;
  const navH = 86;
  glassRect(ctx, navX, navY, navW, navH, 43, 'rgba(255,255,255,0.07)');

  const itemW = navW / SECTION_ORDER.length;
  SECTION_ORDER.forEach((section, index) => {
    const x = navX + index * itemW;
    if (section === active) {
      const grad = ctx.createLinearGradient(x + 9, navY + 13, x + itemW - 18, navY + navH - 14);
      grad.addColorStop(0, '#f4f2ec');
      grad.addColorStop(1, '#a7adb5');
      roundedRect(ctx, x + 8, navY + 10, itemW - 16, navH - 20, 34);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.fillStyle = '#07080b';
    } else {
      ctx.fillStyle = 'rgba(210,214,220,0.72)';
    }
    ctx.font = '800 17px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(section[0].toUpperCase() + section.slice(1), x + itemW / 2, navY + 52);
  });
  ctx.textAlign = 'left';
}

function drawThumb(ctx, x, y, w, h, tone, pulse) {
  roundedRect(ctx, x, y, w, h, 18);
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#252a32');
  grad.addColorStop(0.5, '#0a0b0e');
  grad.addColorStop(1, '#3a3f48');
  ctx.fillStyle = grad;
  ctx.fill();

  const shimmer = (Math.sin(pulse * 1.8) + 1) * 0.5;
  ctx.globalAlpha = 0.28 + shimmer * 0.16;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + w * (0.15 + shimmer * 0.35), y);
  ctx.lineTo(x + w * (0.35 + shimmer * 0.35), y);
  ctx.lineTo(x + w * (0.05 + shimmer * 0.35), y + h);
  ctx.lineTo(x - w * 0.12 + shimmer * w * 0.35, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  roundedRect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 18);
  ctx.stroke();
}

function drawLabel(ctx, text, x, y) {
  ctx.fillStyle = 'rgba(156,162,172,0.9)';
  ctx.font = '800 18px Inter, Arial, sans-serif';
  ctx.fillText(text, x, y);
}

function drawChromeText(ctx, text, x, y, size) {
  const grad = ctx.createLinearGradient(x, y - size, x + size * 4.2, y);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.34, '#aeb4bd');
  grad.addColorStop(0.52, '#f4f2ed');
  grad.addColorStop(1, '#7b828d');
  ctx.fillStyle = grad;
  ctx.font = `900 ${size}px Inter, Arial, sans-serif`;
  ctx.fillText(text, x, y);
}

function drawParagraph(ctx, text, x, y, maxWidth, lineHeight, color, size) {
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px Inter, Arial, sans-serif`;
  const words = text.split(' ');
  let line = '';
  let cursorY = y;

  words.forEach((word, index) => {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && index > 0) {
      ctx.fillText(line, x, cursorY);
      line = `${word} `;
      cursorY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, cursorY);
}

function glassRect(ctx, x, y, w, h, r, overrideFill, chrome = false) {
  roundedRect(ctx, x, y, w, h, r);
  if (chrome) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#f7f5ef');
    grad.addColorStop(0.55, '#a7adb5');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = overrideFill || 'rgba(255,255,255,0.075)';
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawGrid(ctx, w, h, step) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function createIsland(THREE, depth) {
  const islandGeometry = new THREE.ShapeGeometry(capsuleShape(0.94, 0.22));
  const islandMaterial = new THREE.MeshBasicMaterial({ color: 0x010101, toneMapped: false });
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  island.position.set(0, 2.69, depth * 0.5 + 0.04);
  island.scale.set(1, 1, 1);
  return island;
}

function createButtons(THREE, group, material, phoneWidth, phoneDepth) {
  const buttonMaterial = material.clone();
  buttonMaterial.color.setHex(0xd4d7db);

  const specs = [
    { x: -phoneWidth / 2 - 0.045, y: 1.58, z: 0.02, sx: 0.045, sy: 0.62, sz: 0.12 },
    { x: -phoneWidth / 2 - 0.045, y: 0.78, z: 0.02, sx: 0.045, sy: 0.48, sz: 0.12 },
    { x: phoneWidth / 2 + 0.045, y: 1.15, z: 0.02, sx: 0.045, sy: 0.82, sz: 0.12 },
  ];

  specs.forEach((spec) => {
    const geometry = new THREE.BoxGeometry(spec.sx, spec.sy, spec.sz);
    const mesh = new THREE.Mesh(geometry, buttonMaterial);
    mesh.position.set(spec.x, spec.y, phoneDepth * 0.06 + spec.z);
    group.add(mesh);
  });
}

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new window.__THREE_SHAPE__();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function capsuleShape(width, height) {
  const radius = height / 2;
  const x = -width / 2;
  const y = -height / 2;
  const shape = new window.__THREE_SHAPE__();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

export function bindThreeShape(THREE) {
  window.__THREE_SHAPE__ = THREE.Shape;
}