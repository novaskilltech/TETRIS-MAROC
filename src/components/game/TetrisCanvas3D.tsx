'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Grid, ActivePiece, Position } from '@/types/game';
import { ThemeId, THEMES } from '@/types/theme';
import { TETROMINOES } from '@/core/tetrominoes';
import { GRID_COLS, GRID_ROWS } from '@/core/engine';
import { getThemeBlockTexture } from '@/core/themeTextures';

interface TetrisCanvas3DProps {
  grid: Grid;
  activePiece: ActivePiece | null;
  ghostPos: Position | null;
  clearedLines: number[];
  isPaused: boolean;
  themeId: ThemeId;
}

// Procedural texture generator for realistic moon
function createProceduralMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base lunar regolith tone (light gray)
  ctx.fillStyle = '#b8bec7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lunar Maria (Dark basaltic volcanic plains)
  const mariaBlobs = [
    { x: 340, y: 190, r: 120 }, // Mare Tranquillitatis
    { x: 440, y: 220, r: 90 },  // Mare Fecunditatis
    { x: 260, y: 160, r: 140 }, // Mare Imbrium
    { x: 180, y: 220, r: 100 }, // Oceanus Procellarum
    { x: 310, y: 320, r: 85 },  // Mare Nubium
  ];

  mariaBlobs.forEach((m) => {
    const grad = ctx.createRadialGradient(m.x, m.y, m.r * 0.1, m.x, m.y, m.r);
    grad.addColorStop(0, 'rgba(68, 76, 89, 0.85)');
    grad.addColorStop(0.7, 'rgba(92, 101, 116, 0.6)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Random realistic craters with shadowed interior and illuminated white rim
  for (let i = 0; i < 240; i++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const cr = Math.random() * 16 + 2;

    // Dark crater basin
    ctx.fillStyle = 'rgba(40, 45, 52, 0.4)';
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();

    // Bright illuminated rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = Math.max(1, cr * 0.2);
    ctx.beginPath();
    ctx.arc(cx - cr * 0.15, cy - cr * 0.15, cr, Math.PI * 0.7, Math.PI * 1.8);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural palm tree 3D model generator
function createPalmTreeGroup(scale = 1.0, leanAngle = 0.15): THREE.Group {
  const palmGroup = new THREE.Group();

  // Segmented curved trunk
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x6d4c41,
    roughness: 0.9,
    metalness: 0.1,
  });

  const segments = 6;
  const segHeight = 1.2 * scale;
  let currY = 0;
  let currX = 0;

  for (let i = 0; i < segments; i++) {
    const radiusTop = (0.35 - i * 0.03) * scale;
    const radiusBottom = (0.42 - i * 0.03) * scale;
    const segGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, segHeight, 7);
    const segMesh = new THREE.Mesh(segGeo, trunkMat);

    segMesh.position.set(currX, currY + segHeight / 2, 0);
    segMesh.rotation.z = leanAngle * (i + 1) * 0.25;
    palmGroup.add(segMesh);

    currY += segHeight * 0.95;
    currX += Math.sin(segMesh.rotation.z) * segHeight * 0.6;
  }

  // Coconuts cluster
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 });
  const coconutGeo = new THREE.SphereGeometry(0.22 * scale, 6, 6);
  for (let c = 0; c < 4; c++) {
    const angle = (c * Math.PI) / 2;
    const coco = new THREE.Mesh(coconutGeo, coconutMat);
    coco.position.set(currX + Math.cos(angle) * 0.3 * scale, currY - 0.15 * scale, Math.sin(angle) * 0.3 * scale);
    palmGroup.add(coco);
  }

  // Radiating palm fronds / leaves
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.4,
    side: THREE.DoubleSide,
  });

  const frondsCount = 9;
  for (let f = 0; f < frondsCount; f++) {
    const frondAngle = (f / frondsCount) * Math.PI * 2;
    const leafGeo = new THREE.ConeGeometry(0.55 * scale, 3.2 * scale, 5);
    const leafMesh = new THREE.Mesh(leafGeo, leafMat);

    leafMesh.position.set(currX, currY + 0.1 * scale, 0);
    leafMesh.rotation.y = frondAngle;
    leafMesh.rotation.x = Math.PI * 0.42; // drooping curve downwards
    leafMesh.rotation.z = Math.PI * 0.15;
    palmGroup.add(leafMesh);
  }

  return palmGroup;
}

export const TetrisCanvas3D: React.FC<TetrisCanvas3DProps> = ({
  grid,
  activePiece,
  ghostPos,
  clearedLines,
  isPaused,
  themeId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic Scene Elements
  const blocksGroupRef = useRef<THREE.Group | null>(null);
  const activeGroupRef = useRef<THREE.Group | null>(null);
  const ghostGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);

  // Environment Groups
  const marocEnvGroupRef = useRef<THREE.Group | null>(null);
  const galaxyEnvGroupRef = useRef<THREE.Group | null>(null);
  const beachEnvGroupRef = useRef<THREE.Group | null>(null);

  // Animated elements references
  const oceanMeshRef = useRef<THREE.Mesh | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const starPointsRef = useRef<THREE.Points | null>(null);

  // Lights & Board materials for dynamic theme switching
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLight1Ref = useRef<THREE.PointLight | null>(null);
  const pointLight2Ref = useRef<THREE.PointLight | null>(null);
  const activePieceLightRef = useRef<THREE.PointLight | null>(null);
  const backPlaneMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const borderMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const gridLinesMatRef = useRef<THREE.LineBasicMaterial | null>(null);

  // Reusable geometries & materials cache
  const boxGeoRef = useRef<THREE.BoxGeometry | null>(null);
  const ghostMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(THEMES[themeId].skyColor);
    scene.fog = new THREE.FogExp2(THEMES[themeId].fogColor, THEMES[themeId].fogDensity);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 120);
    camera.position.set(0, 0, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Dynamic Lights
    const cfg = THEMES[themeId];
    const ambientLight = new THREE.AmbientLight(cfg.ambientLight.color, cfg.ambientLight.intensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(cfg.dirLight.color, cfg.dirLight.intensity);
    dirLight.position.set(...cfg.dirLight.position);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const pointLight1 = new THREE.PointLight(cfg.pointLight1.color, cfg.pointLight1.intensity, 35);
    pointLight1.position.set(...cfg.pointLight1.position);
    scene.add(pointLight1);
    pointLight1Ref.current = pointLight1;

    const pointLight2 = new THREE.PointLight(cfg.pointLight2.color, cfg.pointLight2.intensity, 30);
    pointLight2.position.set(...cfg.pointLight2.position);
    scene.add(pointLight2);
    pointLight2Ref.current = pointLight2;

    // Dynamic light tracking the active falling piece
    const activePieceLight = new THREE.PointLight(0xffffff, 0, 14);
    activePieceLight.position.set(0, 0, 1.8);
    scene.add(activePieceLight);
    activePieceLightRef.current = activePieceLight;

    // Shared geometry for blocks
    const blockSize = 0.94;
    const boxGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    boxGeoRef.current = boxGeo;

    // Ghost material
    ghostMatRef.current = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // --- BOARD FRAME & BACKING ---
    const frameGroup = new THREE.Group();

    // Backing plane
    const backPlaneGeo = new THREE.PlaneGeometry(GRID_COLS, GRID_ROWS);
    const backPlaneMat = new THREE.MeshStandardMaterial({
      color: cfg.boardBackingColor,
      roughness: 0.85,
      metalness: 0.15,
      transparent: true,
      opacity: 0.96,
    });
    backPlaneMatRef.current = backPlaneMat;
    const backPlane = new THREE.Mesh(backPlaneGeo, backPlaneMat);
    backPlane.position.set(0, 0, -0.52);
    frameGroup.add(backPlane);

    // Grid wirelines
    const gridLinesGeo = new THREE.BufferGeometry();
    const lineVertices: number[] = [];
    const halfW = GRID_COLS / 2;
    const halfH = GRID_ROWS / 2;

    for (let c = 0; c <= GRID_COLS; c++) {
      const x = -halfW + c;
      lineVertices.push(x, -halfH, -0.5, x, halfH, -0.5);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = -halfH + r;
      lineVertices.push(-halfW, y, -0.5, halfW, y, -0.5);
    }
    gridLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    const gridLinesMat = new THREE.LineBasicMaterial({
      color: cfg.gridLinesColor,
      transparent: true,
      opacity: 0.55,
    });
    gridLinesMatRef.current = gridLinesMat;
    const gridLines = new THREE.LineSegments(gridLinesGeo, gridLinesMat);
    frameGroup.add(gridLines);

    // Frame Borders
    const borderMat = new THREE.MeshStandardMaterial({
      color: cfg.boardBorderColor,
      metalness: 0.6,
      roughness: 0.3,
    });
    borderMatRef.current = borderMat;

    const sideBorderGeo = new THREE.BoxGeometry(0.3, GRID_ROWS + 0.6, 0.8);
    const topBorderGeo = new THREE.BoxGeometry(GRID_COLS + 0.6, 0.3, 0.8);

    const leftBorder = new THREE.Mesh(sideBorderGeo, borderMat);
    leftBorder.position.set(-halfW - 0.15, 0, 0);
    frameGroup.add(leftBorder);

    const rightBorder = new THREE.Mesh(sideBorderGeo, borderMat);
    rightBorder.position.set(halfW + 0.15, 0, 0);
    frameGroup.add(rightBorder);

    const bottomBorder = new THREE.Mesh(topBorderGeo, borderMat);
    bottomBorder.position.set(0, -halfH - 0.15, 0);
    frameGroup.add(bottomBorder);

    const topBorder = new THREE.Mesh(topBorderGeo, borderMat);
    topBorder.position.set(0, halfH + 0.15, 0);
    frameGroup.add(topBorder);

    // 4 Moroccan Ornate Golden Corner Brackets (Cornières impériales ciselées)
    const cornerMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.85,
      roughness: 0.22,
    });
    const cornerHGeo = new THREE.BoxGeometry(1.2, 0.34, 0.95);
    const cornerVGeo = new THREE.BoxGeometry(0.34, 1.2, 0.95);
    const studGeo = new THREE.ConeGeometry(0.18, 0.22, 4); // 4-sided diamond pyramid stud

    const corners = [
      { x: -halfW - 0.15, y: -halfH - 0.15, signX: 1, signY: 1 },
      { x: halfW + 0.15, y: -halfH - 0.15, signX: -1, signY: 1 },
      { x: -halfW - 0.15, y: halfH + 0.15, signX: 1, signY: -1 },
      { x: halfW + 0.15, y: halfH + 0.15, signX: -1, signY: -1 },
    ];

    corners.forEach((c) => {
      const hMesh = new THREE.Mesh(cornerHGeo, cornerMat);
      hMesh.position.set(c.x + c.signX * 0.45, c.y, 0.05);
      frameGroup.add(hMesh);

      const vMesh = new THREE.Mesh(cornerVGeo, cornerMat);
      vMesh.position.set(c.x, c.y + c.signY * 0.45, 0.05);
      frameGroup.add(vMesh);

      const stud = new THREE.Mesh(studGeo, cornerMat);
      stud.rotation.z = Math.PI / 4;
      stud.position.set(c.x, c.y, 0.52);
      frameGroup.add(stud);
    });

    scene.add(frameGroup);

    // ==============================================================
    // 1. THEME MAROC: Watermark Emblem & Architectural Lighting
    // ==============================================================
    const marocEnvGroup = new THREE.Group();
    scene.add(marocEnvGroup);
    marocEnvGroupRef.current = marocEnvGroup;

    // ==============================================================
    // 2. THEME GALAXY: Realistic 3D Moon & Starfield & Cosmic Nebula
    // ==============================================================
    const galaxyEnvGroup = new THREE.Group();
    scene.add(galaxyEnvGroup);
    galaxyEnvGroupRef.current = galaxyEnvGroup;

    // Realistic Starfield (1,500 3D Points)
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 2] = -12 - Math.random() * 45;

      // Realistic cosmic star colors: crisp blue-white, warm amber, violet
      const r = 0.7 + Math.random() * 0.3;
      const g = 0.8 + Math.random() * 0.2;
      const b = 0.95 + Math.random() * 0.05;
      starColors[i * 3] = r;
      starColors[i * 3 + 1] = g;
      starColors[i * 3 + 2] = b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.55,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    galaxyEnvGroup.add(starPoints);
    starPointsRef.current = starPoints;

    // Realistic 3D Moon Sphere with Procedural Crater Map
    const moonGeo = new THREE.SphereGeometry(3.4, 36, 36);
    const moonTex = createProceduralMoonTexture();
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonTex,
      bumpMap: moonTex,
      bumpScale: 0.18,
      roughness: 0.88,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(7.5, 7.8, -12); // upper-right sky
    galaxyEnvGroup.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Soft Lunar glow sprite / billboard
    const glowGeo = new THREE.PlaneGeometry(10, 10);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d')!;
    const ggrad = gctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    ggrad.addColorStop(0, 'rgba(190, 220, 255, 0.45)');
    ggrad.addColorStop(0.5, 'rgba(120, 160, 255, 0.15)');
    ggrad.addColorStop(1, 'transparent');
    gctx.fillStyle = ggrad;
    gctx.fillRect(0, 0, 128, 128);

    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(7.5, 7.8, -12.1);
    galaxyEnvGroup.add(glowMesh);

    // ==============================================================
    // 3. THEME BEACH: Realistic Animated Ocean, Dunes & Palm Trees
    // ==============================================================
    const beachEnvGroup = new THREE.Group();
    scene.add(beachEnvGroup);
    beachEnvGroupRef.current = beachEnvGroup;

    // Animated Ocean Plane
    const oceanGeo = new THREE.PlaneGeometry(55, 30, 48, 28);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Tropical turquoise ocean
      roughness: 0.15,
      metalness: 0.35,
      flatShading: true,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.set(0, -9.5, -4);
    oceanMesh.rotation.x = -Math.PI * 0.44;
    beachEnvGroup.add(oceanMesh);
    oceanMeshRef.current = oceanMesh;

    // Golden Beach Sand Dune
    const sandGeo = new THREE.PlaneGeometry(50, 14, 16, 8);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Warm Sahara / Atlantic beach sand
      roughness: 0.95,
      metalness: 0.05,
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.position.set(0, -11.5, -1);
    sandMesh.rotation.x = -Math.PI * 0.48;
    beachEnvGroup.add(sandMesh);

    // Left Cocotier / Palm Tree
    const leftPalm = createPalmTreeGroup(1.15, 0.22);
    leftPalm.position.set(-8.8, -10.5, -1.8);
    beachEnvGroup.add(leftPalm);

    // Right Cocotier / Palm Tree
    const rightPalm = createPalmTreeGroup(1.05, -0.2);
    rightPalm.position.set(8.8, -10.8, -1.5);
    beachEnvGroup.add(rightPalm);

    // Groups for dynamic game pieces
    const blocksGroup = new THREE.Group();
    scene.add(blocksGroup);
    blocksGroupRef.current = blocksGroup;

    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);
    ghostGroupRef.current = ghostGroup;

    const activeGroup = new THREE.Group();
    scene.add(activeGroup);
    activeGroupRef.current = activeGroup;

    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;

      if (camera.aspect < 0.6) {
        camera.position.z = 29; // phone portrait
      } else if (camera.aspect < 1.0) {
        camera.position.z = 26; // tablet
      } else {
        camera.position.z = 24; // desktop
      }

      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Store original wave coordinates
    const wavePosAttr = oceanGeo.attributes.position;
    const waveCount = wavePosAttr.count;
    const originalZ = new Float32Array(waveCount);
    for (let i = 0; i < waveCount; i++) {
      originalZ[i] = wavePosAttr.getZ(i);
    }

    // Render loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const time = performance.now() * 0.0015;

      // 1. Animate Ocean Waves (Beach Theme)
      if (oceanMeshRef.current && beachEnvGroup.visible) {
        const pos = oceanGeo.attributes.position;
        for (let i = 0; i < waveCount; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          const z =
            originalZ[i] +
            Math.sin(time * 2.2 + u * 0.45) * 0.35 +
            Math.cos(time * 1.8 + v * 0.35) * 0.25;
          pos.setZ(i, z);
        }
        pos.needsUpdate = true;
      }

      // 2. Animate Moon Rotation & Twinkle (Galaxy Theme)
      if (moonMeshRef.current && galaxyEnvGroup.visible) {
        moonMeshRef.current.rotation.y = time * 0.04;
      }
      if (starPointsRef.current && galaxyEnvGroup.visible) {
        starPointsRef.current.rotation.y = time * 0.008;
      }

      // 3. Active piece breathing pulse
      if (activeGroupRef.current) {
        activeGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const s = 1.0 + Math.sin(time * 4) * 0.02;
            child.scale.set(s, s, s);
          }
        });
      }

      // 4. Line clear particles
      if (particlesGroupRef.current) {
        particlesGroupRef.current.children.forEach((p) => {
          const velocity = p.userData.velocity as THREE.Vector3;
          if (velocity) {
            p.position.add(velocity);
            velocity.y -= 0.015;
            p.rotation.x += 0.05;
            p.rotation.y += 0.05;
            const mat = (p as THREE.Mesh).material as THREE.Material;
            if (mat && 'opacity' in mat) {
              (mat as THREE.MeshBasicMaterial).opacity -= 0.02;
            }
          }
        });

        particlesGroupRef.current.children = particlesGroupRef.current.children.filter((p) => {
          const mat = (p as THREE.Mesh).material as THREE.Material;
          return mat && 'opacity' in mat && (mat as THREE.MeshBasicMaterial).opacity > 0.05;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Theme Elements when themeId changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cfg = THEMES[themeId];

    // Background & Fog
    scene.background = new THREE.Color(cfg.skyColor);
    scene.fog = new THREE.FogExp2(cfg.fogColor, cfg.fogDensity);

    // Lights
    if (ambientLightRef.current) {
      ambientLightRef.current.color.setHex(cfg.ambientLight.color);
      ambientLightRef.current.intensity = cfg.ambientLight.intensity;
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.setHex(cfg.dirLight.color);
      dirLightRef.current.intensity = cfg.dirLight.intensity;
      dirLightRef.current.position.set(...cfg.dirLight.position);
    }
    if (pointLight1Ref.current) {
      pointLight1Ref.current.color.setHex(cfg.pointLight1.color);
      pointLight1Ref.current.intensity = cfg.pointLight1.intensity;
      pointLight1Ref.current.position.set(...cfg.pointLight1.position);
    }
    if (pointLight2Ref.current) {
      pointLight2Ref.current.color.setHex(cfg.pointLight2.color);
      pointLight2Ref.current.intensity = cfg.pointLight2.intensity;
      pointLight2Ref.current.position.set(...cfg.pointLight2.position);
    }

    // Board Frame & Backing colors
    if (backPlaneMatRef.current) {
      backPlaneMatRef.current.color.setHex(cfg.boardBackingColor);
    }
    if (borderMatRef.current) {
      borderMatRef.current.color.setHex(cfg.boardBorderColor);
    }
    if (gridLinesMatRef.current) {
      gridLinesMatRef.current.color.setHex(cfg.gridLinesColor);
    }
    if (ghostMatRef.current) {
      ghostMatRef.current.opacity = cfg.blockStyle.ghostOpacity;
    }

    // Visibility toggles for environmental groups
    if (marocEnvGroupRef.current) {
      marocEnvGroupRef.current.visible = themeId === 'maroc';
    }
    if (galaxyEnvGroupRef.current) {
      galaxyEnvGroupRef.current.visible = themeId === 'galaxy';
    }
    if (beachEnvGroupRef.current) {
      beachEnvGroupRef.current.visible = themeId === 'beach';
    }
  }, [themeId]);

  // Coordinate helper: Grid col (0..9) -> Three.js x, Grid row (0..19) -> Three.js y
  const gridToThreePos = (col: number, row: number): [number, number, number] => {
    const x = col - (GRID_COLS - 1) / 2;
    const y = (GRID_ROWS - 1) / 2 - row;
    return [x, y, 0];
  };

  // Update Settled Blocks with Themed Procedural Textures
  useEffect(() => {
    const group = blocksGroupRef.current;
    const boxGeo = boxGeoRef.current;
    if (!group || !boxGeo) return;

    while (group.children.length > 0) {
      const obj = group.children.pop();
      if (obj instanceof THREE.Mesh) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    const cfg = THEMES[themeId];
    const themeTexture = getThemeBlockTexture(themeId);
    const materialCache = new Map<string, THREE.MeshStandardMaterial>();

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = grid[r][c];
        if (cell.filled && cell.color) {
          let mat = materialCache.get(cell.color);
          if (!mat) {
            mat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(cell.color),
              emissive: new THREE.Color(cell.color),
              emissiveIntensity: cfg.blockStyle.emissiveIntensity,
              roughness: cfg.blockStyle.roughness,
              metalness: cfg.blockStyle.metalness,
              bumpMap: themeTexture,
              bumpScale: cfg.blockStyle.bumpScale,
            });
            materialCache.set(cell.color, mat);
          }

          const mesh = new THREE.Mesh(boxGeo, mat);
          const [x, y, z] = gridToThreePos(c, r);
          mesh.position.set(x, y, z);
          group.add(mesh);
        }
      }
    }
  }, [grid, themeId]);

  // Update Active Piece & Ghost Piece with Themed Procedural Textures
  useEffect(() => {
    const activeGroup = activeGroupRef.current;
    const ghostGroup = ghostGroupRef.current;
    const boxGeo = boxGeoRef.current;
    const ghostMat = ghostMatRef.current;

    if (!activeGroup || !ghostGroup || !boxGeo || !ghostMat) return;

    while (activeGroup.children.length > 0) {
      const m = activeGroup.children.pop();
      if (m instanceof THREE.Mesh && m.material) m.material.dispose();
    }
    while (ghostGroup.children.length > 0) {
      ghostGroup.children.pop();
    }

    if (!activePiece) return;

    const def = TETROMINOES[activePiece.type];
    const shape = def.shapes[activePiece.rotation];
    const cfg = THEMES[themeId];
    const themeTexture = getThemeBlockTexture(themeId);

    const activeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color),
      emissive: new THREE.Color(def.color),
      emissiveIntensity: cfg.blockStyle.emissiveIntensity * 1.35,
      roughness: cfg.blockStyle.roughness,
      metalness: cfg.blockStyle.metalness,
      bumpMap: themeTexture,
      bumpScale: cfg.blockStyle.bumpScale * 1.25,
    });

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const blockCol = activePiece.x + c;
          const blockRow = activePiece.y + r;

          if (blockRow >= 0 && blockRow < GRID_ROWS && blockCol >= 0 && blockCol < GRID_COLS) {
            const mesh = new THREE.Mesh(boxGeo, activeMat);
            const [x, y, z] = gridToThreePos(blockCol, blockRow);
            mesh.position.set(x, y, z + 0.05);
            activeGroup.add(mesh);
          }

          if (ghostPos) {
            const ghostRow = ghostPos.y + r;
            if (ghostRow >= 0 && ghostRow < GRID_ROWS && blockCol >= 0 && blockCol < GRID_COLS) {
              const ghostMesh = new THREE.Mesh(boxGeo, ghostMat);
              const [gx, gy, gz] = gridToThreePos(blockCol, ghostRow);
              ghostMesh.position.set(gx, gy, gz);
              ghostGroup.add(ghostMesh);
            }
          }
        }
      }
    }

    // Dynamic soft light tracking the active piece
    const pLight = activePieceLightRef.current;
    if (pLight) {
      if (activePiece) {
        const [lx, ly] = gridToThreePos(activePiece.x + 1, activePiece.y + 1);
        pLight.position.set(lx, ly, 1.8);
        pLight.color.set(new THREE.Color(def.color));
        pLight.intensity = 1.4;
        pLight.visible = true;
      } else {
        pLight.visible = false;
      }
    }
  }, [activePiece, ghostPos, themeId]);

  // Particle explosion on line clears
  useEffect(() => {
    if (!clearedLines || clearedLines.length === 0) return;
    const particlesGroup = particlesGroupRef.current;
    if (!particlesGroup) return;

    const miniGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const colors = THEMES[themeId].particleColors;

    clearedLines.forEach((rowIdx) => {
      for (let c = 0; c < GRID_COLS; c += 2) {
        for (let i = 0; i < 4; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 1.0,
          });
          const p = new THREE.Mesh(miniGeo, mat);
          const [x, y] = gridToThreePos(c, rowIdx);
          p.position.set(
            x + (Math.random() - 0.5) * 0.8,
            y + (Math.random() - 0.5) * 0.8,
            (Math.random() - 0.5) * 1.5
          );

          p.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            Math.random() * 0.2 + 0.05,
            (Math.random() - 0.5) * 0.15
          );

          particlesGroup.add(p);
        }
      }
    });
  }, [clearedLines, themeId]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[460px] md:min-h-[580px] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border transition-colors duration-500"
      style={{
        borderColor:
          themeId === 'maroc'
            ? 'rgba(212, 175, 55, 0.4)'
            : themeId === 'galaxy'
            ? 'rgba(96, 165, 250, 0.4)'
            : 'rgba(245, 158, 11, 0.4)',
      }}
    >
      {/* Moroccan emblem for Maroc theme */}
      {themeId === 'maroc' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
          <svg viewBox="0 0 100 100" className="w-80 h-80 fill-current text-morocco-green">
            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" />
          </svg>
        </div>
      )}

      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-white text-2xl font-bold tracking-widest uppercase border-2 border-white/60 px-6 py-2 rounded-lg bg-black/80 shadow-xl">
            PAUSE
          </div>
        </div>
      )}
    </div>
  );
};
