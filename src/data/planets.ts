import type { Planet } from './types';

const BASIC = ['blob', 'cracheur', 'carapace'];

export const PLANETS: Planet[] = [
  {
    id: 1, name: 'Poussière-Prime', biome: 'désert',
    palette: { sky: '#f6d8a8', ground: '#d9a45b', accent: '#b5763a', creature: '#8bc34a' },
    baseHp: 400, enemyPool: ['blob'], waveInterval: 7, waveSize: 2, statMultiplier: 1,
  },
  {
    id: 2, name: 'Glaçonia', biome: 'glace',
    palette: { sky: '#cfe8f7', ground: '#eaf4fb', accent: '#8fbfdc', creature: '#5c6bc0' },
    baseHp: 500, enemyPool: ['blob', 'cracheur'], waveInterval: 7, waveSize: 2, statMultiplier: 1.1,
  },
  {
    id: 3, name: 'Fougeria', biome: 'jungle',
    palette: { sky: '#bfe3b4', ground: '#4f8a3b', accent: '#2f5d24', creature: '#e91e63' },
    baseHp: 600, enemyPool: ['blob', 'cracheur'], waveInterval: 6.5, waveSize: 3, statMultiplier: 1.2,
  },
  {
    id: 4, name: 'Braisière', biome: 'volcan',
    palette: { sky: '#f3b49f', ground: '#5a3a33', accent: '#e4572e', creature: '#ffb300' },
    baseHp: 700, enemyPool: BASIC, waveInterval: 6.5, waveSize: 3, statMultiplier: 1.35,
  },
  {
    id: 5, name: 'Bureaucratis', biome: "comptoir de Jimmy's Inc.",
    palette: { sky: '#d7d3e8', ground: '#8a8698', accent: '#4b4760', creature: '#26a69a' },
    baseHp: 1100, enemyPool: [...BASIC, 'employe'], waveInterval: 6, waveSize: 3, statMultiplier: 1.7,
    bossId: 'boss_regional',
  },
  {
    id: 6, name: 'Vasière', biome: 'marais',
    palette: { sky: '#c9d6b0', ground: '#5d6b3a', accent: '#3c4626', creature: '#ab47bc' },
    baseHp: 900, enemyPool: BASIC, waveInterval: 6, waveSize: 3, statMultiplier: 1.6,
  },
  {
    id: 7, name: 'Cristallia', biome: 'cristaux',
    palette: { sky: '#e3d4f7', ground: '#9b7fd1', accent: '#6a4fb0', creature: '#00acc1' },
    baseHp: 1000, enemyPool: BASIC, waveInterval: 5.5, waveSize: 3, statMultiplier: 1.8,
  },
  {
    id: 8, name: 'Décharge-Majeure', biome: 'décharge',
    palette: { sky: '#d6cbb8', ground: '#7a6e5d', accent: '#4e463b', creature: '#cddc39' },
    baseHp: 1100, enemyPool: BASIC, waveInterval: 5.5, waveSize: 3, statMultiplier: 1.85,
  },
  {
    id: 9, name: 'Nébuleuse', biome: 'nuages',
    palette: { sky: '#f0e1f0', ground: '#c7b5d6', accent: '#8e7aa8', creature: '#ff7043' },
    baseHp: 1200, enemyPool: BASIC, waveInterval: 5.5, waveSize: 3, statMultiplier: 1.95,
  },
  {
    id: 10, name: "Tour Jimmy's", biome: "siège de Jimmy's Inc.",
    palette: { sky: '#cfd8dc', ground: '#546e7a', accent: '#263238', creature: '#26a69a' },
    baseHp: 1800, enemyPool: [...BASIC, 'employe'], waveInterval: 5, waveSize: 4, statMultiplier: 2.8,
    bossId: 'boss_directeur',
  },
];

export function planetById(id: number): Planet {
  const planet = PLANETS.find((p) => p.id === id);
  if (!planet) throw new Error(`Planète inconnue : ${id}`);
  return planet;
}
