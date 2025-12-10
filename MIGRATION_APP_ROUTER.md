# Migration vers App Router (Next.js 16)

## Changements effectués

### Structure des dossiers

**Avant (Pages Router) :**
```
pages/
  ├── _app.js
  ├── index.js
  └── homePage.js
```

**Après (App Router) :**
```
app/
  ├── layout.js      (remplace _app.js)
  └── page.js        (page d'accueil)

components/
  └── HomePage.js    (homePage.js déplacé ici)
```

### Fichiers modifiés

1. **app/layout.js** - Nouveau layout racine avec metadata
2. **app/page.js** - Nouvelle page d'accueil
3. **components/HomePage.js** - Ancien homePage.js avec 'use client'

### Composants marqués 'use client'

Les composants suivants utilisent des hooks React et ont été marqués avec `'use client'` :

- `components/HomePage.js`
- `components/Planet.js`
- `components/Moon.js`
- `components/Asteroid.js`
- `components/Sun.js`
- `components/SagittarusA.js`
- `components/Informations.js`
- `components/MilkyWay.js`
- `components/utils/CursorFollower.js`

### Ancien dossier pages

Le dossier `pages/` a été renommé en `pages_old/` pour référence. Vous pouvez le supprimer après avoir vérifié que tout fonctionne :

```bash
rm -rf pages_old
```

## Avantages de la migration

✅ **Server Components par défaut** - Meilleure performance
✅ **Streaming et Suspense** - Chargement progressif
✅ **Layouts imbriqués** - Meilleure organisation
✅ **Bundling optimisé** - Bundle plus petit
✅ **Conforme Next.js 16** - Utilise les dernières pratiques

## Commandes

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

## Notes

- Le build a été testé avec succès ✓
- Tous les composants clients sont correctement marqués
- Les imports CSS Modules fonctionnent correctement
- Structure compatible avec les futures évolutions de Next.js
