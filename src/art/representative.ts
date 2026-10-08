/**
 * Le représentant de la Corp, d'après l'univers : grand, chauve, gros nez,
 * cravate rouge, mains dans les poches, toujours souriant.
 */
export function representativeSvg(): string {
  return `
<svg class="representative" viewBox="0 0 120 220" role="img" aria-label="Le représentant de la Corp">
  <g stroke="#1d2340" stroke-width="2.5" stroke-linejoin="round">
    <!-- Jambes et chaussures -->
    <rect x="44" y="150" width="14" height="56" fill="#2f3550"/>
    <rect x="62" y="150" width="14" height="56" fill="#2f3550"/>
    <ellipse cx="49" cy="208" rx="13" ry="6" fill="#1d2340"/>
    <ellipse cx="73" cy="208" rx="13" ry="6" fill="#1d2340"/>
    <!-- Veste, bras le long du corps, mains dans les poches -->
    <path d="M34 82 Q60 70 86 82 L90 158 L30 158 Z" fill="#3a4378"/>
    <path d="M34 84 Q24 120 32 148 L42 148 Q38 118 44 92 Z" fill="#3a4378"/>
    <path d="M86 84 Q96 120 88 148 L78 148 Q82 118 76 92 Z" fill="#3a4378"/>
    <rect x="31" y="140" width="13" height="10" rx="2" fill="#2a3260"/>
    <rect x="76" y="140" width="13" height="10" rx="2" fill="#2a3260"/>
    <!-- Chemise et cravate rouge -->
    <path d="M50 76 L60 98 L70 76 Z" fill="#f4f1e8"/>
    <path d="M57 82 L63 82 L66 126 L60 134 L54 126 Z" fill="#e4572e"/>
    <!-- Tête chauve -->
    <ellipse cx="60" cy="46" rx="22" ry="27" fill="#f0c9a0"/>
    <ellipse cx="38" cy="48" rx="4" ry="7" fill="#f0c9a0"/>
    <ellipse cx="82" cy="48" rx="4" ry="7" fill="#f0c9a0"/>
    <!-- Gros nez -->
    <ellipse cx="62" cy="52" rx="9" ry="8" fill="#e8a882"/>
  </g>
  <!-- Yeux plissés et grand sourire -->
  <path d="M48 40 q4 -4 8 0" stroke="#1d2340" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M66 40 q4 -4 8 0" stroke="#1d2340" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M46 62 q14 14 30 0" stroke="#1d2340" stroke-width="3" fill="#fff" stroke-linecap="round"/>
  <ellipse cx="52" cy="26" rx="8" ry="4" fill="#fff" opacity="0.45"/>
</svg>`;
}
