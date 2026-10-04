import * as THREE from 'three';
import { ThemeId } from '@/types/theme';

/**
 * Creates procedural 256x256 textures for Tetris blocks tailored to each theme.
 * Runs purely on CPU canvas during initialization with zero network download.
 */

// Cache of generated textures to avoid recreating canvas objects
const textureCache = new Map<ThemeId, THREE.CanvasTexture>();

/**
 * Maroc Theme: Carved Moorish Zellige tile with 8-pointed star & beveled ceramic rim.
 */
function generateZellijTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Neutral mid-tone base for bump mapping
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Outer beveled frame border (raised rim)
  ctx.strokeStyle = '#d4d4d4';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);

  // Inner recessed groove
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, 220, 220);

  // 8-Pointed Star (Moroccan Khatam) in the center
  const cx = 128;
  const cy = 128;
  const outerR = 64;
  const innerR = 32;

  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // Raised star tile center
  ctx.fillStyle = '#b0b0b0';
  ctx.fill();
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Fine geometric zellige radiating lines
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * 105, cy + Math.sin(angle) * 105);
    ctx.stroke();
  }

  // Central jewel cabochon
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 3;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Galaxy Theme: Cosmic stardust crystals, celestial cleavage facets & micro-stars.
 */
function generateGalaxyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark crystalline base
  ctx.fillStyle = '#606060';
  ctx.fillRect(0, 0, 256, 256);

  // Sharp crystalline angular bevel border
  ctx.strokeStyle = '#c8c8ff';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 246, 246);

  // Geometric facets / crystal cleavage lines
  ctx.strokeStyle = '#9090aa';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(256, 256);
  ctx.moveTo(256, 0);
  ctx.lineTo(0, 256);
  ctx.moveTo(128, 0);
  ctx.lineTo(256, 128);
  ctx.lineTo(128, 256);
  ctx.lineTo(0, 128);
  ctx.closePath();
  ctx.stroke();

  // Micro stardust specks
  const stars = [
    { x: 64, y: 55, r: 4 },
    { x: 190, y: 70, r: 3 },
    { x: 80, y: 180, r: 3.5 },
    { x: 185, y: 195, r: 4.5 },
    { x: 128, y: 128, r: 6 },
    { x: 128, y: 64, r: 2.5 },
    { x: 128, y: 192, r: 2.5 },
    { x: 64, y: 128, r: 2.5 },
    { x: 192, y: 128, r: 2.5 },
  ];

  stars.forEach((s) => {
    // Cross star flare
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x - s.r * 2.5, s.y);
    ctx.lineTo(s.x + s.r * 2.5, s.y);
    ctx.moveTo(s.x, s.y - s.r * 2.5);
    ctx.lineTo(s.x, s.y + s.r * 2.5);
    ctx.stroke();

    // Central bright dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Beach Theme: Ocean tide ripples, sea-glass frosted contours & mother-of-pearl sheen.
 */
function generateBeachTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Smooth pebble base
  ctx.fillStyle = '#7a7a7a';
  ctx.fillRect(0, 0, 256, 256);

  // Soft rounded border
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);

  // Concentric oceanic tide wave ripple lines
  ctx.strokeStyle = '#bfbfbf';
  ctx.lineWidth = 5;

  for (let r = 35; r <= 110; r += 25) {
    ctx.beginPath();
    // Gentle sine displacement for wave ripple effect
    for (let a = 0; a <= Math.PI * 2; a += 0.1) {
      const radius = r + Math.sin(a * 4) * 6;
      const x = 128 + Math.cos(a) * radius;
      const y = 128 + Math.sin(a) * radius;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Secondary soft wave crest
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 128, 115, 0, Math.PI * 2);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Get or create procedural block bump/surface texture for the active theme.
 */
export function getThemeBlockTexture(themeId: ThemeId): THREE.CanvasTexture {
  if (typeof window === 'undefined') {
    // Return empty texture on SSR
    return new THREE.CanvasTexture(document.createElement('canvas'));
  }

  const cached = textureCache.get(themeId);
  if (cached) return cached;

  let created: THREE.CanvasTexture;
  switch (themeId) {
    case 'galaxy':
      created = generateGalaxyTexture();
      break;
    case 'beach':
      created = generateBeachTexture();
      break;
    case 'maroc':
    default:
      created = generateZellijTexture();
      break;
  }

  textureCache.set(themeId, created);
  return created;
}
