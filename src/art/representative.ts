/**
 * Le fonctionnaire de la Jimee's Corp, d'après la planche de Lucas :
 * grand, maigre, chauve, gros nez tombant, yeux mi-clos cernés, air blasé ;
 * uniforme gris-bleu à col montant, boutons, médailles, badge à pince ;
 * une main dans la poche, l'autre bras robotique avec un écran au poignet.
 */

const INK = '#2a2a33';
const SKIN = '#f3ece0';
const UNIFORM = '#7d8e9e';
const UNIFORM_DARK = '#647585';
const METAL = '#b9c0c8';
const HOLO = '#9fe3f0';

/** Tête de profil trois-quarts, regard vers la droite. (cx, cy) = centre du crâne. */
function head(cx: number, cy: number, opts: { cigar?: boolean } = {}): string {
  return `
  <g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="${cx - 15}" cy="${cy + 6}" rx="4.5" ry="7" fill="${SKIN}"/>
    <path d="M${cx - 15} ${cy + 2} Q${cx - 18} ${cy - 30} ${cx + 2} ${cy - 30} Q${cx + 20} ${cy - 30} ${cx + 18} ${cy}
             L${cx + 17} ${cy + 22} Q${cx + 12} ${cy + 34} ${cx} ${cy + 34} Q${cx - 13} ${cy + 33} ${cx - 15} ${cy + 18} Z" fill="${SKIN}"/>
    <!-- Paupières lourdes, yeux mi-clos -->
    <path d="M${cx - 2} ${cy + 3} Q${cx + 3} ${cy - 1} ${cx + 8} ${cy + 3}" fill="none"/>
    <path d="M${cx + 11} ${cy + 3} Q${cx + 15} ${cy - 1} ${cx + 19} ${cy + 3}" fill="none"/>
    <path d="M${cx} ${cy + 4} Q${cx + 4} ${cy + 6} ${cx + 7} ${cy + 4}" fill="${INK}" stroke-width="1.6"/>
    <path d="M${cx + 12} ${cy + 4} Q${cx + 15} ${cy + 6} ${cx + 18} ${cy + 4}" fill="${INK}" stroke-width="1.6"/>
    <!-- Cernes -->
    <path d="M${cx - 1} ${cy + 9} Q${cx + 4} ${cy + 11} ${cx + 8} ${cy + 8}" fill="none" stroke-width="1.3"/>
    <path d="M${cx + 12} ${cy + 9} Q${cx + 15} ${cy + 11} ${cx + 19} ${cy + 8}" fill="none" stroke-width="1.3"/>
    <!-- Sourcils las -->
    <path d="M${cx - 2} ${cy - 3} L${cx + 8} ${cy - 2}" fill="none" stroke-width="2"/>
    <path d="M${cx + 12} ${cy - 2} L${cx + 20} ${cy - 4}" fill="none" stroke-width="2"/>
    <!-- Gros nez tombant -->
    <path d="M${cx + 10} ${cy + 6} Q${cx + 12} ${cy + 14} ${cx + 22} ${cy + 20} Q${cx + 27} ${cy + 25} ${cx + 19} ${cy + 26}
             Q${cx + 14} ${cy + 26} ${cx + 12} ${cy + 22}" fill="${SKIN}"/>
    <!-- Bouche un peu tombante -->
    <path d="M${cx + 4} ${cy + 29} Q${cx + 9} ${cy + 27} ${cx + 15} ${cy + 30}" fill="none" stroke-width="1.8"/>
  </g>
  ${
    opts.cigar
      ? `<g stroke="${INK}" stroke-width="1.8" stroke-linecap="round">
          <path d="M${cx + 14} ${cy + 29} L${cx + 36} ${cy + 33}" stroke-width="5.5"/>
          <path d="M${cx + 14} ${cy + 29} L${cx + 36} ${cy + 33}" stroke="#a9744a" stroke-width="2.6"/>
          <path d="M${cx + 33} ${cy + 32.5} L${cx + 36} ${cy + 33}" stroke="#e4572e" stroke-width="2.6"/>
          <path d="M${cx + 38} ${cy + 28} q4 -6 0 -10 q-4 -5 1 -11" fill="none" stroke="#9aa3ad" stroke-width="1.3"/>
        </g>`
      : ''
  }`;
}

/** Badge à pince, médailles et boutons sur la veste. */
function chestDetails(x: number, y: number): string {
  return `
  <g stroke="${INK}" stroke-width="1.4">
    <circle cx="${x}" cy="${y}" r="2" fill="${METAL}"/>
    <circle cx="${x + 6}" cy="${y + 2}" r="2" fill="${METAL}"/>
    <circle cx="${x + 1}" cy="${y + 7}" r="2" fill="${METAL}"/>
    <circle cx="${x + 2}" cy="${y + 14}" r="2" fill="${METAL}"/>
    <rect x="${x + 11}" y="${y - 3}" width="12" height="4" fill="#d6c48a"/>
    <path d="M${x + 20} ${y + 4} L${x + 20} ${y + 9}" />
    <rect x="${x + 13}" y="${y + 9}" width="14" height="18" rx="1.5" fill="#f7f4ec"/>
    <rect x="${x + 16}" y="${y + 12}" width="8" height="6" fill="#c9ced6" stroke-width="1"/>
    <path d="M${x + 15.5} ${y + 21} L${x + 24.5} ${y + 21} M${x + 15.5} ${y + 24} L${x + 22} ${y + 24}" stroke-width="1"/>
  </g>`;
}

/** Avant-bras robotique avec écran au poignet et main mécanique. */
function robotArm(x: number, y: number, angle: number, holding = ''): string {
  return `
  <g transform="translate(${x} ${y}) rotate(${angle})" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round">
    <rect x="-3.5" y="0" width="7" height="26" rx="2.5" fill="${METAL}"/>
    <path d="M-3.5 9 L3.5 9 M-3.5 17 L3.5 17" stroke-width="1"/>
    <rect x="-5.5" y="12" width="11" height="8" rx="1.5" fill="#3b4652"/>
    <rect x="-4" y="13.3" width="8" height="5.4" rx="1" fill="${HOLO}" stroke="none"/>
    <circle cx="0" cy="28" r="3.2" fill="${METAL}"/>
    <path d="M-3 30 L-5 38 M-1 31 L-1.5 40 M1.5 31 L2 40 M3.5 30 L6 37" stroke-width="2.2"/>
    ${holding}
  </g>`;
}

/** Debout, une main dans la poche, le bras robotique ballant. Pour le guichet. */
export function functionaryStanding(): string {
  return `
<svg class="functionary" viewBox="0 0 120 250" role="img" aria-label="Le fonctionnaire de la Corp">
  <g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Jambes et chaussures -->
    <path d="M42 150 L40 232 L56 232 L60 160 L64 232 L80 232 L78 150 Z" fill="${UNIFORM_DARK}"/>
    <path d="M38 232 Q36 242 56 242 L58 232 Z" fill="#3a3f47"/>
    <path d="M64 232 L64 242 Q84 243 82 232 Z" fill="#3a3f47"/>
    <!-- Bras gauche, main dans la poche -->
    <path d="M36 84 Q24 110 30 146 L42 146 Q38 116 46 92 Z" fill="${UNIFORM}"/>
    <!-- Veste à col montant, croisée -->
    <path d="M40 78 Q60 70 82 78 L86 160 L36 160 Z" fill="${UNIFORM}"/>
    <path d="M52 76 L54 64 L70 64 L72 76 Z" fill="${UNIFORM}"/>
    <path d="M64 80 L68 158" fill="none" stroke-width="1.6"/>
    <!-- Manche droite jusqu'au coude -->
    <path d="M80 82 Q92 96 92 118 L82 120 Q82 102 74 90 Z" fill="${UNIFORM}"/>
  </g>
  ${chestDetails(46, 96)}
  ${robotArm(87, 118, -6)}
  ${head(62, 40)}
</svg>`;
}

/** Assis au bureau, tamponnant un formulaire holographique devant un client alien. Pour le bilan et le distributeur. */
export function functionaryDesk(): string {
  return `
<svg class="functionary-desk" viewBox="0 0 220 150" role="img" aria-label="Le fonctionnaire tamponne un formulaire">
  <!-- Client alien qui patiente -->
  <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M178 104 Q172 70 190 66 Q208 64 206 104 Z" fill="#a8c98a"/>
    <path d="M186 66 L183 56 M196 65 L199 55" fill="none"/>
    <circle cx="183" cy="55" r="2.6" fill="#a8c98a"/>
    <circle cx="199" cy="54" r="2.6" fill="#a8c98a"/>
    <ellipse cx="186" cy="80" rx="4" ry="3" fill="#fff"/>
    <ellipse cx="197" cy="80" rx="4" ry="3" fill="#fff"/>
    <path d="M182 79 L190 79 M193 79 L201 79" stroke-width="2.6"/>
    <path d="M187 92 Q192 89 197 92" fill="none" stroke-width="1.6"/>
  </g>
  <!-- Fonctionnaire assis -->
  <g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M40 70 Q36 60 50 58 L58 58 Q72 60 70 70 L72 104 L38 104 Z" fill="#cfd3c8"/>
    <path d="M44 66 Q60 58 76 66 L80 104 L40 104 Z" fill="${UNIFORM}"/>
    <path d="M54 64 L55 56 L67 56 L68 64 Z" fill="${UNIFORM}"/>
    <path d="M74 70 Q90 74 98 86 L92 92 Q84 82 72 80 Z" fill="${UNIFORM}"/>
  </g>
  <g stroke="${INK}" stroke-width="1.2">
    <circle cx="51" cy="74" r="1.6" fill="${METAL}"/><circle cx="52" cy="80" r="1.6" fill="${METAL}"/>
    <rect x="58" y="76" width="9" height="12" rx="1" fill="#f7f4ec"/>
  </g>
  <!-- Bras robotique qui lève le tampon -->
  <g transform="translate(96 88) rotate(-120)" stroke="${INK}" stroke-width="1.6">
    <rect x="-3" y="0" width="6" height="18" rx="2" fill="${METAL}"/>
    <rect x="-4.5" y="7" width="9" height="6" rx="1" fill="#3b4652"/>
    <rect x="-3.3" y="8" width="6.6" height="4" fill="${HOLO}" stroke="none"/>
  </g>
  <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <rect x="103" y="62" width="8" height="12" rx="2" fill="#6b4a2f"/>
    <rect x="99" y="73" width="16" height="6" rx="1.5" fill="#3a3f47"/>
  </g>
  <path d="M120 64 q3 -3 6 0 M118 58 q3 -3 6 0" stroke="${INK}" stroke-width="1.4" fill="none"/>
  ${head(58, 32)}
  <!-- Formulaire holographique -->
  <path d="M96 96 L138 82 L152 104 L108 118 Z" fill="${HOLO}" fill-opacity="0.45" stroke="#4fb8cc" stroke-width="1.6"/>
  <path d="M106 100 L134 91 M109 106 L140 96 M112 111 L130 105" stroke="#4fb8cc" stroke-width="1.3"/>
  <!-- Bureau -->
  <path d="M10 104 L214 104 L214 112 L10 112 Z" fill="#e7dcc4" stroke="${INK}" stroke-width="2.2"/>
  <path d="M18 112 L18 146 M206 112 L206 146" stroke="${INK}" stroke-width="2.2"/>
</svg>`;
}

/** Gros plan perplexe, cigare au bec, une pile de dossiers en tête. Pour les erreurs. */
export function functionaryCloseup(): string {
  return `
<svg class="functionary-closeup" viewBox="0 0 160 130" role="img" aria-label="Le fonctionnaire, perplexe">
  <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">
    <path d="M70 34 Q60 10 84 8 Q96 -2 110 6 Q132 2 136 18 Q152 24 142 38 Q138 50 118 46 Q104 54 92 46 Q72 50 70 34 Z" fill="#fff"/>
    <circle cx="64" cy="50" r="3.5" fill="#fff"/>
    <circle cx="58" cy="58" r="2.2" fill="#fff"/>
    <g stroke="#4fb8cc" stroke-width="1.3" fill="${HOLO}" fill-opacity="0.6">
      <path d="M88 36 L110 32 L116 36 L94 40 Z"/>
      <path d="M88 31 L110 27 L116 31 L94 35 Z"/>
      <path d="M88 26 L110 22 L116 26 L94 30 Z"/>
      <path d="M88 21 L110 17 L116 21 L94 25 Z"/>
    </g>
  </g>
  <text x="122" y="40" font-family="system-ui, sans-serif" font-weight="900" font-size="26" fill="${INK}">?</text>
  <path d="M14 130 Q20 108 46 106 L70 106 Q94 108 100 130 Z" fill="${UNIFORM}" stroke="${INK}" stroke-width="2.2"/>
  <path d="M44 106 L46 96 L68 96 L70 106" fill="${UNIFORM}" stroke="${INK}" stroke-width="2.2"/>
  ${head(55, 64, { cigar: true })}
</svg>`;
}

/** Petite icône de cristaux, comme ceux qui dépassent de sa poche. */
export function crystalIcon(): string {
  return `<svg class="crystal-icon" viewBox="0 0 20 20" aria-hidden="true">
  <g stroke="#2a2a33" stroke-width="1.2" stroke-linejoin="round">
    <path d="M6 18 L3 9 L6 3 L9 9 Z" fill="#b9e8f2"/>
    <path d="M11 18 L9 7 L12 1 L15 7 Z" fill="${HOLO}"/>
    <path d="M15 18 L14 11 L16.5 7.5 L18.5 11 Z" fill="#c9b8ff"/>
  </g>
</svg>`;
}

/** Ancien nom, conservé pour les écrans qui l'appellent encore. */
export const representativeSvg = functionaryStanding;
