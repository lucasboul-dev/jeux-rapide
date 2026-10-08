import type { EnemyDef } from './types';

export const ENEMIES: Record<string, EnemyDef> = {
  blob: {
    id: 'blob', name: 'Blob', ranged: false, reward: 3, look: 'blob',
    stats: { hp: 45, damage: 7, speed: 55, range: 18, attackInterval: 0.9 },
  },
  cracheur: {
    id: 'cracheur', name: 'Cracheur', ranged: true, reward: 4, look: 'spitter',
    stats: { hp: 35, damage: 8, speed: 35, range: 130, attackInterval: 1.5 },
  },
  carapace: {
    id: 'carapace', name: 'Carapace', ranged: false, reward: 6, look: 'shell',
    stats: { hp: 140, damage: 9, speed: 22, range: 22, attackInterval: 1.3 },
  },
  employe: {
    id: 'employe', name: "Employé de Jimmy's Inc.", ranged: false, reward: 8, look: 'employee',
    stats: { hp: 80, damage: 12, speed: 40, range: 20, attackInterval: 1 },
  },
  boss_regional: {
    id: 'boss_regional', name: "Responsable régional de Jimmy's Inc.", ranged: false, reward: 60, look: 'boss',
    stats: { hp: 900, damage: 30, speed: 18, range: 30, attackInterval: 1.6 },
  },
  boss_directeur: {
    id: 'boss_directeur', name: "Directeur général de Jimmy's Inc.", ranged: false, reward: 120, look: 'boss',
    stats: { hp: 1600, damage: 45, speed: 18, range: 32, attackInterval: 1.6 },
  },
};
