# Shahine — Ultra Premium Video Editor Portfolio

Portfolio audiovisuel haut de gamme pour **Shahine**, monteur vidéo spécialisé en TikTok edits, cinematic cuts, beat sync, transitions, color grading, motion design et contenu social media.

Cette version applique le rapport de recherche : typographie forte, composition plus respirante, micro-interactions utiles, esthétique dark luxury / chrome / liquid glass, performance avant effets gratuits, et un téléphone 3D stable visible dès le hero.

## Fonctionnalités

- Site compatible GitHub Pages
- Hero premium sombre avec fond animé, particules discrètes, grille subtile et reflets chrome
- Téléphone CSS 3D réaliste, visible et stable, sans logo de marque
- Châssis métallique, bords arrondis, Dynamic Island, boutons latéraux, écran OLED et reflet de verre
- Interface mobile intégrée dans l'écran du téléphone
- Sections : Home, Edits, Skills, Contact
- Navigation externe + navigation interne dans le téléphone
- Swipe horizontal dans l'écran du téléphone
- Curseur desktop liquid glass avec interpolation `requestAnimationFrame`
- Mode performance automatique sur mobile/appareils faibles
- Respect de `prefers-reduced-motion`
- Animations principalement en `transform` et `opacity`
- Aucune dépendance obligatoire pour le rendu public

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
│   └── main.js
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

URL attendue :

```text
https://mwrtyy.github.io/project/
```

## Performance

- Particules limitées selon l'appareil
- Curseur custom désactivé sur mobile/tactile
- Effets de fond réduits en mode performance
- Animations souris en `requestAnimationFrame`
- Pas de modèle 3D lourd à télécharger
- Pas de post-processing WebGL coûteux
- Interface fluide avec transitions transform/opacity

## Personnalisation rapide

- Modifie les textes dans `index.html`.
- Remplace les liens TikTok, Instagram et email dans la section Contact.
- Ajoute des images ou vidéos optimisées dans `assets/images/` ou `assets/videos/`.
- Pour de vraies miniatures, remplace les placeholders `.thumb` par des images compressées WebP/AVIF.