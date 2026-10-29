# Dar Idriss

Jeu mobile de fusion (merge-2) dans un riad marocain. Le joueur fusionne des objets, livre les commandes de la famille d'Idriss et gagne des étoiles pour rénover le riad.

Construit avec Phaser 3 (TypeScript) et Vite. Il sera emballé avec Capacitor pour Android et iOS.

## Lancer le jeu

```bash
npm install
npm run dev      # serveur local de développement
npm run build    # version de production dans dist/ (un seul fichier HTML)
```

## Organisation

- `src/data.ts` : chaînes de fusion, personnages, réglages (plateau, énergie)
- `src/state.ts` : sauvegarde, énergie, génération des commandes
- `src/art.ts` : tous les dessins du jeu, en SVG
- `src/sound.ts` : sons naturels (fontaine, oiseaux), sans musique
- `src/GameScene.ts` : plateau, fusion, commandes, interface
