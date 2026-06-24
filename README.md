# Shahine — Ultra Premium Video Editor Portfolio

Portfolio audiovisuel haut de gamme pour **Shahine**, monteur vidéo spécialisé en TikTok edits, cinematic edits, beat sync, transitions, color grading, motion design et contenu social media.

Le projet est pensé comme une vitrine digitale immersive : dark luxury, chrome, liquid glass, fond interactif, curseur custom et téléphone 3D procédural en Three.js.

## Fonctionnalités

- Expérience compatible GitHub Pages
- Structure modulaire propre en `src/` et `styles/`
- Téléphone 3D généré en Three.js, sans logo visible et sans modèle lourd
- Châssis métallique, écran OLED, Dynamic Island, boutons latéraux, reflets et ombres
- Interface portfolio dessinée dynamiquement dans l'écran du téléphone
- Sections : Home, Edits, Skills, Contact
- Navigation externe + navigation dans l'écran par clic ou swipe
- Curseur desktop liquid glass optimisé avec interpolation fluide
- Spotlight, particules discrètes, grain cinématique et reflets chrome
- Mode performance automatique pour appareils faibles ou mobiles
- Respect de `prefers-reduced-motion`
- Fallback propre si WebGL n'est pas disponible

## Structure

```text
.
├── index.html
├── package.json
├── vite.config.js
├── styles/
│   ├── main.css
│   └── responsive.css
├── src/
│   ├── main.js
│   ├── scene.js
│   ├── phone.js
│   ├── cursor.js
│   ├── animations.js
│   ├── portfolioData.js
│   └── utils.js
└── assets/
    ├── models/
    ├── textures/
    ├── images/
    └── videos/
```

## Lancer en local

Option simple, sans installation :

```bash
python -m http.server 5500
```

Puis ouvre :

```text
http://localhost:5500
```

Option Vite :

```bash
npm install
npm run dev
```

## Déployer sur GitHub Pages

Le projet fonctionne directement depuis la racine du repo.

1. Va dans **Settings** du repository.
2. Ouvre **Pages**.
3. Dans **Build and deployment**, choisis **Deploy from a branch**.
4. Sélectionne la branche `main`.
5. Sélectionne le dossier `/ (root)`.
6. Clique sur **Save**.

L'URL sera normalement :

```text
https://mwrtyy.github.io/project/
```

## Performance

Le site applique automatiquement plusieurs optimisations :

- `requestAnimationFrame` pour les animations souris, particules et scène 3D
- `renderer.setPixelRatio()` limité selon l'appareil, maximum 1.75
- particules réduites sur mobile ou appareil faible
- curseur liquid glass désactivé sur tactile, mobile, appareils faibles et `prefers-reduced-motion`
- animations principalement en `transform` et `opacity`
- téléphone 3D procédural au lieu d'un modèle GLB lourd
- fallback si WebGL échoue

## Personnalisation

Les contenus principaux sont dans :

```text
src/portfolioData.js
```

Tu peux y changer :

- les statistiques ;
- les projets ;
- les skills ;
- les liens TikTok, Instagram et email.

Pour ajouter de vraies images ou vidéos, place-les dans `assets/images/` ou `assets/videos/`, puis adapte le rendu dans `src/phone.js`.