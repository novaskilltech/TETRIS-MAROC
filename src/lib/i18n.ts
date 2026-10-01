export type Language = 'fr' | 'en';

export interface Translations {
  gameTitle: string;
  gameSubtitle: string;
  play: string;
  pause: string;
  resume: string;
  restart: string;
  quit: string;
  score: string;
  highScore: string;
  lines: string;
  level: string;
  nextPiece: string;
  gameOver: string;
  finalScore: string;
  linesCleared: string;
  pseudoLabel: string;
  pseudoPlaceholder: string;
  submitScore: string;
  submitting: string;
  scoreSubmitted: string;
  leaderboard: string;
  rank: string;
  player: string;
  date: string;
  close: string;
  soundOn: string;
  soundOff: string;
  controlsTitle: string;
  controlsKeyboard: string;
  controlsTouch: string;
  moveLeftRight: string;
  rotate: string;
  softDrop: string;
  hardDrop: string;
  instantDrop: string;
  howToPlay: string;
  arcadeBadge: string;
  pseudoInvalid: string;
  errorSubmitting: string;
  yourRank: string;
  noScoresYet: string;
  languageName: string;
  newHighScore: string;
  themeTitle: string;
  themeMaroc: string;
  themeGalaxy: string;
  themeBeach: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  fr: {
    gameTitle: 'TÉTRIS 3D MAROC',
    gameSubtitle: 'Arcade Traditionnelle & Rendu 3D',
    play: 'JOUER',
    pause: 'PAUSE',
    resume: 'REPRENDRE',
    restart: 'RECOMMENCER',
    quit: 'MENU PRINCIPAL',
    score: 'SCORE',
    highScore: 'MEILLEUR SCORE',
    lines: 'LIGNES',
    level: 'NIVEAU',
    nextPiece: 'SUIVANTE',
    gameOver: 'PARTIE TERMINÉE',
    finalScore: 'SCORE FINAL',
    linesCleared: 'LIGNES COMPLÉTÉES',
    pseudoLabel: 'ENTREZ VOTRE PSEUDO (ARCADE)',
    pseudoPlaceholder: 'EX: ATLAS_77',
    submitScore: 'ENREGISTRER MON SCORE',
    submitting: 'ENVOI EN COURS...',
    scoreSubmitted: 'SCORE ENREGISTRÉ !',
    leaderboard: 'CLASSEMENT MONDIAL',
    rank: 'RANG',
    player: 'JOUEUR',
    date: 'DATE',
    close: 'FERMER',
    soundOn: 'SON ACTIVÉ',
    soundOff: 'SON COUPÉ',
    controlsTitle: 'COMMANDES',
    controlsKeyboard: 'Clavier PC : Flèches pour bouger/tourner, Espace pour chute instantanée, P ou Échap pour pause.',
    controlsTouch: 'Tactile : Glisser gauche/droite, Tap pour tourner, Bouton Chute pour drop instantané.',
    moveLeftRight: 'Déplacer',
    rotate: 'Rotation',
    softDrop: 'Descente',
    hardDrop: 'Chute instantanée',
    instantDrop: 'CHUTE',
    howToPlay: 'COMMENT JOUER',
    arcadeBadge: 'ÉDITION ROYALE 3D',
    pseudoInvalid: 'Pseudo invalide (3 à 12 caractères alphanumériques)',
    errorSubmitting: 'Erreur lors de l\'enregistrement du score',
    yourRank: 'Votre classement actuel',
    noScoresYet: 'Aucun score enregistré pour l\'instant.',
    languageName: 'Français',
    newHighScore: 'NOUVEAU RECORD PERSONNEL !',
    themeTitle: 'THÈME',
    themeMaroc: 'Maroc Impérial',
    themeGalaxy: 'Galaxie Lunaire',
    themeBeach: 'Plage Tropicale',
  },
  en: {
    gameTitle: 'TETRIS 3D MOROCCO',
    gameSubtitle: 'Traditional Arcade with 3D Visuals',
    play: 'PLAY',
    pause: 'PAUSE',
    resume: 'RESUME',
    restart: 'RESTART',
    quit: 'MAIN MENU',
    score: 'SCORE',
    highScore: 'HIGH SCORE',
    lines: 'LINES',
    level: 'LEVEL',
    nextPiece: 'NEXT',
    gameOver: 'GAME OVER',
    finalScore: 'FINAL SCORE',
    linesCleared: 'LINES CLEARED',
    pseudoLabel: 'ENTER YOUR NICKNAME (ARCADE)',
    pseudoPlaceholder: 'EX: ATLAS_77',
    submitScore: 'SUBMIT MY SCORE',
    submitting: 'SUBMITTING...',
    scoreSubmitted: 'SCORE SAVED!',
    leaderboard: 'GLOBAL LEADERBOARD',
    rank: 'RANK',
    player: 'PLAYER',
    date: 'DATE',
    close: 'CLOSE',
    soundOn: 'SOUND ON',
    soundOff: 'SOUND MUTED',
    controlsTitle: 'CONTROLS',
    controlsKeyboard: 'Keyboard: Arrow keys to move/rotate, Spacebar for Hard Drop, P or Esc for Pause.',
    controlsTouch: 'Touchscreen: Swipe left/right, Tap to rotate, Drop button for Hard Drop.',
    moveLeftRight: 'Move',
    rotate: 'Rotate',
    softDrop: 'Soft Drop',
    hardDrop: 'Hard Drop',
    instantDrop: 'DROP',
    howToPlay: 'HOW TO PLAY',
    arcadeBadge: 'ROYAL 3D EDITION',
    pseudoInvalid: 'Invalid nickname (3 to 12 alphanumeric characters)',
    errorSubmitting: 'Error submitting score',
    yourRank: 'Your current rank',
    noScoresYet: 'No scores recorded yet.',
    languageName: 'English',
    newHighScore: 'NEW PERSONAL RECORD!',
    themeTitle: 'THEME',
    themeMaroc: 'Imperial Morocco',
    themeGalaxy: 'Lunar Galaxy',
    themeBeach: 'Tropical Beach',
  },
};
