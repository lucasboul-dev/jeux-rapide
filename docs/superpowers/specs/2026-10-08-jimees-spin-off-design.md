# Jimees — spin-off « jeu rapide » : spécification de design

Date : 8 octobre 2026
Statut : en relecture par Lucas

## 1. Intention

Un jeu web mobile (PWA), jouable en portrait à une main, qui reprend le **genre** de We Are Warriors (une ressource qui se recharge, des unités envoyées sur une ligne pour détruire la base adverse, une progression vers des unités plus fortes) dans l'univers de la **Jimee's Corp**.

Le jeu est un spin-off de l'univers Jimee, mais doit pouvoir grandir et devenir le jeu principal : le contenu est piloté par des fichiers de données, et les systèmes sont découpés en blocs indépendants.

Seul le genre est repris. Aucun graphisme, nom, son ou texte de We Are Warriors n'est réutilisé.

### Ce qui fait un succès

- On retrouve la sensation de jeu du genre : remplir la jauge, envoyer des unités, voir la ligne de front bouger.
- **Aucune publicité**, nulle part, et aucun achat en argent réel.
- Des niveaux durs (les boss) qui obligent à farmer, avec un farm **honnête** : jouer suffit, sans attente ni énergie limitée.
- L'humour de la Corp est présent partout, sans jamais cacher une information : prix, pourcentages et risques sont toujours affichés.

## 2. Univers (référence)

- **La Jimee's Corp** (« la Corp ») fabrique des Jimees et les vend à des capitaines de fusée qui explorent les galaxies pour en rapporter des richesses. Le joueur est l'un de ces capitaines. La Corp lui confie une fusée et deux Jimees : « Prenez-en soin, ils ne sont pas remboursés. »
- **Son fonctionnaire** (nouveau design du 9 octobre 2026) : grand, maigre, chauve, gros nez tombant, yeux mi-clos et cernés, air blasé. Uniforme gris-bleu à col montant, boutons, médailles, badge à pince ; une main dans la poche, l'autre bras robotique avec un écran au poignet. Il tamponne des formulaires holographiques à son bureau, fume le cigare quand un dossier le dépasse, et sa plaque dit : « L'univers est en expansion. Notre administration aussi. » Ton : blasé et fatigué, mais fidèle au cynisme commercial de la Corp. Les écrans de la Corp (guichet, distributeur, bilan, fiches) sont en style papier administratif.
- **Son ton** : cynique et poli, débité par un fonctionnaire las. Tout se vend, surtout le malheur. Mais les prix, pourcentages et risques sont toujours affichés honnêtement : c'est sa fierté commerciale.
- **Les Jimees** : petits êtres fabriqués en série, livrés en capsules. Tête ovale un peu penchée, grands yeux noirs, corps rectangle blanc, pieds ovales, ceinture de couleur. Naïfs, dévoués, **jetables** : on ne s'y attache pas.
- **Le concurrent** : Jimmy's Inc., dont les employés ont « une casquette plus chère ».

## 3. Écrans et boucle de jeu

Boucle : **combattre → gagner des crédits → tirer des capsules ou améliorer la fusée → affronter une planète plus dure**, et farmer quand ça bloque.

| Écran | Rôle |
|---|---|
| **Guichet de la Corp** (accueil) | Le représentant sous l'auvent rayé, une réplique différente à chaque visite. Accès à la carte, au distributeur et à la fusée. |
| **Carte de la galaxie** | 10 planètes reliées par un chemin. La planète suivante se débloque en conquérant la précédente. Les planètes conquises peuvent être rejouées. |
| **Préparation** | Choix des modèles dans les 4 emplacements de l'équipe. Un emplacement peut rester vide. |
| **Bataille** | Voir section 4. |
| **Bilan** | Crédits gagnés, cristal éventuel, nombre de Jimees perdus, affiche « Promo du deuil », réplique du représentant. |
| **Distributeur** | Tirage de capsules contre des crédits, avec ajout optionnel de cristaux. Probabilités affichées avant chaque tirage. Fusion automatique des doublons. |
| **Fusée** | Amélioration du chargement, de la tourelle et du canon contre des crédits. |

## 4. Bataille

- **Orientation** : portrait. Le terrain occupe la moitié haute de l'écran ; la barre de commande occupe le bas.
- **Terrain** : une ligne horizontale d'environ 3 largeurs d'écran. La fusée est à gauche, la base ennemie à droite. La caméra suit le Jimee le plus avancé ; le joueur peut la faire glisser au doigt, et elle reprend le suivi automatique après 3 secondes sans toucher.
- **Barre de commande** : la jauge de chargement, 4 boutons de Jimees (icône, coût, grisé si la jauge est insuffisante), et le bouton du canon avec son temps de recharge.
- **Chargement** : la jauge se remplit en continu. Valeurs de départ : maximum 10 points, +1 point par seconde. Envoyer un Jimee coûte son prix en points.
- **Jimees** : ils avancent vers la droite et attaquent le premier ennemi (ou la base) à portée. Types d'attaque : corps à corps ou distance. Certains modèles ont une capacité (voir section 6).
- **Ennemis** : la base ennemie produit des vagues dont la force dépend de la planète. Ils avancent vers la gauche et attaquent de la même façon.
- **Tourelle** : montée sur la fusée, elle tire automatiquement sur l'ennemi le plus proche à portée.
- **Canon** : pouvoir actif. Le joueur tape le bouton, puis la zone du terrain visée ; le canon inflige des dégâts à tous les ennemis de la zone. Temps de recharge de départ : 30 secondes. Il est chargé au début de la bataille.
- **Fin** : victoire quand la base ennemie tombe à 0, défaite quand la fusée tombe à 0. Le joueur peut abandonner depuis un menu pause, ce qui compte comme une défaite.

## 5. Économie et progression

Toutes les valeurs ci-dessous sont des valeurs de départ, stockées dans les fichiers de données et ajustables.

### Départ
Le joueur possède la fusée (tous les niveaux à 1) et 2 modèles communs : le **Standard** et le **Lanceur**, au niveau 1. Aucun crédit, aucun cristal.

### Crédits
- Chaque ennemi tué rapporte des crédits (valeur définie par créature).
- Une victoire ajoute un **bonus de planète** : `50 × numéro de la planète`.
- Sur une planète **déjà conquise**, tous les gains de crédits (ennemis et bonus) sont multipliés par **0,4**.
- En cas de défaite ou d'abandon, le joueur garde les crédits des ennemis tués, sans bonus.

### Cristaux
- **10 % de chance** d'en gagner un à chaque victoire, première conquête ou farm.
- Ils servent uniquement à améliorer les chances au distributeur.

### Distributeur
- Un tirage coûte **100 crédits**.
- Probabilités de base : commun 60 %, rare 28 %, épique 10 %, légendaire 2 %.
- Le joueur peut ajouter 0 à 3 cristaux par tirage. Chaque cristal applique : commun −12, rare +6, épique +4, légendaire +2 (en points de pourcentage).

| Cristaux | Commun | Rare | Épique | Légendaire |
|---|---|---|---|---|
| 0 | 60 % | 28 % | 10 % | 2 % |
| 1 | 48 % | 34 % | 14 % | 4 % |
| 2 | 36 % | 40 % | 18 % | 6 % |
| 3 | 24 % | 46 % | 22 % | 8 % |

- La rareté est tirée d'abord, puis le modèle au hasard (chances égales) parmi les modèles de cette rareté.
- Les probabilités correspondant au nombre de cristaux choisi s'affichent avant de tourner la manivelle.

### Fusion
- Un modèle tiré pour la première fois est débloqué au niveau 1, avec l'annonce « Nouveau ! ».
- Un doublon est **fusionné automatiquement** : le modèle gagne 1 niveau.
- Niveau maximum : 10. Un modèle niveau 10 **reste toujours dans la collection** et reste disponible pour composer l'équipe ; on peut en posséder autant qu'on veut.
- Un doublon d'un modèle déjà au niveau 10 ne peut plus rien améliorer : seul ce doublon est repris par la Corp contre **25 crédits**, « à prix d'ami (pour elle) ». Le modèle n'est pas touché.
- C'est le **seul** moyen d'améliorer un modèle de Jimee.

### Équilibre rareté / niveau
Principe : un commun bien monté doit pouvoir rivaliser avec un légendaire tout juste obtenu, pour que le farm soit récompensé et que les planètes restent faisables ; mais un légendaire doit vite passer devant dès qu'on l'améliore, pour qu'on ait envie de le monter.

Pour cela, la puissance de base (vie et dégâts) **et** le gain par niveau dépendent de la rareté. Puissance au niveau n : `base × (1 + gain × (n − 1))`.

| Rareté | Puissance de base | Gain par niveau | Niveau 1 | Niveau 2 | Niveau 10 |
|---|---|---|---|---|---|
| Commun | 100 | +10 % | 100 | 110 | 190 |
| Rare | 125 | +15 % | 125 | 144 | 294 |
| Épique | 150 | +22 % | 150 | 183 | 447 |
| Légendaire | 180 | +35 % | 180 | 243 | 747 |

- Un commun niveau 10 (190) est légèrement plus fort qu'un légendaire niveau 1 (180).
- Un légendaire niveau 2 (243) passe nettement devant un commun niveau 10.
- La « puissance » est un indice moyen : chaque modèle répartit ensuite sa puissance entre vie, dégâts, vitesse et portée selon son rôle (un Costaud a plus de vie, un Sprinteur plus de vitesse).
- Les planètes sont réglées pour être faisables avec une équipe de communs bien montés et un peu de farm ; les modèles rares font avancer plus vite.

### Fusée
Quatre améliorations, achetées en crédits, niveaux 1 à 10. Coût pour passer du niveau n au niveau n + 1 : `80 × 1,5^(n − 1)`, arrondi à la dizaine.

| Amélioration | Effet par niveau |
|---|---|
| Vitesse de chargement | +0,15 point par seconde |
| Capacité de chargement | +2 points maximum |
| Tourelle | +15 % de dégâts |
| Canon | +15 % de dégâts et −1,5 s de recharge |

### Difficulté
- Les planètes 1 à 4 et 6 à 9 s'enchaînent avec peu de farm.
- Les planètes 5 et 10 (boss) sont des **murs** volontaires qui demandent de farmer.
- Les valeurs d'équilibrage exactes (vie des bases, force des vagues) sont dans les données de planète et seront ajustées en jouant.

## 6. Contenu de la première version

### Modèles de Jimees (8)
Tous partagent l'apparence de base ; chaque modèle a sa couleur de ceinture et un accessoire.

| Modèle | Rareté | Rôle | Capacité |
|---|---|---|---|
| Standard | Commun | Corps à corps, pas cher | — |
| Lanceur | Commun | Distance, jette des boulons | — |
| Costaud | Rare | Corps à corps, lent, beaucoup de vie | — |
| Sprinteur | Rare | Corps à corps, rapide, fragile | — |
| Kamikaze | Épique | Corps à corps | Explose à sa mort, dégâts de zone |
| Infirmier | Épique | Soutien, faible attaque | Soigne périodiquement les Jimees proches |
| Blindé | Légendaire | Corps à corps | Bouclier qui absorbe une quantité de dégâts |
| Prototype « Nouveau ! » | Légendaire | Distance, cher | Tir à dégâts de zone |

### Ennemis
- **Blob** : rapide, faible.
- **Cracheur** : attaque à distance.
- **Carapace** : lente, très résistante.
- **Employé de Jimmy's Inc.** : planètes 5 et 10 uniquement, reconnaissable à sa casquette.
- **Boss** : un par planète boss (planètes 5 et 10), plus gros et plus fort.

Les créatures locales changent de couleurs selon la planète.

### Planètes (10)
Une galaxie de 10 planètes, chacune avec son décor et sa palette (désert, glace, jungle, volcan…), la liste des ennemis qui y apparaissent, la vie de la base et le rythme des vagues.

### Humour de la Corp
- Répliques du représentant au guichet et au bilan (plusieurs par situation, tirées au hasard ; réplique différente selon victoire ou défaite).
- Affiche « Promo du deuil » au bilan, avec le nombre de Jimees perdus pendant la bataille.
- Annonce « Nouveau ! » au premier tirage d'un modèle.
- Les textes d'humour ne remplacent jamais un chiffre : prix et probabilités restent visibles.

### Hors périmètre de la première version
Mémorial, *Le Jimee illustré*, album des apparences, coupons de deuil et « cousins », reprise d'équipement, boutique de provisions, objets rares, galaxies supplémentaires, pouvoirs supplémentaires, sons et musique, mode paysage. Tous pourront être ajoutés plus tard sans changer l'architecture.

## 7. Architecture technique

- **Langage et outils** : TypeScript, Vite, sans moteur de jeu. Canvas 2D pour la bataille, HTML/CSS pour les écrans.
- **PWA** : manifeste et service worker (via `vite-plugin-pwa`), installable, jouable hors ligne, plein écran, verrouillé en portrait dans le manifeste.

### Blocs
| Bloc | Rôle | Dépend de |
|---|---|---|
| `data/` | Définitions des Jimees, ennemis, planètes, améliorations de la fusée, répliques de la Corp, paramètres d'économie | rien |
| `economy/` | Fonctions pures : probabilités avec cristaux, tirage, fusion, gains de bataille, coûts d'amélioration, effets des améliorations | `data/` |
| `battle/sim` | Simulation du combat, pas à pas avec un temps fixe : unités, ciblage, attaques, capacités, vagues, tourelle, canon, fin de partie. Aucun accès au DOM ni au canvas. | `data/` |
| `battle/render` | Dessin du terrain, des unités et des effets dans le canvas à partir de l'état de la simulation ; caméra | `battle/sim` (lecture seule) |
| `battle/controls` | Barre de commande : jauge, boutons, canon ; transmet les ordres à la simulation | `battle/sim` |
| `screens/` | Guichet, carte, préparation, bilan, distributeur, fusée | `economy/`, `save/` |
| `save/` | Lecture et écriture de la progression | rien |
| `art/` | Dessin des Jimees, créatures, fusée, bases et représentant (formes vectorielles dessinées en code) | rien |

- La simulation reçoit une graine de hasard, ce qui rend une bataille reproductible pour les tests.
- Le hasard du distributeur passe aussi par une fonction injectable, pour tester les probabilités.

### Sauvegarde
- Stockée dans le `localStorage` du téléphone, sous une seule clé, avec un champ `version`.
- Contenu : planète la plus avancée, planètes conquises, crédits, cristaux, modèles possédés et leurs niveaux, composition de l'équipe, niveaux de la fusée.
- Sauvegarde après chaque bilan, tirage et achat.
- Un changement de format se fait par une fonction de migration d'une version à la suivante.

### Gestion des erreurs
- **Sauvegarde illisible** : message du représentant et proposition de repartir de zéro (la sauvegarde illisible n'est effacée qu'après confirmation).
- **Stockage indisponible** (navigation privée, stockage bloqué) : le jeu reste jouable, avec un avertissement que la progression ne sera pas conservée.
- Toutes les lectures et écritures du stockage sont protégées contre les exceptions.

## 8. Tests

- **Vitest**, lancé en local et dans la GitHub Action.
- **Économie** : probabilités pour 0 à 3 cristaux (somme à 100 %), répartition des tirages sur un grand échantillon avec graine fixe, fusion et plafond au niveau 10, reprise à 25 crédits sans retirer le modèle de la collection, courbe de puissance par rareté (valeurs du tableau de la section 5), gains en première conquête, en farm (×0,4) et en défaite, coûts d'amélioration.
- **Simulation** : déplacement et arrêt à portée, dégâts, mort, chaque capacité, tourelle, canon et recharge, coût en chargement, conditions de victoire et de défaite.
- **Sauvegarde** : aller-retour, sauvegarde illisible, stockage indisponible, migration.
- Le rendu et les écrans sont vérifiés en jouant sur téléphone.

## 9. Mise en ligne

- **GitHub Pages**, adresse `https://lucasboul-dev.github.io/jeux-rapide/` (chemin de base Vite : `/jeux-rapide/`).
- Une GitHub Action, à chaque push sur `main` : installation, tests, build, puis publication sur Pages. Si les tests échouent, rien n'est publié et l'ancienne version reste en ligne.
- Activation unique à faire par Lucas : dans les réglages du repo, section Pages, choisir « GitHub Actions » comme source.
