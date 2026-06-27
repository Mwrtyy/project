# Shahine — Ultra Premium Video Editor Portfolio

Portfolio audiovisuel dark luxury / underground creative pour Shahine.

## Lancer en local

Sans installation :

```bash
python -m http.server 5500
```

Puis ouvrir :

```text
http://localhost:5500
```

Avec Vite :

```bash
npm install
npm run dev
```

## Déployer sur GitHub Pages

1. Remplace les anciens fichiers du repo par ceux de ce dossier.
2. Push sur `main`.
3. GitHub > Settings > Pages.
4. Source : Deploy from a branch.
5. Branch : `main`, Folder : `/ root`, Save.

## Structure

- `src/core` : performance, boucle rAF, router.
- `src/data` : contenu centralisé.
- `src/components` : rendu des vues.
- `src/effects` : curseur, particules, interactions, reveal.
- `src/three` : téléphone 3D WebGL + fallback.
- `styles` : CSS découpé par responsabilités.

## Performance

- Animations en `transform` et `opacity`.
- Boucle unique `requestAnimationFrame`.
- Pixel ratio WebGL plafonné à `Math.min(window.devicePixelRatio, 1.5)`.
- `prefers-reduced-motion` respecté.
- Curseur custom désactivé sur tactile.
- WebGL fallback si Three.js/WebGL échoue.
