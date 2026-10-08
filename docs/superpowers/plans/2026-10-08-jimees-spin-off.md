# Jimees — spin-off : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** construire la première version jouable du spin-off Jimees : une PWA mobile en portrait (bataille sur une ligne, carte de 10 planètes, distributeur de capsules avec fusion, améliorations de la fusée), publiée sur GitHub Pages.

**Architecture :** TypeScript sans moteur de jeu. Le contenu est dans `src/data/`, les règles sont des fonctions pures (`src/economy/`, `src/battle/sim*`) testées avec Vitest, le dessin de la bataille est un Canvas 2D (`src/battle/render.ts`, `src/art/`) et les écrans sont en HTML/CSS (`src/screens/`). La sauvegarde est un objet JSON versionné dans le `localStorage`.

**Tech Stack :** TypeScript 5, Vite 6, Vitest 3 (environnement `jsdom` pour les tests DOM), `vite-plugin-pwa`, `@vite-pwa/assets-generator`, GitHub Actions + GitHub Pages, Node 22.

**Spec :** `docs/superpowers/specs/2026-10-08-jimees-spin-off-design.md` — à lire en même temps que ce plan. Toute valeur chiffrée vient de la spec ; en cas de doute, la spec fait foi.

## Global Constraints

- Langue de l'interface et des textes : français. Identifiants de code en anglais.
- Aucune publicité, aucun achat en argent réel, aucune minuterie d'attente ni énergie.
- Graphismes 100 % originaux, dessinés en code (formes vectorielles Canvas/SVG). Aucun asset, nom, texte ou son de We Are Warriors.
- Apparence d'un Jimee : tête ovale un peu penchée, grands yeux noirs, corps rectangle blanc, pieds ovales, ceinture de couleur propre au modèle.
- Orientation portrait ; manifeste PWA avec `"orientation": "portrait"` et `"display": "standalone"`.
- Chemin de base Vite : `/jeux-rapide/`. Adresse publique : `https://lucasboul-dev.github.io/jeux-rapide/`.
- Les textes d'humour de la Corp ne remplacent jamais un chiffre : prix, probabilités et gains restent affichés.
- Toute lecture/écriture du `localStorage` est protégée par `try/catch`.
- Chaque commit se termine par :
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_019dTRZ4mnKCs8ckmM74JdWe
  ```

## Review Focus

1. **Solde insuffisant** (crédits ou cristaux) au distributeur ou à la fusée : le bouton est désactivé, l'achat renvoie `null`, le solde ne devient jamais négatif. → tests dans les tâches 4 et 5.
2. **Équipe vide** (aucun modèle placé) : impossible de lancer la bataille. → test dans la tâche 11.
3. **Appli mise en arrière-plan pendant une bataille** (énorme écart de temps au retour) : la simulation n'avance pas d'un coup ; la bataille se met en pause quand la page est cachée. → test dans la tâche 7 (`advanceBattle` plafonne), câblage tâche 10.
4. **Taps répétés** sur un bouton de Jimee avec juste assez de chargement : un seul Jimee part, la jauge ne passe jamais sous 0. → test dans la tâche 7.
5. **Amélioration de la fusée au niveau 10** : affichée « MAX », sans coût, `buyUpgrade` renvoie `null`. → test dans la tâche 5.

---

## Structure des fichiers

```
index.html                     page unique, conteneur #app
vite.config.ts                 base /jeux-rapide/, PWA, Vitest
pwa-assets.config.ts           génération des icônes PNG depuis public/icon.svg
tsconfig.json
package.json
.github/workflows/deploy.yml   tests + build + publication Pages
public/icon.svg                icône originale (un Jimee)
src/main.ts                    démarrage : charge la sauvegarde, lance l'app
src/data/types.ts              tous les types de contenu
src/data/economy.ts            constantes chiffrées de la spec
src/data/jimees.ts             8 modèles
src/data/enemies.ts            créatures, employé Jimmy's Inc., 2 boss
src/data/planets.ts            10 planètes
src/data/corpLines.ts          répliques de la Corp
src/economy/rng.ts             hasard reproductible
src/economy/power.ts           courbe rareté/niveau, statistiques d'unité
src/economy/capsules.ts        probabilités, tirage, fusion, achat
src/economy/progress.ts        gains de bataille, cristaux, conquête
src/economy/rocket.ts          coûts et effets des améliorations
src/save/save.ts               sauvegarde versionnée
src/battle/types.ts            état de bataille
src/battle/sim.ts              simulation (déplacements, combats, vagues, fin)
src/battle/abilities.ts        capacités, tourelle, canon
src/battle/camera.ts           caméra (suivi + glisser)
src/battle/render.ts           dessin Canvas
src/battle/battleScreen.ts     écran de bataille : boucle, barre de commande, pause
src/art/jimee.ts               dessin d'un Jimee
src/art/enemies.ts             dessin des créatures, employés, boss
src/art/scenery.ts             fusée, base ennemie, décor de planète
src/art/representative.ts      le représentant de la Corp (SVG pour les écrans)
src/screens/app.ts             contexte et navigation entre écrans
src/screens/counter.ts         guichet
src/screens/map.ts             carte
src/screens/prepare.ts         préparation de l'équipe
src/screens/results.ts         bilan
src/screens/capsules.ts        distributeur
src/screens/rocket.ts          fusée
src/screens/style.css
tests/…                        un fichier de test par module, même arborescence
```

---

### Task 1 : Socle du projet, PWA et publication

**Files :**
- Create : `package.json`, `tsconfig.json`, `vite.config.ts`, `pwa-assets.config.ts`, `index.html`, `public/icon.svg`, `src/main.ts`, `.github/workflows/deploy.yml`, `.gitignore`, `tests/smoke.test.ts`

**Interfaces :**
- Produces : scripts npm `dev`, `build`, `test` (`vitest run`), `preview` ; élément `#app` dans `index.html`.

- [ ] **Step 1 : Initialiser le projet** — `npm create vite@latest . -- --template vanilla-ts` puis `npm i -D vitest jsdom vite-plugin-pwa @vite-pwa/assets-generator`. `.gitignore` : `node_modules`, `dist`.
- [ ] **Step 2 : Écrire le test fumée**

```ts
// tests/smoke.test.ts
import { describe, it, expect } from 'vitest';
describe('socle', () => {
  it('lance Vitest', () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 3 : Configurer `vite.config.ts`** : `base: '/jeux-rapide/'` ; `VitePWA({ registerType: 'autoUpdate', manifest: { name: "Jimees — la Corp", short_name: 'Jimees', lang: 'fr', display: 'standalone', orientation: 'portrait', background_color: '#1d2340', theme_color: '#1d2340', start_url: '/jeux-rapide/', scope: '/jeux-rapide/' }, pwaAssets: { config: true } })` ; `test: { environment: 'jsdom' }`. `pwa-assets.config.ts` : preset `minimal2023Preset`, image `public/icon.svg`.
- [ ] **Step 4 : Dessiner `public/icon.svg`** : un Jimee original (voir Global Constraints) sur fond `#1d2340`, ceinture orange.
- [ ] **Step 5 : `index.html` et `src/main.ts`** : viewport `width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no`, `<div id="app">`, `main.ts` affiche provisoirement « Jimees ».
- [ ] **Step 6 : Vérifier** — Run : `npm test && npm run build`. Expected : 1 test PASS, `dist/` contient `manifest.webmanifest`, `sw.js` et des icônes PNG 192 et 512.
- [ ] **Step 7 : Workflow `deploy.yml`** : déclenché sur `push` vers `main` et `workflow_dispatch` ; permissions `contents: read, pages: write, id-token: write` ; job `build` (checkout, setup-node 22 avec cache npm, `npm ci`, `npm test`, `npm run build`, `actions/upload-pages-artifact` sur `dist`) ; job `deploy` (`needs: build`, `actions/deploy-pages`). Si les tests échouent, rien n'est publié.
- [ ] **Step 8 : Commit** — `git add -A && git commit -m "chore: socle Vite, PWA et publication GitHub Pages"`

---

### Task 2 : Types et contenu du jeu

**Files :**
- Create : `src/data/types.ts`, `src/data/economy.ts`, `src/data/jimees.ts`, `src/data/enemies.ts`, `src/data/planets.ts`, `src/data/corpLines.ts`
- Test : `tests/data/content.test.ts`

**Interfaces :**
- Produces :

```ts
// src/data/types.ts
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Ability =
  | { kind: 'explodeOnDeath'; radius: number; damageFactor: number }   // dégâts = damageFactor × dégâts de l'unité
  | { kind: 'heal'; radius: number; amountFactor: number; interval: number } // soin = amountFactor × vie max du soigneur
  | { kind: 'shield'; amountFactor: number }                            // bouclier = amountFactor × vie max
  | { kind: 'splash'; radius: number };                                 // tir à dégâts de zone
export interface StatProfile { hp: number; damage: number; speed: number; range: number; attackInterval: number }
export interface JimeeModel {
  id: string; name: string; rarity: Rarity; cost: number;   // cost en points de chargement
  ranged: boolean; profile: StatProfile;                     // profile = valeurs pour une puissance de 100
  belt: string; accessory: 'none' | 'bolt' | 'helmet' | 'sneakers' | 'fuse' | 'cross' | 'plate' | 'antenna';
  ability?: Ability;
}
export interface EnemyDef {
  id: string; name: string; ranged: boolean; stats: StatProfile; reward: number;
  look: 'blob' | 'spitter' | 'shell' | 'employee' | 'boss';
}
export interface Planet {
  id: number; name: string;
  palette: { sky: string; ground: string; accent: string; creature: string };
  baseHp: number; enemyPool: string[]; waveInterval: number; waveSize: number;
  statMultiplier: number; bossId?: string;
}
export type UpgradeKey = 'chargeRate' | 'chargeMax' | 'turret' | 'cannon';
export interface CorpLines {
  counter: string[]; victory: string[]; defeat: string[];
  newModel: string[]; buyback: string[]; mourningPosterTitles: string[];
}
```

```ts
// src/data/economy.ts — valeurs de la spec
export const ECONOMY = {
  drawCost: 100, buybackCredits: 25, maxLevel: 10, maxCrystalsPerDraw: 3,
  baseOdds: { common: 60, rare: 28, epic: 10, legendary: 2 },
  crystalShift: { common: -12, rare: 6, epic: 4, legendary: 2 },
  planetBonusPerPlanet: 50, replayFactor: 0.4, crystalDropChance: 0.1,
  upgradeBaseCost: 80, upgradeGrowth: 1.5, maxUpgradeLevel: 10, teamSlots: 4,
  rarityCurve: {
    common: { base: 100, gain: 0.10 }, rare: { base: 125, gain: 0.15 },
    epic: { base: 150, gain: 0.22 }, legendary: { base: 180, gain: 0.35 },
  },
  rocket: {
    hp: 600, chargeMax: 10, chargeRate: 1, chargeRatePerLevel: 0.15, chargeMaxPerLevel: 2,
    turretDamage: 12, turretRange: 160, turretInterval: 1, turretPerLevel: 0.15,
    cannonDamage: 80, cannonRadius: 70, cannonCooldown: 30, cannonDamagePerLevel: 0.15, cannonCooldownPerLevel: 1.5,
  },
  startingCollection: { standard: 1, lanceur: 1 } as Record<string, number>,
} as const;
```

- Exports de contenu : `JIMEES: JimeeModel[]`, `ENEMIES: Record<string, EnemyDef>`, `PLANETS: Planet[]`, `CORP_LINES: CorpLines`, et `jimeeById(id: string): JimeeModel` (lève une erreur si inconnu).

- [ ] **Step 1 : Écrire les tests d'intégrité**

```ts
// tests/data/content.test.ts
import { JIMEES, ENEMIES, PLANETS, CORP_LINES } from '../../src/data/…';
it('8 modèles, 2 par rareté, ids uniques', () => {
  expect(JIMEES).toHaveLength(8);
  for (const r of ['common','rare','epic','legendary']) expect(JIMEES.filter(j => j.rarity === r)).toHaveLength(2);
  expect(new Set(JIMEES.map(j => j.id)).size).toBe(8);
});
it('les modèles de départ sont standard et lanceur, communs', () => {
  expect(['standard','lanceur'].map(id => jimeeById(id).rarity)).toEqual(['common','common']);
});
it('les capacités sont celles de la spec', () => {
  expect(jimeeById('kamikaze').ability?.kind).toBe('explodeOnDeath');
  expect(jimeeById('infirmier').ability?.kind).toBe('heal');
  expect(jimeeById('blinde').ability?.kind).toBe('shield');
  expect(jimeeById('prototype').ability?.kind).toBe('splash');
});
it('10 planètes numérotées 1 à 10, boss sur 5 et 10 uniquement', () => {
  expect(PLANETS.map(p => p.id)).toEqual([1,2,3,4,5,6,7,8,9,10]);
  expect(PLANETS.filter(p => p.bossId).map(p => p.id)).toEqual([5, 10]);
});
it('Jimmy\'s Inc. seulement sur les planètes boss', () => {
  for (const p of PLANETS) expect(p.enemyPool.includes('employe')).toBe(p.id === 5 || p.id === 10);
});
it('chaque ennemi référencé existe', () => {
  for (const p of PLANETS) for (const id of [...p.enemyPool, ...(p.bossId ? [p.bossId] : [])]) expect(ENEMIES[id]).toBeDefined();
});
it('au moins 5 répliques par situation', () => {
  for (const list of Object.values(CORP_LINES)) expect(list.length).toBeGreaterThanOrEqual(5);
});
```

- [ ] **Step 2 : Lancer** — Run : `npx vitest run tests/data` — Expected : FAIL (modules absents).
- [ ] **Step 3 : Écrire le contenu.**
  - Ids des modèles : `standard`, `lanceur` (communs), `costaud`, `sprinteur` (rares), `kamikaze`, `infirmier` (épiques), `blinde`, `prototype` (légendaires). Rôles de la spec section 6 ; `lanceur`, `infirmier`, `prototype` ont `ranged: true`. Coûts en chargement croissants avec la rareté (de 2 à 8). Chaque `profile` répartit l'équivalent d'une puissance 100 selon le rôle (Costaud : vie haute ; Sprinteur : vitesse haute, vie basse).
  - Ennemis : `blob`, `cracheur` (ranged), `carapace`, `employe` (« Employé de Jimmy's Inc. », casquette), `boss_regional` (planète 5), `boss_directeur` (planète 10).
  - Planètes : thèmes variés (désert, glace, jungle, volcan…), `statMultiplier` et `baseHp` croissants ; planètes 5 et 10 nettement plus dures (murs).
  - Répliques : textes originaux en français, ton vendeur cynique et poli ; jamais de chiffre dans la réplique elle-même (les chiffres sont affichés à part).
- [ ] **Step 4 : Lancer** — Run : `npx vitest run tests/data` — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: types et contenu du jeu"`

---

### Task 3 : Hasard reproductible et courbe de puissance

**Files :**
- Create : `src/economy/rng.ts`, `src/economy/power.ts`
- Test : `tests/economy/rng.test.ts`, `tests/economy/power.test.ts`

**Interfaces :**
- Consumes : `ECONOMY`, `JimeeModel`, `Rarity`, `StatProfile` (tâche 2).
- Produces :
  - `type Rng = () => number` (valeur dans [0, 1[)
  - `createRng(seed: number): Rng` — mulberry32
  - `randomSeed(): number`
  - `pick<T>(rng: Rng, items: readonly T[]): T`
  - `modelPower(rarity: Rarity, level: number): number` = `base × (1 + gain × (level − 1))`
  - `unitStats(model: JimeeModel, level: number): StatProfile` — `hp` et `damage` multipliés par `modelPower/100` ; `speed`, `range`, `attackInterval` inchangés.

- [ ] **Step 1 : Écrire les tests**

```ts
it('même graine, même suite', () => {
  const a = createRng(42), b = createRng(42);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});
it('valeurs dans [0,1[', () => { const r = createRng(1); for (let i = 0; i < 1000; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); } });
it.each([
  ['common', 1, 100], ['common', 2, 110], ['common', 10, 190],
  ['rare', 1, 125], ['rare', 2, 144], ['rare', 10, 294],
  ['epic', 1, 150], ['epic', 2, 183], ['epic', 10, 447],
  ['legendary', 1, 180], ['legendary', 2, 243], ['legendary', 10, 747],
])('puissance %s niveau %i = %i', (r, lvl, p) => expect(Math.round(modelPower(r as Rarity, lvl))).toBe(p));
it('commun 10 > légendaire 1, légendaire 2 > commun 10', () => {
  expect(modelPower('common', 10)).toBeGreaterThan(modelPower('legendary', 1));
  expect(modelPower('legendary', 2)).toBeGreaterThan(modelPower('common', 10));
});
it('unitStats ne change que vie et dégâts', () => {
  const m = jimeeById('standard'), s = unitStats(m, 10);
  expect(s.hp).toBeCloseTo(m.profile.hp * 1.9); expect(s.damage).toBeCloseTo(m.profile.damage * 1.9);
  expect(s.speed).toBe(m.profile.speed); expect(s.range).toBe(m.profile.range);
});
```

- [ ] **Step 2 : Lancer** — Run : `npx vitest run tests/economy` — Expected : FAIL.
- [ ] **Step 3 : Implémenter** `rng.ts` et `power.ts` (signatures ci-dessus).
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: hasard reproductible et courbe de puissance"`

---

### Task 4 : Distributeur de capsules et fusion

**Files :**
- Create : `src/economy/capsules.ts`
- Test : `tests/economy/capsules.test.ts`

**Interfaces :**
- Consumes : `Rng`, `pick` (tâche 3) ; `ECONOMY`, `JIMEES`, `jimeeById` (tâche 2). Le type `Wallet` défini ici est la partie de la sauvegarde utile à l'économie ; `SaveData` (tâche 6) l'étend.
- Produces :
  - `type Wallet = { credits: number; crystals: number; collection: Record<string, number> }` (modelId → niveau)
  - `rarityOdds(crystals: number): Record<Rarity, number>` — en points de pourcentage ; lève une erreur hors de 0..3
  - `drawCapsule(rng: Rng, crystals: number): { rarity: Rarity; modelId: string }` — rareté d'abord, puis modèle au hasard dans la rareté
  - `type DrawOutcome = { kind: 'new'; modelId: string } | { kind: 'levelUp'; modelId: string; level: number } | { kind: 'buyback'; modelId: string; credits: number }`
  - `applyDraw<W extends Wallet>(wallet: W, modelId: string): { wallet: W; outcome: DrawOutcome }` — pure, ne modifie pas l'entrée
  - `purchaseDraw<W extends Wallet>(wallet: W, crystals: number, rng: Rng): { wallet: W; outcome: DrawOutcome } | null` — `null` si crédits < 100, cristaux possédés < `crystals`, ou `crystals` hors 0..3 ; sinon débite 100 crédits et `crystals` cristaux, tire, applique.

- [ ] **Step 1 : Écrire les tests**

```ts
it.each([
  [0, { common: 60, rare: 28, epic: 10, legendary: 2 }],
  [1, { common: 48, rare: 34, epic: 14, legendary: 4 }],
  [2, { common: 36, rare: 40, epic: 18, legendary: 6 }],
  [3, { common: 24, rare: 46, epic: 22, legendary: 8 }],
])('probabilités avec %i cristaux', (c, odds) => expect(rarityOdds(c)).toEqual(odds));
it('refuse 4 cristaux', () => expect(() => rarityOdds(4)).toThrow());
it('répartition conforme sur 100 000 tirages (graine fixe)', () => {
  const rng = createRng(7); const n = 100_000; const count = { common: 0, rare: 0, epic: 0, legendary: 0 };
  for (let i = 0; i < n; i++) count[drawCapsule(rng, 0).rarity]++;
  expect(count.common / n).toBeCloseTo(0.60, 2); expect(count.legendary / n).toBeCloseTo(0.02, 2);
});
it('le modèle tiré a la rareté tirée', () => { const rng = createRng(3); for (let i = 0; i < 500; i++) { const d = drawCapsule(rng, 3); expect(jimeeById(d.modelId).rarity).toBe(d.rarity); } });
const w = { credits: 0, crystals: 0, collection: { standard: 1 } };
it('nouveau modèle → niveau 1', () => expect(applyDraw(w, 'costaud')).toMatchObject({ outcome: { kind: 'new' }, wallet: { collection: { costaud: 1 } } }));
it('doublon → +1 niveau', () => expect(applyDraw(w, 'standard').outcome).toEqual({ kind: 'levelUp', modelId: 'standard', level: 2 }));
it('doublon au niveau 10 → 25 crédits, le modèle reste au niveau 10', () => {
  const r = applyDraw({ ...w, collection: { standard: 10 } }, 'standard');
  expect(r.outcome).toEqual({ kind: 'buyback', modelId: 'standard', credits: 25 });
  expect(r.wallet.collection.standard).toBe(10); expect(r.wallet.credits).toBe(25);
});
it('applyDraw ne modifie pas l\'entrée', () => { const before = structuredClone(w); applyDraw(w, 'standard'); expect(w).toEqual(before); });
it('achat refusé si crédits insuffisants', () => expect(purchaseDraw({ ...w, credits: 99 }, 0, createRng(1))).toBeNull());
it('achat refusé si cristaux insuffisants', () => expect(purchaseDraw({ ...w, credits: 500, crystals: 1 }, 2, createRng(1))).toBeNull());
it('achat débite 100 crédits et les cristaux', () => {
  const r = purchaseDraw({ ...w, credits: 150, crystals: 2 }, 2, createRng(1))!;
  expect(r.wallet.crystals).toBe(0);
  expect(r.wallet.credits).toBe(r.outcome.kind === 'buyback' ? 75 : 50);
});
```

- [ ] **Step 2 : Lancer** — Run : `npx vitest run tests/economy/capsules.test.ts` — Expected : FAIL.
- [ ] **Step 3 : Implémenter** `capsules.ts`. Tirage de rareté : cumuler les probabilités dans l'ordre commun → légendaire et comparer à `rng() × 100`.
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: distributeur de capsules et fusion"`

---

### Task 5 : Gains de bataille, conquête et améliorations de la fusée

**Files :**
- Create : `src/economy/progress.ts`, `src/economy/rocket.ts`
- Test : `tests/economy/progress.test.ts`, `tests/economy/rocket.test.ts`

**Interfaces :**
- Consumes : `Rng`, `ECONOMY`, `UpgradeKey`, `Wallet`.
- Produces :
  - `type BattleOutcome = 'won' | 'lost'` (un abandon est `'lost'`)
  - `battleCredits(p: { outcome: BattleOutcome; planetId: number; enemyCredits: number; firstConquest: boolean }): number` — victoire : `(enemyCredits + 50 × planetId)` ; défaite : `enemyCredits` ; puis `× 0,4` si `!firstConquest` ; arrondi à l'entier.
  - `rollCrystal(rng: Rng): boolean` — `rng() < 0.1`
  - `type Progress = Wallet & { highestUnlocked: number; conquered: number[] }`
  - `applyBattleResult<P extends Progress>(save: P, r: { outcome: BattleOutcome; planetId: number; credits: number; crystal: boolean }): P` — ajoute crédits et cristal ; si victoire : ajoute `planetId` à `conquered` (sans doublon) et `highestUnlocked = max(highestUnlocked, min(planetId + 1, 10))`.
  - `type RocketLevels = Record<UpgradeKey, number>`
  - `upgradeCost(level: number): number | null` — coût pour passer de `level` à `level + 1` : `round(80 × 1,5^(level − 1) / 10) × 10` ; `null` si `level >= 10`.
  - `interface RocketStats { hp: number; chargeMax: number; chargeRate: number; turretDamage: number; turretRange: number; turretInterval: number; cannonDamage: number; cannonRadius: number; cannonCooldown: number }`
  - `rocketStats(levels: RocketLevels): RocketStats` — effets par niveau au-dessus de 1, valeurs `ECONOMY.rocket`.
  - `buyUpgrade<W extends Wallet & { rocket: RocketLevels }>(save: W, key: UpgradeKey): W | null` — `null` si niveau max ou crédits insuffisants.

- [ ] **Step 1 : Écrire les tests**

```ts
it('victoire en première conquête', () => expect(battleCredits({ outcome: 'won', planetId: 3, enemyCredits: 40, firstConquest: true })).toBe(190));
it('victoire en farm ×0,4', () => expect(battleCredits({ outcome: 'won', planetId: 3, enemyCredits: 40, firstConquest: false })).toBe(76));
it('défaite : crédits des ennemis seulement', () => expect(battleCredits({ outcome: 'lost', planetId: 3, enemyCredits: 40, firstConquest: true })).toBe(40));
it('défaite en farm', () => expect(battleCredits({ outcome: 'lost', planetId: 3, enemyCredits: 40, firstConquest: false })).toBe(16));
it('cristal : seuil 0,1', () => { expect(rollCrystal(() => 0.09)).toBe(true); expect(rollCrystal(() => 0.1)).toBe(false); });
it('victoire débloque la planète suivante', () => {
  const s = applyBattleResult({ credits: 0, crystals: 0, collection: {}, highestUnlocked: 3, conquered: [1, 2] }, { outcome: 'won', planetId: 3, credits: 190, crystal: true });
  expect(s).toMatchObject({ credits: 190, crystals: 1, highestUnlocked: 4, conquered: [1, 2, 3] });
});
it('la planète 10 ne débloque pas de 11e', () => expect(applyBattleResult({ credits: 0, crystals: 0, collection: {}, highestUnlocked: 10, conquered: [] }, { outcome: 'won', planetId: 10, credits: 0, crystal: false }).highestUnlocked).toBe(10));
it('défaite ne débloque rien', () => expect(applyBattleResult({ credits: 0, crystals: 0, collection: {}, highestUnlocked: 3, conquered: [1, 2] }, { outcome: 'lost', planetId: 3, credits: 40, crystal: false })).toMatchObject({ highestUnlocked: 3, conquered: [1, 2], credits: 40 }));
it.each([[1, 80], [2, 120], [3, 180], [4, 270], [5, 410], [10, null]])('coût du niveau %i', (l, c) => expect(upgradeCost(l)).toBe(c));
it('statistiques de la fusée', () => {
  const s = rocketStats({ chargeRate: 3, chargeMax: 2, turret: 1, cannon: 5 });
  expect(s.chargeRate).toBeCloseTo(1.3); expect(s.chargeMax).toBe(12);
  expect(s.turretDamage).toBe(12); expect(s.cannonDamage).toBeCloseTo(128); expect(s.cannonCooldown).toBe(24);
});
it('achat refusé au niveau max', () => expect(buyUpgrade({ credits: 9999, crystals: 0, collection: {}, rocket: { chargeRate: 10, chargeMax: 1, turret: 1, cannon: 1 } }, 'chargeRate')).toBeNull());
it('achat refusé sans crédits', () => expect(buyUpgrade({ credits: 79, crystals: 0, collection: {}, rocket: { chargeRate: 1, chargeMax: 1, turret: 1, cannon: 1 } }, 'turret')).toBeNull());
it('achat débite et monte le niveau', () => expect(buyUpgrade({ credits: 100, crystals: 0, collection: {}, rocket: { chargeRate: 1, chargeMax: 1, turret: 1, cannon: 1 } }, 'turret')).toMatchObject({ credits: 20, rocket: { turret: 2 } }));
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter** `progress.ts` et `rocket.ts`.
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: gains, conquête et améliorations de la fusée"`

---

### Task 6 : Sauvegarde

**Files :**
- Create : `src/save/save.ts`
- Test : `tests/save/save.test.ts`

**Interfaces :**
- Consumes : `ECONOMY.startingCollection`, `Progress`, `RocketLevels`.
- Produces :
  - `interface SaveData extends Progress { version: 1; team: (string | null)[]; rocket: RocketLevels }` (`team` a toujours 4 entrées)
  - `SAVE_KEY = 'jimees-save'`
  - `newSave(): SaveData` — `highestUnlocked: 1`, `conquered: []`, `credits: 0`, `crystals: 0`, `collection: { standard: 1, lanceur: 1 }`, `team: ['standard', 'lanceur', null, null]`, tous les niveaux de fusée à 1.
  - `getStorage(): Storage | null` — teste une écriture/suppression ; `null` en cas d'exception.
  - `type LoadResult = { status: 'ok'; data: SaveData } | { status: 'new'; data: SaveData } | { status: 'corrupt'; raw: string } | { status: 'unavailable'; data: SaveData }`
  - `loadGame(storage: Storage | null): LoadResult`
  - `saveGame(storage: Storage | null, data: SaveData): boolean`
  - `migrate(raw: unknown): SaveData` — accepte la version 1 (validation des champs et types), lève une erreur sinon. Point d'extension : un `switch` sur `version` pour les futures migrations.
  - `resetGame(storage: Storage | null): SaveData` — écrit et renvoie `newSave()`.

- [ ] **Step 1 : Écrire les tests** (stockage factice : objet implémentant `getItem`/`setItem`/`removeItem` sur une `Map`, et une variante dont chaque méthode lève une exception)

```ts
it('aucune sauvegarde → partie neuve', () => expect(loadGame(fakeStorage())).toEqual({ status: 'new', data: newSave() }));
it('aller-retour', () => { const s = fakeStorage(); const d = { ...newSave(), credits: 321 }; expect(saveGame(s, d)).toBe(true); expect(loadGame(s)).toEqual({ status: 'ok', data: d }); });
it('JSON illisible → corrupt, contenu non effacé', () => { const s = fakeStorage(); s.setItem(SAVE_KEY, '{oups'); expect(loadGame(s)).toEqual({ status: 'corrupt', raw: '{oups' }); expect(s.getItem(SAVE_KEY)).toBe('{oups'); });
it('champs manquants → corrupt', () => { const s = fakeStorage(); s.setItem(SAVE_KEY, JSON.stringify({ version: 1 })); expect(loadGame(s).status).toBe('corrupt'); });
it('stockage absent → unavailable avec partie neuve', () => expect(loadGame(null)).toEqual({ status: 'unavailable', data: newSave() }));
it('stockage qui lève une exception → unavailable, pas de crash', () => expect(loadGame(throwingStorage()).status).toBe('unavailable'));
it('saveGame renvoie false si l\'écriture échoue', () => expect(saveGame(throwingStorage(), newSave())).toBe(false));
it('version inconnue → erreur de migration', () => expect(() => migrate({ ...newSave(), version: 99 })).toThrow());
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter** `save.ts`.
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: sauvegarde versionnée"`

---

### Task 7 : Simulation de bataille — cœur

**Files :**
- Create : `src/battle/types.ts`, `src/battle/sim.ts`, `src/battle/abilities.ts` (crochets vides)
- Test : `tests/battle/sim.test.ts`

**Interfaces :**
- Consumes : `Planet`, `EnemyDef`, `JimeeModel`, `ENEMIES` ; `unitStats` ; `RocketStats` ; `createRng`, `Rng`.
- Produces :

```ts
// src/battle/types.ts
export const WORLD_WIDTH = 1200;   // ≈ 3 largeurs d'écran
export const ROCKET_X = 60;
export const ENEMY_BASE_X = 1140;
export const FIXED_DT = 1 / 60;
export const MAX_FRAME = 0.25;     // secondes simulées au plus par image
export interface TeamSlot { model: JimeeModel; level: number }
export interface BattleSetup { planet: Planet; team: (TeamSlot | null)[]; rocket: RocketStats; seed: number }
export interface Unit {
  id: number; side: 'jimee' | 'enemy'; defId: string; x: number;
  hp: number; maxHp: number; shield: number; damage: number; speed: number; range: number;
  attackInterval: number; cooldown: number; ranged: boolean; abilityTimer: number; isBoss: boolean;
}
export interface Projectile { fromX: number; toX: number; t: number; side: Unit['side']; splash?: number }
export interface BattleState {
  time: number; outcome: 'running' | 'won' | 'lost'; rng: Rng; setup: BattleSetup;
  units: Unit[]; projectiles: Projectile[];
  rocketHp: number; enemyBaseHp: number; enemyBaseMaxHp: number;
  charge: number; cannonCooldown: number; turretCooldown: number;
  waveTimer: number; bossSpawned: boolean; nextId: number;
  stats: { kills: number; enemyCredits: number; jimeesLost: number };
  events: BattleEvent[];   // vidé par le rendu à chaque image
}
export type BattleEvent =
  | { kind: 'hit'; x: number } | { kind: 'death'; x: number; side: Unit['side'] }
  | { kind: 'explosion'; x: number; radius: number } | { kind: 'heal'; x: number } | { kind: 'cannon'; x: number; radius: number };
```

  - `createBattle(setup: BattleSetup): BattleState` — fusée à `rocket.hp`, chargement à 0, canon prêt (`cannonCooldown = 0`), base ennemie à `planet.baseHp`, `waveTimer = 3`.
  - `sendJimee(state: BattleState, slot: number): boolean` — `false` si emplacement vide, partie finie, ou `charge < cost` ; sinon débite et crée l'unité à `ROCKET_X + 20` avec `unitStats`.
  - `stepBattle(state: BattleState, dt: number): void` — un pas : chargement (`+chargeRate × dt`, plafonné à `chargeMax`), vagues, déplacements, ciblage, attaques, projectiles, morts, fin. Appelle les crochets de `abilities.ts` (tâche 8) : `tickAbilities`, `tickTurret`, `onDeath`, `onDamage`.
  - `advanceBattle(state: BattleState, frameSeconds: number): void` — accumule `min(frameSeconds, MAX_FRAME)` et exécute des pas de `FIXED_DT`.
  - Règles de mouvement : une unité avance (`+speed` pour les Jimees, `−speed` pour les ennemis) sauf si une unité adverse ou la base adverse est à portée (`range`). Cible : l'unité adverse vivante la plus proche devant elle, sinon la base. Attaque quand `cooldown ≤ 0`, puis `cooldown = attackInterval`. Corps à corps : dégâts immédiats. Distance : projectile de durée 0,4 s, dégâts à l'arrivée. Base ennemie : portée atteinte quand `ENEMY_BASE_X − x ≤ range` ; fusée : `x − ROCKET_X ≤ range`.
  - Vagues : quand `waveTimer ≤ 0`, ajoute `planet.waveSize` ennemis tirés dans `enemyPool` (espacés de 0,6 s), statistiques `× planet.statMultiplier`, puis `waveTimer = planet.waveInterval`. Boss : apparaît une seule fois à `time ≥ 20` si `planet.bossId`.
  - Mort d'un ennemi : `kills += 1`, `enemyCredits += reward`. Mort d'un Jimee : `jimeesLost += 1`.
  - Fin : `enemyBaseHp ≤ 0` → `'won'` ; `rocketHp ≤ 0` → `'lost'`. Plus aucun pas n'a d'effet ensuite.
  - `abandonBattle(state: BattleState): void` → `'lost'`.

- [ ] **Step 1 : Écrire les tests** (fixture : planète minimale à 1 type d'ennemi `blob`, `waveInterval` très grand pour contrôler les apparitions ; fusée via `rocketStats` niveau 1)

```ts
it('le chargement monte et plafonne', () => { const s = createBattle(setup()); advanceSeconds(s, 20); expect(s.charge).toBe(10); });
it('envoi refusé si chargement insuffisant', () => { const s = createBattle(setup()); expect(sendJimee(s, 0)).toBe(false); expect(s.units).toHaveLength(0); });
it('taps répétés : un seul envoi, jauge jamais négative', () => {
  const s = createBattle(setup()); s.charge = jimeeById('standard').cost;
  expect([sendJimee(s, 0), sendJimee(s, 0), sendJimee(s, 0)]).toEqual([true, false, false]); expect(s.charge).toBe(0);
});
it('emplacement vide : refus', () => { const s = createBattle(setup({ team: [null, null, null, null] })); s.charge = 10; expect(sendJimee(s, 0)).toBe(false); });
it('un Jimee avance puis s\'arrête à portée d\'un ennemi', () => { /* placer un blob immobile à x=500, vérifier que le Jimee s'arrête à 500 - range ± 1 */ });
it('dégâts au corps à corps selon attackInterval', () => { /* deux unités au contact : après 1 attackInterval, la cible a perdu damage */ });
it('tir à distance : dégâts à l\'arrivée du projectile', () => { /* la cible ne perd ses pv qu'après 0,4 s */ });
it('mort d\'un ennemi : kills et crédits', () => { /* stats.kills === 1, stats.enemyCredits === ENEMIES.blob.reward */ });
it('mort d\'un Jimee : jimeesLost', () => { /* … === 1 */ });
it('victoire quand la base ennemie tombe', () => { const s = createBattle(setup()); s.enemyBaseHp = 1; /* un Jimee à portée */ advanceSeconds(s, 3); expect(s.outcome).toBe('won'); });
it('défaite quand la fusée tombe', () => { /* rocketHp = 1, un ennemi à portée */ expect(s.outcome).toBe('lost'); });
it('rien ne bouge après la fin', () => { /* outcome won, snapshot des unités identique après advanceSeconds */ });
it('les vagues utilisent statMultiplier', () => { /* planète statMultiplier 2 : pv du blob = 2 × ENEMIES.blob.stats.hp */ });
it('le boss apparaît une seule fois après 20 s', () => { /* planète 5 : 0 boss à 19,9 s, 1 boss à 20,1 s, toujours 1 à 60 s */ });
it('même graine → même bataille', () => { /* deux batailles, mêmes envois, même état après 30 s */ });
it('advanceBattle plafonne un énorme écart de temps', () => { const s = createBattle(setup()); advanceBattle(s, 10); expect(s.time).toBeCloseTo(0.25, 2); });
```

  Les corps marqués `/* … */` sont à écrire par l'implémenteur avec exactement l'assertion indiquée.
- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter** `types.ts` et `sim.ts`. Créer dans `abilities.ts` des crochets vides (`tickAbilities`, `tickTurret`, `onDeath`, `onDamage`) que la tâche 8 remplira.
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: simulation de bataille"`

---

### Task 8 : Capacités, tourelle et canon

**Files :**
- Modify : `src/battle/abilities.ts`, `src/battle/sim.ts` (exposer `fireCannon`)
- Test : `tests/battle/abilities.test.ts`

**Interfaces :**
- Consumes : `BattleState`, `Unit`, `Ability`, `RocketStats`.
- Produces :
  - `onDamage(state, unit, amount): number` — le bouclier absorbe en premier ; renvoie les dégâts appliqués aux pv.
  - `onDeath(state, unit): void` — `explodeOnDeath` : dégâts `damageFactor × damage` aux ennemis dans `radius`, événement `explosion`.
  - `tickAbilities(state, dt): void` — `heal` : tous les `interval` s, soigne de `amountFactor × maxHp` (du soigneur) les Jimees vivants dans `radius`, sans dépasser leur `maxHp`.
  - Création d'une unité `shield` : `shield = amountFactor × maxHp`. Projectile `splash` : dégâts à tous les ennemis dans `radius` autour du point d'impact.
  - `tickTurret(state, dt): void` — tire sur l'ennemi le plus proche à moins de `turretRange` de `ROCKET_X`, toutes les `turretInterval` s, dégâts `turretDamage`.
  - `fireCannon(state: BattleState, x: number): boolean` — `false` si `cannonCooldown > 0` ou partie finie ; sinon dégâts `cannonDamage` à tous les ennemis dans `cannonRadius` autour de `x`, `cannonCooldown = rocket.cannonCooldown`, événement `cannon`. La recharge diminue de `dt` à chaque pas.

- [ ] **Step 1 : Écrire les tests**

```ts
it('le bouclier absorbe avant les pv', () => { /* Blindé : shield = amountFactor × maxHp ; un coup inférieur au bouclier ne retire aucun pv */ });
it('le Kamikaze explose à sa mort', () => { /* deux ennemis dans le rayon perdent damageFactor × damage, un ennemi hors rayon ne perd rien */ });
it('l\'Infirmier soigne sans dépasser le max', () => { /* Jimee blessé dans le rayon : pv augmentés après interval, plafonnés à maxHp */ });
it('le Prototype touche une zone', () => { /* deux ennemis proches touchés par le même tir */ });
it('la tourelle tire sur un ennemi proche', () => { /* ennemi à ROCKET_X + 100 : perd turretDamage après turretInterval */ });
it('la tourelle ignore un ennemi hors de portée', () => { /* ennemi à ROCKET_X + 300 : intact */ });
it('canon : zone, recharge, refus pendant la recharge', () => {
  const s = createBattle(setup()); /* deux ennemis à 600 et 640, un à 800 */
  expect(fireCannon(s, 610)).toBe(true); /* 600 et 640 touchés, 800 intact */
  expect(fireCannon(s, 610)).toBe(false);
  advanceSeconds(s, 30); expect(fireCannon(s, 610)).toBe(true);
});
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter.**
- [ ] **Step 4 : Lancer tous les tests** — Run : `npm test` — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: capacités, tourelle et canon"`

---

### Task 9 : Dessin et caméra

**Files :**
- Create : `src/art/jimee.ts`, `src/art/enemies.ts`, `src/art/scenery.ts`, `src/battle/camera.ts`, `src/battle/render.ts`
- Test : `tests/battle/camera.test.ts`

**Interfaces :**
- Consumes : `BattleState`, `Unit`, `JimeeModel`, `EnemyDef`, `Planet`, constantes de `battle/types.ts`.
- Produces :
  - `drawJimee(ctx: CanvasRenderingContext2D, x: number, y: number, model: JimeeModel, opts: { facing: 1 | -1; walkPhase: number; scale: number }): void`
  - `drawEnemy(ctx, x, y, def: EnemyDef, palette: Planet['palette'], opts: { facing: 1 | -1; walkPhase: number }): void`
  - `drawRocket(ctx, x, groundY, hpRatio)`, `drawEnemyBase(ctx, x, groundY, hpRatio, planet)`, `drawBackground(ctx, planet, cameraX, width, height)`
  - `interface Camera { x: number; viewWidth: number; lastDragAt: number }`
  - `createCamera(viewWidth: number): Camera`
  - `followCamera(cam: Camera, frontX: number, now: number): void` — si `now − lastDragAt ≥ 3`, centre en douceur sur `frontX` ; toujours borné à `[0, WORLD_WIDTH − viewWidth]`.
  - `dragCamera(cam: Camera, dx: number, now: number): void` — décale, borne, `lastDragAt = now`.
  - `screenToWorld(cam: Camera, screenX: number, scale: number): number`
  - `renderBattle(ctx, state: BattleState, cam: Camera, size: { width: number; height: number }): void` — dessine décor, fusée, base, unités triées, projectiles, effets ; consomme `state.events`.

- [ ] **Step 1 : Écrire les tests de caméra**

```ts
it('borne à gauche et à droite', () => { const c = createCamera(400); dragCamera(c, -999, 0); expect(c.x).toBe(0); dragCamera(c, 9999, 0); expect(c.x).toBe(800); });
it('pas de suivi moins de 3 s après un glisser', () => { const c = createCamera(400); dragCamera(c, 100, 10); const x = c.x; followCamera(c, 900, 12.9); expect(c.x).toBe(x); });
it('reprend le suivi après 3 s', () => { const c = createCamera(400); dragCamera(c, 100, 10); const x = c.x; followCamera(c, 900, 13); expect(c.x).not.toBe(x); });
it('screenToWorld', () => { const c = createCamera(400); c.x = 200; expect(screenToWorld(c, 100, 1)).toBe(300); });
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter `camera.ts`**, relancer — Expected : PASS.
- [ ] **Step 4 : Implémenter le dessin** (`art/*`, `render.ts`). Jimee : apparence des Global Constraints, ceinture `model.belt`, accessoire `model.accessory`, légère oscillation de marche. Employés de Jimmy's Inc. : silhouette de bureau avec casquette. Boss : grand format. Barres de vie au-dessus des unités et des bases. Tout est original.
- [ ] **Step 5 : Vérifier visuellement** — ajouter temporairement une page `dev/art.html` (non publiée, hors `dist`) qui dessine les 8 Jimees, les 6 ennemis, la fusée et la base ; Run : `npm run dev`, ouvrir `/jeux-rapide/dev/art.html` ; capture d'écran à montrer à Lucas. Supprimer la page avant le commit.
- [ ] **Step 6 : Commit** — `git commit -m "feat: dessin des personnages et caméra"`

---

### Task 10 : Écran de bataille

**Files :**
- Create : `src/battle/battleScreen.ts`
- Modify : `src/screens/style.css`
- Test : `tests/battle/battleScreen.test.ts`

**Interfaces :**
- Consumes : `createBattle`, `advanceBattle`, `sendJimee`, `fireCannon`, `abandonBattle`, `renderBattle`, caméra.
- Produces :
  - `interface BattleResult { outcome: 'won' | 'lost'; planetId: number; enemyCredits: number; jimeesLost: number }`
  - `mountBattle(root: HTMLElement, setup: BattleSetup, onEnd: (r: BattleResult) => void): () => void` — renvoie une fonction de nettoyage (arrête la boucle, retire les écouteurs).
  - Mise en page portrait : canvas dans la moitié haute, barre de commande en bas : jauge de chargement (valeur entière / max), 4 boutons (icône du modèle, nom, coût ; `disabled` si emplacement vide ou chargement insuffisant), bouton canon avec recharge restante, bouton pause.
  - Canon : un tap sur le bouton l'arme (bouton surligné) ; le tap suivant sur le canvas tire à `screenToWorld(…)` ; un second tap sur le bouton désarme.
  - Glisser horizontal sur le canvas → `dragCamera`.
  - Pause : fige la simulation ; menu « Reprendre » / « Abandonner ». `visibilitychange` → pause automatique quand la page est cachée.
  - Boucle `requestAnimationFrame` → `advanceBattle(state, dt)` puis rendu ; à la fin (`outcome !== 'running'`), attend 1,5 s puis appelle `onEnd` une seule fois.

- [ ] **Step 1 : Écrire les tests (jsdom)** — faux `requestAnimationFrame` piloté à la main, `HTMLCanvasElement.prototype.getContext` remplacé par un contexte factice.

```ts
it('un bouton est désactivé tant que le chargement est insuffisant', () => { /* au montage : boutons des emplacements remplis disabled */ });
it('les emplacements vides restent désactivés', () => { /* team avec null en 3e et 4e place */ });
it('la page cachée met la bataille en pause', () => { /* dispatch visibilitychange avec document.hidden = true ; plusieurs frames : state.time inchangé */ });
it('abandon → onEnd avec outcome lost, une seule fois', () => { /* clic pause puis Abandonner ; avancer de 2 s ; onEnd appelé 1 fois */ });
it('le nettoyage arrête la boucle', () => { /* après cleanup, plus aucun appel à requestAnimationFrame */ });
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter** `battleScreen.ts` et les styles de la barre de commande (boutons de 48 px de haut minimum, utilisables au pouce).
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: écran de bataille"`

---

### Task 11 : Navigation, guichet, carte, préparation et bilan

**Files :**
- Create : `src/screens/app.ts`, `src/screens/counter.ts`, `src/screens/map.ts`, `src/screens/prepare.ts`, `src/screens/results.ts`, `src/art/representative.ts`
- Modify : `src/main.ts`, `src/screens/style.css`
- Test : `tests/screens/app.test.ts`, `tests/screens/prepare.test.ts`, `tests/screens/results.test.ts`

**Interfaces :**
- Consumes : `loadGame`, `saveGame`, `resetGame`, `getStorage`, `SaveData` ; `PLANETS`, `JIMEES`, `CORP_LINES` ; `pick`, `randomSeed`, `createRng` ; `battleCredits`, `rollCrystal`, `applyBattleResult` ; `rocketStats` ; `mountBattle`, `BattleResult`.
- Produces :
  - `type ScreenName = 'counter' | 'map' | 'prepare' | 'battle' | 'results' | 'capsules' | 'rocket'`
  - `interface AppContext { save: SaveData; storageOk: boolean; persist(): void; go(screen: ScreenName, params?: Record<string, unknown>): void; rng: Rng }`
  - `startApp(root: HTMLElement, storage: Storage | null): AppContext` — gère les 4 statuts de `loadGame` : `corrupt` → message du représentant + bouton « Repartir de zéro » (appelle `resetGame` seulement après ce clic) ; `unavailable` → bandeau d'avertissement permanent « Progression non sauvegardée ».
  - `representativeSvg(): string` — le représentant tel que décrit dans la spec (grand, chauve, gros nez, cravate rouge, mains dans les poches, sourire), dessiné en formes simples, original.
  - Écrans : chacun exporte `render(root: HTMLElement, ctx: AppContext, params?): void`.
    - **Guichet** : représentant sous un auvent rayé, réplique `pick(CORP_LINES.counter)`, crédits et cristaux, boutons Carte / Distributeur / Fusée.
    - **Carte** : 10 planètes sur un chemin vertical ; verrouillée si `id > highestUnlocked` ; badge « conquise » ; un tap sur une planète débloquée → `prepare` avec `planetId`. Mention « gains réduits (×0,4) » sur les planètes conquises.
    - **Préparation** : 4 emplacements, liste de la collection (nom, rareté, niveau, coût) ; tap sur un modèle → le place dans le premier emplacement libre ; tap sur un emplacement → le vide ; un modèle ne peut occuper qu'un emplacement. Bouton « Décoller » désactivé si l'équipe est vide. Sauvegarde la composition (`team`).
    - **Bilan** : reçoit `BattleResult` ; calcule `credits = battleCredits(...)` avec `firstConquest = !conquered.includes(planetId)`, `crystal = outcome === 'won' && rollCrystal(rng)` ; applique `applyBattleResult`, `persist()` ; affiche victoire/défaite, crédits, cristal, nombre de Jimees perdus, affiche « Promo du deuil » (titre `pick(CORP_LINES.mourningPosterTitles)` + nombre de Jimees perdus) et réplique `victory`/`defeat`. Boutons « Rejouer » et « Guichet ».
  - Pure, testable : `teamSetup(save: SaveData, planetId: number, seed: number): BattleSetup | null` dans `prepare.ts` — `null` si aucun emplacement rempli.
  - Pure, testable : `settleBattle(save: SaveData, r: BattleResult, rng: Rng): { save: SaveData; credits: number; crystal: boolean; firstConquest: boolean }` dans `results.ts`.

- [ ] **Step 1 : Écrire les tests**

```ts
it('équipe vide → pas de bataille', () => expect(teamSetup({ ...newSave(), team: [null, null, null, null] }, 1, 1)).toBeNull());
it('l\'équipe porte les niveaux de la collection', () => {
  const s = teamSetup({ ...newSave(), collection: { standard: 4, lanceur: 1 } }, 1, 1)!;
  expect(s.team[0]).toMatchObject({ model: { id: 'standard' }, level: 4 });
});
it('première conquête : gains complets et planète suivante débloquée', () => {
  const r = settleBattle(newSave(), { outcome: 'won', planetId: 1, enemyCredits: 30, jimeesLost: 2 }, () => 0.5);
  expect(r).toMatchObject({ credits: 80, crystal: false, firstConquest: true, save: { highestUnlocked: 2, conquered: [1] } });
});
it('farm : gains réduits', () => {
  const r = settleBattle({ ...newSave(), conquered: [1], highestUnlocked: 2 }, { outcome: 'won', planetId: 1, enemyCredits: 30, jimeesLost: 0 }, () => 0.5);
  expect(r.credits).toBe(32);
});
it('défaite : pas de cristal même avec un tirage chanceux', () => expect(settleBattle(newSave(), { outcome: 'lost', planetId: 1, enemyCredits: 10, jimeesLost: 5 }, () => 0).crystal).toBe(false));
it('sauvegarde illisible : rien n\'est effacé avant confirmation', () => { /* startApp avec storage contenant '{oups' : écran d'erreur affiché, storage inchangé ; clic « Repartir de zéro » → newSave écrit */ });
it('stockage indisponible : bandeau d\'avertissement', () => { /* startApp(root, null) : texte « Progression non sauvegardée » présent */ });
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter** navigation et écrans. `main.ts` : `startApp(document.getElementById('app')!, getStorage())`.
- [ ] **Step 4 : Lancer** — Expected : PASS.
- [ ] **Step 5 : Vérifier en jouant** — `npm run dev -- --host`, ouvrir sur un téléphone (ou un viewport 390×844) : guichet → carte → préparation → bataille planète 1 → bilan → guichet ; la progression survit à un rechargement.
- [ ] **Step 6 : Commit** — `git commit -m "feat: guichet, carte, préparation et bilan"`

---

### Task 12 : Distributeur et fusée

**Files :**
- Create : `src/screens/capsules.ts`, `src/screens/rocket.ts`
- Modify : `src/screens/style.css`
- Test : `tests/screens/capsules.test.ts`, `tests/screens/rocket.test.ts`

**Interfaces :**
- Consumes : `rarityOdds`, `purchaseDraw`, `DrawOutcome`, `ECONOMY` ; `upgradeCost`, `buyUpgrade`, `rocketStats` ; `CORP_LINES` ; `AppContext`.
- Produces :
  - **Distributeur** : machine à manivelle dessinée en CSS/SVG. Sélecteur de cristaux 0 à 3 (les valeurs supérieures aux cristaux possédés sont désactivées). Tableau des 4 probabilités mis à jour **avant** le tirage. Prix « 100 crédits » affiché. Bouton « Tourner la manivelle » désactivé si `purchaseDraw` renverrait `null`. Résultat animé (capsule qui s'ouvre) puis : `new` → bannière « Nouveau ! » + `pick(CORP_LINES.newModel)` ; `levelUp` → « Niveau N » ; `buyback` → « Repris par la Corp : +25 crédits » + `pick(CORP_LINES.buyback)`. `persist()` après chaque tirage. Liste de la collection avec niveaux.
  - **Fusée** : 4 lignes (Vitesse de chargement, Capacité de chargement, Tourelle, Canon) avec niveau actuel, effet actuel → effet suivant (valeurs de `rocketStats`), coût `upgradeCost` ; au niveau 10 : « MAX » et bouton désactivé ; bouton désactivé si crédits insuffisants. `persist()` après chaque achat.
  - Pure, testable : `drawButtonState(save: SaveData, crystals: number): { enabled: boolean; odds: Record<Rarity, number> }` dans `capsules.ts`.
  - Pure, testable : `upgradeRows(save: SaveData): { key: UpgradeKey; label: string; level: number; cost: number | null; affordable: boolean; current: number; next: number | null }[]` dans `rocket.ts`.

- [ ] **Step 1 : Écrire les tests**

```ts
it('bouton désactivé sous 100 crédits', () => expect(drawButtonState({ ...newSave(), credits: 99 }, 0).enabled).toBe(false));
it('bouton désactivé si cristaux demandés > possédés', () => expect(drawButtonState({ ...newSave(), credits: 500, crystals: 1 }, 2).enabled).toBe(false));
it('probabilités affichées pour 2 cristaux', () => expect(drawButtonState({ ...newSave(), credits: 500, crystals: 2 }, 2).odds).toEqual({ common: 36, rare: 40, epic: 18, legendary: 6 }));
it('fusée niveau 10 : MAX, sans coût', () => {
  const row = upgradeRows({ ...newSave(), credits: 9999, rocket: { chargeRate: 10, chargeMax: 1, turret: 1, cannon: 1 } }).find(r => r.key === 'chargeRate')!;
  expect(row).toMatchObject({ cost: null, affordable: false, next: null });
});
it('amélioration non abordable', () => expect(upgradeRows({ ...newSave(), credits: 79 }).every(r => !r.affordable)).toBe(true));
it('libellés français', () => expect(upgradeRows(newSave()).map(r => r.label)).toEqual(['Vitesse de chargement', 'Capacité de chargement', 'Tourelle', 'Canon']));
```

- [ ] **Step 2 : Lancer** — Expected : FAIL.
- [ ] **Step 3 : Implémenter** les deux écrans.
- [ ] **Step 4 : Lancer** — Run : `npm test` — Expected : tout PASS.
- [ ] **Step 5 : Commit** — `git commit -m "feat: distributeur et fusée"`

---

### Task 13 : Vérification finale et mise en ligne

**Files :** aucun nouveau fichier (corrections éventuelles seulement).

- [ ] **Step 1 : Tests et build** — Run : `npm test && npm run build` — Expected : tout PASS, build sans erreur TypeScript.
- [ ] **Step 2 : Parcours complet en local** (`npm run preview -- --host`, viewport 390×844) : partie neuve → planète 1 gagnée → tirage → amélioration de la fusée → planète 2 → abandon → bilan de défaite → rechargement de la page : la progression est conservée. Vérifier : aucun chiffre caché derrière une réplique, aucun débordement horizontal, boutons atteignables au pouce.
- [ ] **Step 3 : Hors ligne** — dans le navigateur, mode hors ligne activé après un premier chargement : le jeu se relance.
- [ ] **Step 4 : Push** — `git push origin main` ; vérifier que l'Action GitHub passe au vert.
- [ ] **Step 5 : Activation de Pages par Lucas** — lui indiquer : repo → Settings → Pages → Source : « GitHub Actions » ; puis relancer l'Action (`workflow_dispatch`) si le premier déploiement a échoué faute d'activation.
- [ ] **Step 6 : Vérifier en ligne** — ouvrir `https://lucasboul-dev.github.io/jeux-rapide/` ; le manifeste est servi, le jeu se lance, l'installation sur l'écran d'accueil est proposée sur Android/Chrome.
