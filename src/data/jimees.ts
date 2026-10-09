import type { JimeeModel } from './types';

export const JIMEES: JimeeModel[] = [
  {
    id: 'standard', name: 'Standard', rarity: 'common', cost: 2, ranged: false,
    profile: { hp: 60, damage: 10, speed: 40, range: 20, attackInterval: 1 },
    belt: '#ff8a1f', accessory: 'none',
    description: 'Le modèle de base. Fonce et tape.',
  },
  {
    id: 'lanceur', name: 'Archer', rarity: 'common', cost: 3, ranged: true,
    profile: { hp: 54, damage: 21, speed: 36, range: 140, attackInterval: 1.4 },
    belt: '#3fa7d6', accessory: 'bow',
    description: 'Tire des flèches à distance avec son arc compact.',
  },
  {
    id: 'stagiaire', name: 'Stagiaire', rarity: 'common', cost: 1, ranged: false,
    profile: { hp: 18, damage: 3, speed: 46, range: 18, attackInterval: 1 },
    belt: '#c9cede', accessory: 'badge',
    description: 'Presque gratuit, presque inutile. Parfait pour gagner du temps.',
  },
  {
    id: 'bouclier', name: 'Bouclier', rarity: 'common', cost: 3, ranged: false,
    profile: { hp: 180, damage: 10.5, speed: 28, range: 20, attackInterval: 1.4 },
    belt: '#5d6b7a', accessory: 'shield',
    description: 'Lent et peu dangereux, mais il encaisse pour les autres.',
  },
  {
    id: 'costaud', name: 'Costaud', rarity: 'rare', cost: 4, ranged: false,
    profile: { hp: 147, damage: 16.6, speed: 26, range: 22, attackInterval: 1.2 },
    belt: '#7d5ba6', accessory: 'helmet',
    description: 'Lent, mais encaisse énormément.',
  },
  {
    id: 'sprinteur', name: 'Sprinteur', rarity: 'rare', cost: 3, ranged: false,
    profile: { hp: 50, damage: 16, speed: 80, range: 18, attackInterval: 0.7 },
    belt: '#2bb673', accessory: 'sneakers',
    description: 'Très rapide, très fragile.',
  },
  {
    id: 'grenadier', name: 'Grenadier', rarity: 'rare', cost: 4, ranged: true,
    profile: { hp: 66, damage: 30, speed: 34, range: 130, attackInterval: 1.8 },
    belt: '#8bc34a', accessory: 'satchel',
    description: 'Lance des boulons qui éclatent sur une petite zone.',
    ability: { kind: 'splash', radius: 40 },
  },
  {
    id: 'mecano', name: 'Mécano', rarity: 'rare', cost: 4, ranged: false,
    profile: { hp: 74, damage: 13, speed: 34, range: 20, attackInterval: 1.2 },
    belt: '#ff7043', accessory: 'wrench',
    description: 'Répare régulièrement la fusée, où qu’il soit sur le terrain.',
    ability: { kind: 'repairRocket', amountFactor: 0.6, interval: 3 },
  },
  {
    id: 'kamikaze', name: 'Kamikaze', rarity: 'epic', cost: 5, ranged: false,
    profile: { hp: 72, damage: 32, speed: 50, range: 18, attackInterval: 1 },
    belt: '#e4572e', accessory: 'dynamite',
    description: 'Fonce avec son sac de dynamite et explose à sa mort.',
    ability: { kind: 'explodeOnDeath', radius: 70, damageFactor: 4 },
  },
  {
    id: 'infirmier', name: 'Infirmier', rarity: 'epic', cost: 5, ranged: true,
    profile: { hp: 83, damage: 19, speed: 34, range: 110, attackInterval: 1.5 },
    belt: '#f2f2f2', accessory: 'cross',
    description: 'Soigne régulièrement les Jimees proches.',
    ability: { kind: 'heal', radius: 90, amountFactor: 0.3, interval: 2 },
  },
  {
    id: 'ralentisseur', name: 'Ralentisseur', rarity: 'epic', cost: 5, ranged: true,
    profile: { hp: 60, damage: 32, speed: 32, range: 140, attackInterval: 1.6 },
    belt: '#00bcd4', accessory: 'hourglass',
    description: 'Ses tirs ralentissent les ennemis touchés.',
    ability: { kind: 'slow', factor: 0.4, duration: 2.5 },
  },
  {
    id: 'blinde', name: 'Blindé', rarity: 'legendary', cost: 14, ranged: false,
    profile: { hp: 420, damage: 43, speed: 30, range: 22, attackInterval: 1.1 },
    belt: '#8c96a6', accessory: 'plate',
    description: 'Arrive avec un bouclier qui absorbe les coups.',
    ability: { kind: 'shield', amountFactor: 0.5 },
  },
  {
    id: 'prototype', name: 'Prototype « Nouveau ! »', rarity: 'legendary', cost: 16, ranged: true,
    profile: { hp: 288, damage: 144, speed: 32, range: 170, attackInterval: 2 },
    belt: '#ffcc00', accessory: 'antenna',
    description: 'Cher, mais ses tirs ravagent toute une zone.',
    ability: { kind: 'splash', radius: 60 },
  },
  {
    id: 'contremaitre', name: 'Contremaître', rarity: 'legendary', cost: 14, ranged: false,
    profile: { hp: 315, damage: 63, speed: 30, range: 22, attackInterval: 1.2 },
    belt: '#d4a017', accessory: 'megaphone',
    description: 'Hurle des consignes : lui et les Jimees autour de lui frappent plus fort.',
    ability: { kind: 'aura', radius: 90, damageBonus: 0.4 },
  },
];

const BY_ID = new Map(JIMEES.map((j) => [j.id, j]));

export function jimeeById(id: string): JimeeModel {
  const model = BY_ID.get(id);
  if (!model) throw new Error(`Modèle de Jimee inconnu : ${id}`);
  return model;
}
