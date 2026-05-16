# CLAUDE.md — dtl_runpda

Documentation de référence complète du projet, rédigée avant le rewrite complet en TypeScript + DDD.
Ne pas supprimer ce fichier avant d'avoir migré toutes les informations dans le nouveau code.

---

## Présentation du projet

CLI Node.js installé globalement via npm (`npm install -g dtl_runpda`).
Commande d'entrée : `run`

**Contexte métier** : outil de développement interne pour l'équipe Distrilog qui travaille sur l'application mobile **EasyMobile** (package Android : `net.distrilog.easymobile`), déployée sur des PDA (CT45, CT60, EDA52, etc.) via **Apache Cordova**.

**Repo GitHub** : https://github.com/huiitre/run-pda-shell  
**Package npm** : `dtl_runpda`

---

## Architecture actuelle (JS, à remplacer)

```
index.js          — point d'entrée, orchestration principale
commands.js       — registre des commandes CLI (tableau d'objets)
functions.js      — logique applicative / affichage
cli-commands.js   — couche d'exécution des commandes système (adb, cordova, git, npm, scrcpy)
utils.js          — utilitaires transversaux (config, logs, prompts inquirer, readline)
preinstall.js     — hook npm : crée ~/dtl_runpda/ et supprime config.json (BUG : détruit la config à chaque update)
postinstall.js    — hook npm : chmod +x sur les binaires scrcpy/linux
config-electron/  — UI Electron pour éditer la config (non distribuée, dev only)
lib/              — binaires embarqués (À SUPPRIMER dans le rewrite)
  scrcpy-v3.3.4/linux/   — scrcpy + adb Linux
  scrcpy-v3.3.4/win64/   — scrcpy + adb Windows
  jre1.8.0_411/          — JRE Windows (utilisé uniquement pour AdbCommand.jar)
AdbCommand.jar    — programme Java qui extrait la BDD SQLite depuis le PDA via adb exec-out
AdbCommand.java   — source du jar ci-dessus
```

---

## Configuration utilisateur (config.json)

Stockée dans `~/dtl_runpda/config.json` (hors du dossier npm, donc indépendante des mises à jour si preinstall est corrigé).

Structure : objet JSON où chaque clé est un objet `{ value, is_visible, description, app_editable, editable, type? }`.

| Clé | Valeur par défaut | Description |
|-----|-------------------|-------------|
| `APP_DIR` | `~/dtl_runpda` | Dossier racine de la config |
| `CONFIGFILE_DIR` | `~/dtl_runpda/config.json` | Chemin du fichier config |
| `NPM_APP_DIR` | résolu via `npm root -g` | Dossier d'install npm du package |
| `CHANGELOG` | URL GitHub | Lien vers le CHANGELOG |
| `PDALIST` | `[]` | Cache liste des PDA (non utilisé activement) |
| `ADB_PATH` | `null` | Chemin vers le binaire adb (résolution auto si null) |
| `DEFAULT_PDA` | `"ct60"` | Modèle de PDA sélectionné par défaut |
| `TIME_BEFORE_CHECK_UPDATE` | `4` | Heures entre deux checks de mise à jour |
| `REQUIRE_UPDATE` | `false` | Flag interne : mise à jour disponible |
| `CURRENT_VERSION` | `null` | Version courante (mise à jour au runtime) |
| `LATEST_VERSION` | `null` | Dernière version npm (mise à jour au runtime) |
| `LAST_CHECK_UPDATE` | `null` | Date du dernier check de mise à jour |
| `DEBUG_LEVEL` | `0` | Niveau de verbosité des logs (0 = DEBUG, 1 = WARNING, 2 = ERROR) |
| `EMA_DEFAULT_AUTHOR` | `""` | Auteur par défaut pour la commande `ema` |

**Dossiers créés automatiquement à l'init :**
- `~/dtl_runpda/database/` — exports de BDD par modèle de PDA
- `~/dtl_runpda/database/{MODEL}/` — ex: `CT45/`, `EDA52/`
- `~/dtl_runpda/log/` — fichiers de log journaliers (`log_YYYY-MM-DD`)

---

## Commandes CLI disponibles

Syntaxe : `run [commande] [args]`  
Les tirets sont optionnels et en nombre variable (`-l`, `--l`, `-list` → identique).  
Insensible à la casse.

### Compilation / déploiement

| Commande | Alias | Description | Nécessite ADB |
|----------|-------|-------------|---------------|
| `run` | `run [modele]` | Lance `cordova run android --target={serial}`. Sans argument → liste tous les PDA connectés pour sélection. Avec argument → filtre par modèle. | Oui |

### Gestion des PDA

| Commande | Alias | Description | Nécessite ADB |
|----------|-------|-------------|---------------|
| `run -l` | `-list` | Liste les PDA connectés avec modèle, serial, version EM, version Android | Oui |
| `run -c` | `-clear` | Clear les données/cache de l'app EM (`pm clear`) puis relance l'app | Oui |
| `run -u` | `-uninstall` | Désinstalle l'app EM du PDA | Oui |
| `run -e` | `-export` | Exporte la BDD SQLite de l'app EM vers `~/dtl_runpda/database/{MODEL}/{MODEL}_{SERIAL}` | Oui |
| `run -show` | | Lance scrcpy pour streamer l'écran du PDA | Oui |

### Build

| Commande | Alias | Description | Nécessite ADB |
|----------|-------|-------------|---------------|
| `run -b` | `-build` | Build APK debug ou release via Cordova (sans déploiement) | Non |

### Configuration

| Commande | Alias | Description | Nécessite ADB |
|----------|-------|-------------|---------------|
| `run -d` | `-default`, `-defaut` | Change le PDA par défaut (stocké dans config) | Non |
| `run -config` | | Ouvre l'UI Electron de gestion de la config | Non |

### Informations

| Commande | Alias | Description | Nécessite ADB |
|----------|-------|-------------|---------------|
| `run -h` | `-help` | Affiche la liste des commandes | Non |
| `run -v` | `-version` | Affiche la version courante + lien CHANGELOG | Non |
| `run -update` | | Met à jour le package vers la dernière version npm | Non |

### Git helpers

| Commande | Description | Nécessite ADB |
|----------|-------------|---------------|
| `run -checkout {branche}` | Checkout une branche git (avec sélection interactive si plusieurs matches) | Non |
| `run -merge {branche}` | Merge une branche dans la branche courante (avec confirmation) | Non |
| `run -pull` | `git pull` (ou `git pull origin {branche}` si argument `origin`) | Non |

### Easymobile About

| Commande | Description | Nécessite ADB |
|----------|-------------|---------------|
| `run -ema` | Ajoute une entrée dans `easymobile_about.json` (auteur, ticket, version, description). Lit la version depuis `config.xml` Cordova. | Non |

---

## Commandes ADB utilisées

### Détection et serveur

```bash
# Vérifie si adb est installé
adb version

# Démarre le serveur adb (et liste les devices comme effet de bord)
adb devices

# Liste les devices avec labels (model, transport_id, etc.)
adb devices -l
```

### Informations device

```bash
# Modèle du device
adb -s {serialNumber} shell getprop ro.product.model

# Numéro de série (depuis les propriétés système, distinct du serial ADB)
adb -s {serialNumber} shell getprop ro.serialno

# Version Android
adb -s {serialNumber} shell getprop ro.build.version.release

# Infos complètes du package EasyMobile (contient versionName=)
adb -s {serialNumber} shell dumpsys package net.distrilog.easymobile
```

### Commande batch optimisée (getPdaInfo — récupère tout en une seule connexion)

```bash
adb -s {serialNumber} shell sh -c '
  echo "__MODEL__=$(getprop ro.product.model)";
  echo "__SERIAL__=$(getprop ro.serialno)";
  echo "__ANDROID__=$(getprop ro.build.version.release)";
  dumpsys package net.distrilog.easymobile 2>/dev/null | grep versionName= || true
'
```

Parse : `__MODEL__`, `__SERIAL__`, `__ANDROID__` + ligne contenant `versionName=`.  
Note : sur émulateur (`pda.startsWith('emulator-')`), ignorer `ro.serialno` et garder le serial ADB.

### Actions sur l'app EasyMobile

```bash
# Clear les données et le cache de l'app
adb -s {serialNumber} shell pm clear net.distrilog.easymobile

# Lance l'app EM
adb -s {serialNumber} shell am start -n net.distrilog.easymobile/.MainActivity

# Désinstalle l'app EM
adb -s {serialNumber} uninstall net.distrilog.easymobile

# Désactive la mise en veille écran (valeur max = 2147483647 ms)
adb -s {serialNumber} shell settings put system screen_off_timeout 2147483647
```

### Export de la base de données SQLite

L'app EasyMobile peut avoir la BDD à deux emplacements selon la version :

```bash
# Ancien emplacement (WebView databases)
adb -s {serialNumber} shell "run-as net.distrilog.easymobile ls app_webview/Default/databases/file__0 | grep -v '-'"

# Nouvel emplacement
adb -s {serialNumber} shell "run-as net.distrilog.easymobile ls databases | grep -v '-'"
```

**Extraction binaire (actuellement via AdbCommand.jar — à réécrire en Node.js natif) :**

```bash
# Ancien emplacement
adb -s {serialNumber} exec-out run-as net.distrilog.easymobile cat app_webview/Default/databases/file__0/{filename} > "{destinationPath}/{MODEL}_{SERIAL}"

# Nouvel emplacement
adb -s {serialNumber} exec-out run-as net.distrilog.easymobile cat databases/{filename} > "{destinationPath}/{MODEL}_{SERIAL}"
```

**Nommage du fichier exporté** : `{MODEL}_{SERIAL}` (sans extension — c'est un fichier SQLite).  
**Dossier de destination** : `~/dtl_runpda/database/{MODEL}/`

Le fichier peut être ouvert directement avec DBeaver (type SQLite), HeidiSQL, ou tout autre client SQLite.

**Note importante sur l'extraction** : `exec-out` redirigé vers un fichier en Node.js est délicat à cause du binaire. L'implémentation Java (`AdbCommand.jar`) gère le pipe binaire proprement. Dans le rewrite TypeScript, utiliser `spawn` avec `stdio: ['ignore', writeStream, 'pipe']` plutôt que `exec`.

### Résolution du chemin adb

```bash
# Résout le chemin absolu de l'exécutable adb (Linux/WSL)
bash --noprofile --norc -lc "command -v adb"
```

---

## Commandes Cordova utilisées

```bash
# Déploie l'app sur un PDA spécifique
cordova run android --target={serialNumber}

# Build APK debug
cordova build android --debug

# Build APK release
cordova build android --release -- --packageType=apk
```

---

## Commandes scrcpy utilisées

```bash
# Stream l'écran du device (Linux / WSL)
scrcpy -s {serialNumber}

# Windows (avec SCRCPY_ADB env var pour pointer vers le bon adb)
# Lancé via: cmd /c start /B "" scrcpy.exe -s {serialNumber}
# Env: SCRCPY_ADB={adbPath}
```

---

## Commandes npm utilisées en interne

```bash
# Trouve le dossier racine npm global (pour localiser le package installé)
npm root -g

# Récupère la dernière version publiée avec le tag "latest"
npm dist-tag ls dtl_runpda
# → parse la ligne "latest: X.Y.Z"

# Récupère la version actuellement installée globalement
npm list -g dtl_runpda
# → regex /dtl_runpda@(\d+\.\d+\.\d+)/

# Met à jour le package
npm i -g dtl_runpda@{version}
```

---

## CI/CD (GitHub Actions)

Fichier : `.github/workflows/release.yml`  
Déclenché sur chaque push sur `master`.

Étapes :
1. Checkout avec historique complet (`fetch-depth: 0`)
2. Setup Node.js 18 avec registry npmjs.org
3. `npm ci`
4. Lire la version depuis `package.json`
5. Vérifier si le tag git ou la version npm existent déjà → skip si oui
6. Créer et pusher le tag git `v{version}`
7. `npm publish` (avec `NPM_TOKEN` en secret GitHub)
8. Créer une GitHub Release avec notes auto-générées

**Déclenchement d'une release** : bumper la version dans `package.json` et pusher sur master.

---

## Dépendances actuelles (à évaluer pour le rewrite)

### Runtime
| Package | Usage | Garder ? |
|---------|-------|---------|
| `chalk` | Couleurs terminal | Oui |
| `inquirer` | Prompts interactifs (list, input) | Oui — cross-platform, remplace fzf sur Windows |
| `boxen` | Encadrés dans le terminal | Optionnel |
| `cli-table` | Tableaux dans le terminal | Optionnel (remplaçable par `cli-table3`) |
| `date-fns` | Formatage des dates (logs) | Remplaçable par `Intl` natif |
| `dotenv` | Variables d'environnement | Peut être supprimé (API GitLab dépréciée) |
| `axios` | Appels API GitLab (déprécié) | **À supprimer** |
| `os` | Module natif Node.js | Supprimer (déjà dans Node) |

### Dev
| Package | Usage | Garder ? |
|---------|-------|---------|
| `electron` | UI config (non distribuée) | Non |

### Stack cible pour le rewrite

**Runtime (dependencies)**
| Package | Raison |
|---------|--------|
| `commander` | Parsing des args, sous-commandes, help auto-généré — standard de facto CLI Node.js |
| `@inquirer/prompts` | Version modulaire et ESM-native d'inquirer (remplace `inquirer`) — cross-platform Windows/Linux |
| `chalk` | Couleurs terminal — déjà présent, on garde |
| `ora` | Spinners pour les opérations async (adb, cordova prennent du temps — feedback utilisateur essentiel) |
| `cli-table3` | Remplace `cli-table` — maintenu activement, mieux typé |
| `boxen` | Encadrés (message de mise à jour) — optionnel mais propre |
| `zod` | Validation du `config.json` à la lecture — évite les crashs silencieux sur config corrompue |

**Dev (devDependencies)**
| Package | Raison |
|---------|--------|
| `typescript` | Rewrite TS |
| `tsup` | Bundler zéro-config — gère le champ `bin`, produit CJS/ESM propre, essentiel pour publier sur npm |
| `tsx` | Exécution TS en dev sans build step (remplace `ts-node`, beaucoup plus rapide) |
| `@types/node` | Types Node.js |

---

## Architecture cible — TypeScript + DDD léger

```
src/
├── index.ts                          # point d'entrée CLI
│
├── presentation/
│   └── cli/
│       ├── Commander.ts              # setup commander, enregistre les commandes
│       └── commands/
│           ├── RunCommand.ts
│           ├── ListCommand.ts
│           ├── ClearCommand.ts
│           ├── UninstallCommand.ts
│           ├── ExportCommand.ts
│           ├── StreamCommand.ts
│           ├── BuildCommand.ts
│           ├── DefaultCommand.ts
│           ├── UpdateCommand.ts
│           ├── HelpCommand.ts
│           ├── VersionCommand.ts
│           ├── GitCheckoutCommand.ts
│           ├── GitMergeCommand.ts
│           ├── GitPullCommand.ts
│           └── EmaCommand.ts
│
├── application/
│   └── usecases/
│       ├── ListDevicesUseCase.ts
│       ├── RunPdaUseCase.ts
│       ├── ClearEMUseCase.ts
│       ├── UninstallEMUseCase.ts
│       ├── ExportDatabaseUseCase.ts
│       ├── StreamPdaUseCase.ts
│       ├── BuildApkUseCase.ts
│       ├── SetDefaultPdaUseCase.ts
│       ├── CheckUpdateUseCase.ts
│       ├── UpdatePackageUseCase.ts
│       ├── EasymobileAboutUseCase.ts
│       ├── GitCheckoutUseCase.ts
│       ├── GitMergeUseCase.ts
│       └── GitPullUseCase.ts
│
├── domain/
│   ├── device/
│   │   ├── Device.ts                 # type/interface Device
│   │   └── DeviceRepository.ts       # port (interface)
│   ├── config/
│   │   ├── AppConfig.ts              # type de la config
│   │   └── ConfigRepository.ts       # port (interface)
│   ├── build/
│   │   └── BuildAdapter.ts           # port (interface)
│   ├── stream/
│   │   └── StreamAdapter.ts          # port (interface)
│   └── update/
│       └── UpdateRepository.ts       # port (interface)
│
└── infrastructure/
    ├── adb/
    │   ├── AdbRunner.ts              # exécution brute des commandes adb
    │   └── AdbDeviceRepository.ts    # implémente DeviceRepository
    ├── config/
    │   └── JsonConfigRepository.ts   # implémente ConfigRepository (lit/écrit ~/dtl_runpda/config.json)
    ├── cordova/
    │   └── CordovaBuildAdapter.ts    # implémente BuildAdapter
    ├── scrcpy/
    │   └── ScrcpyStreamAdapter.ts    # implémente StreamAdapter
    ├── npm/
    │   └── NpmUpdateRepository.ts    # implémente UpdateRepository
    └── git/
        └── GitRunner.ts              # exécution des commandes git
```

---

## Règles du rewrite

1. **Prérequis système** : adb, scrcpy, cordova sont des outils que l'utilisateur installe lui-même. Le CLI détecte leur absence et affiche un message d'installation clair. Aucun binaire embarqué dans le package.

2. **Config JSON** : conservée dans `~/dtl_runpda/config.json`. Le fichier **ne doit jamais être supprimé** par preinstall/postinstall. À l'init, si le fichier existe, merger les nouvelles clés sans écraser les valeurs existantes.

3. **Extraction BDD** : réécrire en Node.js natif avec `spawn` + pipe vers `fs.createWriteStream`. Supprimer `AdbCommand.jar` et `AdbCommand.java`.

4. **Cross-platform** : chemins via `path.join`, détection OS via `process.platform === 'win32'`, pas de shell-only tricks sur Windows.

5. **scrcpy** : utiliser le binaire système. Sous Linux, `scrcpy -s {serial}`. Sous Windows, `scrcpy.exe -s {serial}` (dans le PATH). Supprimer `lib/scrcpy-v3.3.4/`.

6. **Pas de preinstall destructeur** : le script preinstall doit uniquement créer les dossiers s'ils n'existent pas. Jamais de `unlinkSync` sur la config.

7. **TypeScript strict** : `"strict": true` dans tsconfig. Pas de `any` sauf cas impossibles à typer.
