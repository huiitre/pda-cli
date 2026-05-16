# Workflow de développement

## Première installation (une seule fois)

```bash
npm install
npm run build
npm link          # installe "pda" globalement en pointant vers ce dossier
```

## Développement quotidien

**Terminal 1** — watch (rebuild automatique à chaque sauvegarde) :
```bash
npm run dev
```

**Terminal 2** — tester la CLI :
```bash
pda --help
pda --version
pda -l
```

Chaque sauvegarde dans `src/` rebuild `dist/` automatiquement. Pas besoin de relancer quoi que ce soit.

## Tester sans builder (one-shot)

Pour tester rapidement une fonction sans passer par le build :
```bash
npm run test:cli -- --help
npm run test:cli -- -l
```

## Quitter le mode développement

Pour revenir à la version publiée sur npm :
```bash
npm unlink -g pda-cli
npm install -g pda-cli@latest
```

## Déployer une nouvelle version

Rien à faire manuellement. Il suffit de pusher sur `master` avec un commit conventionnel :

```
fix: description    →  patch  0.1.0 → 0.1.1
feat: description   →  minor  0.1.0 → 0.2.0
feat!: description  →  major  0.1.0 → 1.0.0
```

GitHub Actions s'occupe du build, de la publication npm et de la GitHub Release.

Les commits `chore:`, `docs:`, `refactor:`, `style:` ne déclenchent pas de release.
