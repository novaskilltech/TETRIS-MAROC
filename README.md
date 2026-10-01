# 🇲🇦 TÉTRIS 3D MAROC — Arcade Royale & Classement Mondial

> Jeu d'arcade de blocs inspiré du Tetris classique, modernisé avec un rendu 3D WebGL et une identité visuelle marocaine forte (rouge impérial #C1272D et vert émeraude #006233). Jouable instantanément sur le Web (mobile portrait prioritaire et PC), sans inscription, avec un classement mondial en ligne.

---

## 🎮 Fonctionnalités Clés

- **Gameplay 2D Pur & Rendu 3D WebGL :**
  - Grille standard 10 colonnes × 20 lignes.
  - Système de rotation SRS (Super Rotation System) avec wall kicks.
  - Sac de 7 pièces (7-bag randomizer) garantissant une distribution équitable.
  - Projection fantôme (Ghost Piece) indiquant l'atterrissage exact.
  - Blocs 3D biseautés aux reflets soignés, optimisés pour 60 FPS constants sur smartphone et desktop.
- **Identité Marocaine Élégante :**
  - Palette chromatique inspirée du drapeau marocain (rouge et vert).
  - Étoile chérifienne intégrée avec subtilité sans jamais nuire à la lisibilité de la grille.
  - Accessibilité daltonienne : textures, reliefs et contrastes lumineux spécifiques pour chaque type de pièce.
- **Audio Procédural (Web Audio API) :**
  - Zéro fichier audio externe lourd à télécharger.
  - Sons synthétisés en temps réel : déplacements, rotations, drops, fanfares d'élimination de lignes et montées de niveau.
  - Bouton Mute ON/OFF avec mémorisation locale.
- **Contrôles Ergonomiques :**
  - **Smartphone (Portrait prioritaire) :** Gestes tactiles directs (glisser gauche/droite, tap pour rotation, glisser vers le bas pour chute) + barre de boutons virtuels d'appoint avec retour haptique vibrant (`navigator.vibrate`).
  - **PC :** Flèches directionnelles, Espace (chute instantanée), Échap ou P (pause).
- **Compétition Mondiale & Anti-Triche :**
  - Aucun compte requis (expérience borne d'arcade).
  - Jeton de session signé cryptographiquement dès le lancement de la partie.
  - Validation serveur anti-triche : contrôle de plausibilité du score par rapport à la durée et au nombre de lignes.
  - Filtrage des pseudos (3 à 12 caractères alphanumériques + filtre anti-injures).
  - Classement Top 100 mondial public instantané.
- **Bilingue :** Français et Anglais commutables en un clic.

---

## 🛠️ Stack Technique

- **Framework :** [Next.js 14](https://nextjs.org/) (App Router)
- **Langage :** [TypeScript](https://www.typescriptlang.org/) (Mode strict)
- **Moteur 3D :** [Three.js](https://threejs.org/) (WebGL basse consommation)
- **Styling :** [Tailwind CSS](https://tailwindcss.com/)
- **Audio :** Web Audio API native
- **Tests :** Runner natif Node.js (`node:test`)

---

## 🚀 Installation & Lancement Local

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/novaskilltech/TETRIS-MAROC.git
   cd TETRIS-MAROC
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Lancer les tests unitaires :**
   ```bash
   npm test
   ```

4. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

5. **Compiler pour la production :**
   ```bash
   npm run build
   ```

---

## 🔒 Confidentialité & RGPD

- **Minimisation absolue :** Aucune collecte de nom, prénom, email, mot de passe ou coordonnée bancaire.
- **Leaderboard arcade :** Seuls le pseudo choisi après la partie, le score et la date sont enregistrés.
- **Sécurité :** Rate-limiting et sessions éphémères sans persistance de données sensibles.

---

## 📜 Licence

Projet développé avec passion par l'équipe **NOVA SQUAD**.
