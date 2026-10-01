'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Grid, ActivePiece, Position } from '@/types/game';
import { TETROMINOES } from '@/core/tetrominoes';
import { GRID_COLS, GRID_ROWS } from '@/core/engine';

interface TetrisCanvas3DProps {
  grid: Grid;
  activePiece: ActivePiece | null;
  ghostPos: Position | null;
  clearedLines: number[];
  isPaused: boolean;
}

export const TetrisCanvas3D: React.FC<TetrisCanvas3DProps> = ({
  grid,
  activePiece,
  ghostPos,
  clearedLines,
  isPaused,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const blocksGroupRef = useRef<THREE.Group | null>(null);
  const activeGroupRef = useRef<THREE.Group | null>(null);
  const ghostGroupRef = useRef<THREE.Group | null>(null);
  const particlesGroupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);

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
    scene.background = new THREE.Color(0x070c14); // Deep night sky
    scene.fog = new THREE.FogExp2(0x070c14, 0.025);
    sceneRef.current = scene;

    // Camera: centered at grid center (X: 0, Y: 0)
    // Board will be placed from x: -5 to +5, y: -10 to +10
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
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

    // Lighting (Warm Moroccan ambient + directional key light + emerald rim light)
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(8, 15, 18);
    scene.add(dirLight);

    const emeraldRimLight = new THREE.PointLight(0x00a859, 1.5, 30);
    emeraldRimLight.position.set(-8, -6, 10);
    scene.add(emeraldRimLight);

    const royalGoldLight = new THREE.PointLight(0xd4af37, 1.2, 25);
    royalGoldLight.position.set(8, 10, 8);
    scene.add(royalGoldLight);

    // Shared geometry for blocks
    const blockSize = 0.94; // slight gap between blocks
    const boxGeo = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
    boxGeoRef.current = boxGeo;

    // Ghost material (translucent neon outline)
    ghostMatRef.current = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // Create Board Background & Frame (Moroccan arch architectural contour)
    const frameGroup = new THREE.Group();

    // Backing plane
    const backPlaneGeo = new THREE.PlaneGeometry(GRID_COLS, GRID_ROWS);
    const backPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x09111c,
      roughness: 0.9,
      metalness: 0.1,
    });
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
      color: 0x1e2d42,
      transparent: true,
      opacity: 0.5,
    });
    const gridLines = new THREE.LineSegments(gridLinesGeo, gridLinesMat);
    frameGroup.add(gridLines);

    // Frame Borders (Gold and Moroccan Red accents)
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.6,
      roughness: 0.3,
    });
    const sideBorderGeo = new THREE.BoxGeometry(0.3, GRID_ROWS + 0.6, 0.8);
    const topBorderGeo = new THREE.BoxGeometry(GRID_COLS + 0.6, 0.3, 0.8);

    // Left border
    const leftBorder = new THREE.Mesh(sideBorderGeo, borderMat);
    leftBorder.position.set(-halfW - 0.15, 0, 0);
    frameGroup.add(leftBorder);

    // Right border
    const rightBorder = new THREE.Mesh(sideBorderGeo, borderMat);
    rightBorder.position.set(halfW + 0.15, 0, 0);
    frameGroup.add(rightBorder);

    // Bottom border
    const bottomBorder = new THREE.Mesh(topBorderGeo, borderMat);
    bottomBorder.position.set(0, -halfH - 0.15, 0);
    frameGroup.add(bottomBorder);

    // Top border
    const topBorder = new THREE.Mesh(topBorderGeo, borderMat);
    topBorder.position.set(0, halfH + 0.15, 0);
    frameGroup.add(topBorder);

    scene.add(frameGroup);

    // Groups for dynamic game elements
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

    // Handle Window / Container Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;

      // Adapt distance for mobile portrait so whole board is always visible
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

    // Render loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      // Subtle gentle rotation of active piece highlight
      if (activeGroupRef.current) {
        activeGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            // subtle breathing pulse
            const s = 1.0 + Math.sin(Date.now() * 0.005) * 0.02;
            child.scale.set(s, s, s);
          }
        });
      }

      // Animate line clear particle debris
      if (particlesGroupRef.current) {
        particlesGroupRef.current.children.forEach((p) => {
          const velocity = p.userData.velocity as THREE.Vector3;
          if (velocity) {
            p.position.add(velocity);
            velocity.y -= 0.015; // gravity
            p.rotation.x += 0.05;
            p.rotation.y += 0.05;
            const mat = (p as THREE.Mesh).material as THREE.Material;
            if (mat && 'opacity' in mat) {
              (mat as THREE.MeshBasicMaterial).opacity -= 0.02;
            }
          }
        });

        // Cleanup dead particles
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

  // Coordinate helper: converts Grid (col, row) to Three.js (x, y, z)
  // Grid col (0..9) -> Three.js x: -4.5 to +4.5
  // Grid row (0..19) -> Three.js y: +9.5 (top) to -9.5 (bottom)
  const gridToThreePos = (col: number, row: number): [number, number, number] => {
    const x = col - (GRID_COLS - 1) / 2;
    const y = (GRID_ROWS - 1) / 2 - row;
    return [x, y, 0];
  };

  // Update Settled Blocks
  useEffect(() => {
    const group = blocksGroupRef.current;
    const boxGeo = boxGeoRef.current;
    if (!group || !boxGeo) return;

    // Clear previous blocks
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

    // Material cache per color
    const materialCache = new Map<string, THREE.MeshStandardMaterial>();

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = grid[r][c];
        if (cell.filled && cell.color) {
          let mat = materialCache.get(cell.color);
          if (!mat) {
            mat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(cell.color),
              roughness: 0.25,
              metalness: 0.2,
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
  }, [grid]);

  // Update Active Piece & Ghost Piece
  useEffect(() => {
    const activeGroup = activeGroupRef.current;
    const ghostGroup = ghostGroupRef.current;
    const boxGeo = boxGeoRef.current;
    const ghostMat = ghostMatRef.current;

    if (!activeGroup || !ghostGroup || !boxGeo || !ghostMat) return;

    // Clear active piece meshes
    while (activeGroup.children.length > 0) {
      const m = activeGroup.children.pop();
      if (m instanceof THREE.Mesh && m.material) m.material.dispose();
    }

    // Clear ghost piece meshes
    while (ghostGroup.children.length > 0) {
      ghostGroup.children.pop();
    }

    if (!activePiece) return;

    const def = TETROMINOES[activePiece.type];
    const shape = def.shapes[activePiece.rotation];

    // Active piece material with subtle emissive shimmer
    const activeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color),
      emissive: new THREE.Color(def.highlightColor),
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.25,
    });

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const blockCol = activePiece.x + c;
          const blockRow = activePiece.y + r;

          if (blockRow >= 0 && blockRow < GRID_ROWS && blockCol >= 0 && blockCol < GRID_COLS) {
            const mesh = new THREE.Mesh(boxGeo, activeMat);
            const [x, y, z] = gridToThreePos(blockCol, blockRow);
            mesh.position.set(x, y, z + 0.05); // slight elevation forward
            activeGroup.add(mesh);
          }

          // Ghost piece blocks
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
  }, [activePiece, ghostPos]);

  // Particle explosion on line clears
  useEffect(() => {
    if (!clearedLines || clearedLines.length === 0) return;
    const particlesGroup = particlesGroupRef.current;
    if (!particlesGroup) return;

    const miniGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const colors = [0xc1272d, 0x006233, 0xd4af37, 0xffffff];

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
  }, [clearedLines]);

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full min-h-[460px] md:min-h-[580px] flex items-center justify-center overflow-hidden rounded-xl bg-morocco-night shadow-2xl border border-morocco-gold/30"
    >
      {/* Subtle Moroccan background emblem */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
        <svg viewBox="0 0 100 100" className="w-80 h-80 fill-current text-morocco-green">
          {/* Moroccan 5-pointed Cherifian Star */}
          <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" />
        </svg>
      </div>

      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-morocco-gold text-2xl font-bold tracking-widest uppercase border-2 border-morocco-gold px-6 py-2 rounded-lg bg-morocco-night/90 shadow-xl">
            PAUSE
          </div>
        </div>
      )}
    </div>
  );
};
