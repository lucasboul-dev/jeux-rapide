import type { CorpLines } from './types';

/**
 * Répliques du représentant de la Corp : vendeur cynique, toujours poli.
 * Jamais de chiffre ici : les prix et pourcentages sont affichés à part.
 */
export const CORP_LINES: CorpLines = {
  counter: [
    'Bienvenue, capitaine ! Vos Jimees vous attendent. Enfin, ceux qui restent.',
    'La Corp vous remercie de votre fidélité. Elle remercie surtout votre portefeuille.',
    'Un Jimee perdu, c’est un client retrouvé. Nous adorons les clients.',
    'Nos capsules sont fraîches du jour. Les Jimees aussi, pour l’instant.',
    'Rappel amical : les Jimees ne sont ni repris, ni échangés, ni remboursés.',
    'Votre fusée a l’air en forme. Ce serait dommage qu’il lui arrive quelque chose.',
    'Chez la Corp, chaque malheur est une opportunité. La vôtre, la nôtre, surtout la nôtre.',
  ],
  victory: [
    'Magnifique victoire ! Les Jimees tombés au combat seront ravis. Enfin, l’auraient été.',
    'Planète conquise. La Corp prend note et vous félicite chaleureusement, sans engagement.',
    'Bravo, capitaine ! Vos pertes ont été parfaitement rentables.',
    'Un succès éclatant. Pensez à réinvestir vos gains, nous avons justement des capsules.',
    'Excellent travail. La direction n’en saura rien, mais elle serait fière.',
  ],
  defeat: [
    'Simple formalité, capitaine. Tout le monde perd une fusée de temps en temps.',
    'Quelle tristesse ! Mais rassurez-vous : la Corp, elle, ne perd jamais.',
    'Nos condoléances. Elles sont gratuites, profitez-en.',
    'Un revers, rien de plus. Nos capsules sont là pour vous remonter le moral.',
    'Les Jimees ont fait de leur mieux. Leur mieux n’était pas suffisant, voilà tout.',
  ],
  newModel: [
    'Nouveau ! Un modèle tout juste sorti de nos ateliers. Garantie : aucune.',
    'Félicitations, vous venez d’acquérir notre dernière innovation. Prenez-en soin, ou pas.',
    'Un nouveau collègue pour vos Jimees ! Ils ne feront pas connaissance très longtemps.',
    'Modèle inédit débloqué. Notre service marketing est déjà en train de rédiger son hommage.',
    'Nouveauté exclusive ! Exclusive à tous nos clients, mais exclusive quand même.',
  ],
  buyback: [
    'Ce doublon ne vous sert plus ? La Corp le reprend, à prix d’ami. D’ami à elle.',
    'Reprise effectuée. Ne demandez pas ce que nous en ferons : il sera reconditionné.',
    'Nous rachetons ce Jimee avec plaisir. Le plaisir est surtout pour nous.',
    'Doublon repris. Il partira vers une nouvelle vie, ou une autre fusée.',
    'Merci pour ce retour en parfait état. Il ne le restera pas longtemps.',
  ],
  mourningPosterTitles: [
    'Promo du deuil',
    'Offre hommage',
    'Soldes commémoratives',
    'Grande vente du souvenir',
    'Spécial regrets éternels',
  ],
};
