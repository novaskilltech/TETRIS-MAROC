export type ThemeId = 'maroc' | 'galaxy' | 'beach';

export interface BlockStyleConfig {
  roughness: number;
  metalness: number;
  bumpScale: number;
  emissiveIntensity: number;
  ghostOpacity: number;
}

export interface ThemeConfig {
  id: ThemeId;
  nameKey: string;
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  ambientLight: {
    color: number;
    intensity: number;
  };
  dirLight: {
    color: number;
    intensity: number;
    position: [number, number, number];
  };
  pointLight1: {
    color: number;
    intensity: number;
    position: [number, number, number];
  };
  pointLight2: {
    color: number;
    intensity: number;
    position: [number, number, number];
  };
  boardBackingColor: number;
  boardBorderColor: number;
  gridLinesColor: number;
  particleColors: number[];
  blockStyle: BlockStyleConfig;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  maroc: {
    id: 'maroc',
    nameKey: 'themeMaroc',
    skyColor: 0x05070d,
    fogColor: 0x05070d,
    fogDensity: 0.025,
    ambientLight: { color: 0xfff5e6, intensity: 0.8 },
    dirLight: { color: 0xffffff, intensity: 1.3, position: [8, 15, 18] },
    pointLight1: { color: 0x86efac, intensity: 1.2, position: [-8, -6, 10] }, // soft mint
    pointLight2: { color: 0xfde047, intensity: 1.2, position: [8, 10, 8] }, // soft pastel gold
    boardBackingColor: 0x03050a, // Pitch black well for high pastel contrast
    boardBorderColor: 0xd4af37,
    gridLinesColor: 0x182433,
    particleColors: [0xfca5a5, 0x86efac, 0xfde047, 0xffffff],
    blockStyle: {
      roughness: 0.22,
      metalness: 0.12,
      bumpScale: 0.05,
      emissiveIntensity: 0.22,
      ghostOpacity: 0.35,
    },
  },
  galaxy: {
    id: 'galaxy',
    nameKey: 'themeGalaxy',
    skyColor: 0x010206,
    fogColor: 0x010206,
    fogDensity: 0.018,
    ambientLight: { color: 0x818cf8, intensity: 0.7 },
    dirLight: { color: 0xdbeafe, intensity: 1.3, position: [10, 14, 15] },
    pointLight1: { color: 0xd8b4fe, intensity: 1.5, position: [-9, 8, 8] }, // pastel lilac
    pointLight2: { color: 0x67e8f9, intensity: 1.5, position: [9, -6, 10] }, // pastel cyan
    boardBackingColor: 0x020308, // Pure cosmic black well
    boardBorderColor: 0x93c5fd,
    gridLinesColor: 0x162035,
    particleColors: [0x67e8f9, 0xd8b4fe, 0xfca5a5, 0xffffff],
    blockStyle: {
      roughness: 0.14,
      metalness: 0.42,
      bumpScale: 0.08,
      emissiveIntensity: 0.36,
      ghostOpacity: 0.45,
    },
  },
  beach: {
    id: 'beach',
    nameKey: 'themeBeach',
    skyColor: 0x38bdf8,
    fogColor: 0x7dd3fc,
    fogDensity: 0.012,
    ambientLight: { color: 0xffedd5, intensity: 0.9 },
    dirLight: { color: 0xfffbeb, intensity: 1.6, position: [12, 18, 14] }, // bright tropical sun
    pointLight1: { color: 0x0284c7, intensity: 1.4, position: [-8, -8, 8] }, // ocean blue
    pointLight2: { color: 0xf59e0b, intensity: 1.3, position: [8, 8, 9] }, // warm amber sand
    boardBackingColor: 0x082f49,
    boardBorderColor: 0xf59e0b,
    gridLinesColor: 0x0e7490,
    particleColors: [0x0284c7, 0xf59e0b, 0x10b981, 0xffffff],
    blockStyle: {
      roughness: 0.32,
      metalness: 0.06,
      bumpScale: 0.06,
      emissiveIntensity: 0.18,
      ghostOpacity: 0.3,
    },
  },
};
