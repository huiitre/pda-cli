# CLAUDE.md — pda-cli

CLI Node.js installé globalement (`npm install -g pda-cli`). Commande d'entrée : `pda`.

Outil de développement pour déployer, tester et gérer des applications Cordova sur des PDA Android (CT45, CT60, EDA52…) via ADB.

---

## Stack

- **TypeScript strict** + ESM (`"type": "module"`)
- **commander** — parsing des commandes CLI
- **@inquirer/prompts** v7 — prompts interactifs (ESM-native)
- **chalk** — couleurs terminal
- **zod** — validation et parsing du `config.json`
- **tsup** — bundler (produit `dist/`)
- **tsx** — exécution TypeScript en dev sans build

---

## Architecture — DDD léger

```
src/
├── index.ts                          # point d'entrée : bootstrap, update check, commander.parse()
│
├── domain/
│   ├── app/
│   │   ├── App.ts                    # interface App + type AppEditableFields
│   │   ├── AppFieldMeta.ts           # métadonnées des champs éditables (label, description, default)
│   │   └── CustomCommand.ts          # interface CustomCommand { id, name, command }
│   ├── config/
│   │   ├── AppConfig.ts              # schéma Zod + type AppConfig + DEFAULT_CONFIG
│   │   └── ConfigFieldMeta.ts        # métadonnées des champs de config (label, editable, showInConfig)
│   └── device/
│       └── Device.ts                 # interface Device { serialNumber, model, androidVersion, appVersion }
│
├── application/
│   ├── ports/
│   │   ├── IBuildRunner.ts           # run(command): Promise<void>
│   │   ├── IStreamRunner.ts          # stream(serial): Promise<void>
│   │   ├── IConfigRepository.ts      # load(): AppConfig / save(config): void
│   │   ├── IConfigEditor.ts          # prompt(fields): Promise<changes | null>
│   │   ├── IDeviceRepository.ts      # listDevices(adbPath?): Promise<Device[]>
│   │   └── IUpdateRepository.ts      # getLatestVersion(): Promise<string | null>
│   ├── services/
│   │   ├── ConfigService.ts          # get<K>(key), set<K>(key, value) — persiste à chaque set()
│   │   └── LogService.ts             # debug() — actif si debugEnabled dans config
│   └── usecases/                     # un use case = une opération métier
│       ├── RunPdaUseCase.ts
│       ├── BuildApkUseCase.ts
│       ├── StreamPdaUseCase.ts
│       ├── ClearEMUseCase.ts
│       ├── UninstallEMUseCase.ts
│       ├── ListDevicesUseCase.ts
│       ├── CheckUpdateUseCase.ts
│       ├── EditConfigUseCase.ts
│       ├── AddPackageUseCase.ts
│       ├── EditPackageUseCase.ts
│       ├── RemovePackageUseCase.ts
│       ├── ListPackagesUseCase.ts
│       ├── UsePackageUseCase.ts
│       ├── AddCustomCommandUseCase.ts
│       ├── EditCustomCommandUseCase.ts
│       ├── RemoveCustomCommandUseCase.ts
│       └── RunCustomCommandUseCase.ts
│
├── infrastructure/
│   ├── adb/
│   │   ├── AdbRunner.ts              # exec(args, timeoutMs) — spawn adb, rejette AdbNotFoundError
│   │   └── AdbDeviceRepository.ts    # implémente IDeviceRepository via AdbRunner
│   ├── config/
│   │   ├── JsonConfigRepository.ts   # lit/écrit ~/pda-cli/config.json, merge Zod à la lecture
│   │   └── InquirerConfigEditor.ts   # implémente IConfigEditor avec @inquirer/prompts
│   ├── shell/
│   │   └── ShellBuildRunner.ts       # spawn(command, { shell: true, stdio: 'inherit' })
│   ├── scrcpy/
│   │   └── ScrcpyStreamRunner.ts     # spawn detached + unref() → libère le terminal
│   ├── update/
│   │   └── NpmRegistryAdapter.ts     # fetch https://registry.npmjs.org/pda-cli/latest
│   └── paths.ts                      # APP_DIR, CONFIG_FILE, DATABASE_DIR, LOGS_DIR (~/ pda-cli/)
│
└── presentation/
    └── cli/
        ├── AppContext.ts             # interface { config, logger, adbRunner, configEditor, version }
        ├── CommandRegistry.ts        # enregistre toutes les commandes + configure le help
        ├── UpdateNotifier.ts         # displayUpdateNotification(info) — boxen
        ├── selectDevice.ts           # helper partagé : liste PDA, filtre par modèle, prompt si plusieurs
        └── commands/
            ├── RunCommand.ts         # pda run [model]
            ├── BuildCommand.ts       # pda build
            ├── StreamCommand.ts      # pda stream [model]
            ├── ClearCommand.ts       # pda clear [model]
            ├── UninstallCommand.ts   # pda uninstall [model]
            ├── CustomCommand.ts      # pda custom [name]
            ├── ListCommand.ts        # pda list
            ├── DefaultCommand.ts     # pda default [model]
            ├── ConfigCommand.ts      # pda config
            ├── PackageCommand.ts     # pda package + sous-commandes + pda package commands
            ├── VersionCommand.ts     # pda version
            └── HelpCommand.ts        # pda help + buildCustomHelp()
```

---

## Règles importantes

### Ports
Les ports (interfaces) vont dans `application/ports/`. Le domaine ne contient que des entités et des types — pas de dépendances externes.

### Commandes CLI
Chaque commande est dans `presentation/cli/commands/`. Elle reçoit `(program: Command, ctx: AppContext)`, crée ses use cases localement, et gère ses propres erreurs avec `chalk.red()`.

Pour ajouter une commande :
1. Créer `src/presentation/cli/commands/MaCommande.ts`
2. L'enregistrer dans `CommandRegistry.ts`
3. L'ajouter dans `buildCustomHelp()` dans `HelpCommand.ts`

### Sélection de PDA
Toutes les commandes qui agissent sur un PDA utilisent le helper `selectDevice(ctx, modelArg, promptMessage)` de `selectDevice.ts`. Ne pas dupliquer cette logique.

### Config
`ConfigService.set()` persiste immédiatement dans `config.json`. Ne jamais accéder à `JsonConfigRepository` directement depuis les use cases — toujours passer par `ConfigService`.

### Placeholders dans les commandes
`{serial}` et `{packageId}` sont remplacés à l'exécution dans tous les champs de commande d'une `App` et dans les `CustomCommand`. La substitution se fait dans chaque use case (`.replace(/\{serial\}/g, serial)`).

### Chalk + padEnd
Appliquer `chalk.cyan()` **après** `padEnd()`, jamais avant. Les codes ANSI faussent le comptage de caractères et cassent l'alignement.

### @inquirer/prompts
Utiliser `prefill: 'editable'` sur les `input()` quand la valeur actuelle doit être pré-remplie et éditable. Sans `prefill`, le `default` disparaît dès que l'utilisateur tape.

### Ajout d'un champ à App
1. `domain/app/App.ts` — ajouter à l'interface
2. `domain/config/AppConfig.ts` — ajouter dans le schéma Zod avec `.default()`
3. `domain/app/AppFieldMeta.ts` — ajouter les métadonnées (label, description, default)

---

## Configuration utilisateur

Stockée dans **`~/pda-cli/config.json`** — créée automatiquement, jamais écrasée par npm.

Champs principaux : `defaultPda`, `adbPath`, `debugEnabled`, `updateCheckIntervalHours`, `apps[]`, `activeAppId`.

Chaque `App` contient : `id`, `name`, `packageId`, commandes (`runCommand`, `clearCommand`, `launchCommand`, `uninstallCommand`, `buildDebugCommand`, `buildReleaseCommand`), et `customCommands[]`.

---

## Développement

Voir [`doc/development.md`](doc/development.md) pour le workflow complet (setup, watch, test, déploiement).

**TL;DR :**
```bash
npm install && npm run build && npm link   # setup initial
npm run dev                                 # watch mode
pda --help                                  # tester
```

---

## CI/CD

Push sur `master` avec un commit conventionnel → GitHub Actions publie sur npm et crée une GitHub Release.

```
fix: …    →  patch
feat: …   →  minor
feat!: …  →  major
```

`chore:`, `docs:`, `refactor:` ne déclenchent pas de release.
