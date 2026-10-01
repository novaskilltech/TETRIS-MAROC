export type ThemeId = 'maroc' | 'galaxy' | 'beach';

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
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  maroc: {
    id: 'maroc',
    nameKey: 'themeMaroc',
    skyColor: 0x070c14,
    fogColor: 0x070c14,
    fogDensity: 0.025,
    ambientLight: { color: 0xfff5e6, intensity: 0.7 },
    dirLight: { color: 0xffffff, intensity: 1.2, position: [8, 15, 18] },
    pointLight1: { color: 0x00a859, intensity: 1.5, position: [-8, -6, 10] }, // emerald
    pointLight2: { color: 0xd4af37, intensity: 1.2, position: [8, 10, 8] }, // gold
    boardBackingColor: 0x09111c,
    boardBorderColor: 0xd4af37,
    gridLinesColor: 0x1e2d42,
    particleColors: [0xc1272d, 0x006233, 0xd4af37, 0xffffff],
  },
  galaxy: {
    id: 'galaxy',
    nameKey: 'themeGalaxy',
    skyColor: 0x02040a,
    fogColor: 0x02040a,
    fogDensity: 0.018,
    ambientLight: { color: 0x818cf8, intensity: 0.6 },
    dirLight: { color: 0xdbeafe, intensity: 1.3, position: [10, 14, 15] },
    pointLight1: { color: 0xa855f7, intensity: 1.8, position: [-9, 8, 8] }, // purple nebula
    pointLight2: { color: 0x38bdf8, intensity: 1.6, position: [9, -6, 10] }, // cyan starlight
    boardBackingColor: 0x050814,
    boardBorderColor: 0x60a5fa,
    gridLinesColor: 0x1e293b,
    particleColors: [0x38bdf8, 0xa855f7, 0xf43f5e, 0xffffff],
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
  },
};
