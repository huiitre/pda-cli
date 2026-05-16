# Référence des commandes

Toutes les commandes disponibles dans `pda-cli`, avec leurs options et comportements détaillés.

---

## pda run

```
pda run [model]
pda r [model]
```

Compile et déploie l'application active sur un PDA. Exécute la `runCommand` configurée pour l'application (par défaut : `cordova run android --target={serial}`).

**Fonctionnement :**
1. Récupère la liste des PDA connectés via ADB
2. Si `[model]` est fourni, filtre par modèle
3. Si plusieurs PDA correspondent, propose une sélection interactive
4. Lance la commande de run avec le serial du PDA sélectionné

**Exemples :**
```bash
pda run              # liste tous les PDA connectés
pda run ct60         # filtre sur les CT60
pda r eda52          # alias + filtre
```

**Prérequis :** ADB dans le PATH, Cordova installé, une application active (`pda package use`)

---

## pda build

```
pda build
pda b
```

Build l'APK de l'application active sans le déployer sur un PDA. Propose de choisir entre debug et release.

- **Debug** : exécute `buildDebugCommand` (par défaut : `cordova build android --debug`)
- **Release** : exécute `buildReleaseCommand` (par défaut : `cordova build android --release -- --packageType=apk`)

**Prérequis :** Cordova installé, une application active

---

## pda stream

```
pda stream [model]
pda s [model]
```

Lance scrcpy pour streamer l'écran d'un PDA. Le processus scrcpy est démarré en arrière-plan — le terminal est libéré immédiatement.

**Exemples :**
```bash
pda stream           # sélection interactive
pda stream ct45      # filtre sur CT45
```

**Prérequis :** scrcpy installé et dans le PATH

---

## pda clear

```
pda clear [model]
pda cl [model]
```

Efface les données et le cache de l'application active (`clearCommand`), puis la relance (`launchCommand`).

Commandes par défaut :
```bash
adb -s {serial} shell pm clear {packageId}
adb -s {serial} shell am start -n {packageId}/.MainActivity
```

**Exemples :**
```bash
pda clear            # sélection interactive du PDA
pda cl ct60          # filtre sur CT60
```

**Prérequis :** ADB dans le PATH, une application active

---

## pda uninstall

```
pda uninstall [model]
pda u [model]
```

Désinstalle l'application active d'un PDA. Exécute `uninstallCommand` (par défaut : `adb -s {serial} uninstall {packageId}`).

**Prérequis :** ADB dans le PATH, une application active

---

## pda custom

```
pda custom [name]
pda x [name]
```

Exécute une commande personnalisée de l'application active. Si `[name]` est omis, affiche une liste interactive.

Si la commande contient `{serial}`, la sélection de PDA est demandée automatiquement. Sinon, la commande s'exécute directement.

**Exemples :**
```bash
pda custom               # liste interactive des commandes
pda custom "Export BDD"  # exécute directement par nom
pda x                    # alias
```

→ Voir [Gestion des applications — Commandes personnalisées](packages.md#commandes-personnalisées)

---

## pda list

```
pda list
pda l
```

Liste tous les PDA connectés via ADB avec leurs informations :

| Colonne | Source ADB |
|---------|-----------|
| Modèle | `ro.product.model` |
| Serial | `ro.serialno` |
| Version Android | `ro.build.version.release` |
| Version de l'app | `dumpsys package <packageId>` |

**Prérequis :** ADB dans le PATH

---

## pda default

```
pda default [model]
pda d [model]
```

Définit le modèle de PDA utilisé par défaut quand plusieurs appareils sont connectés mais qu'aucun ne correspond à un filtre.

```bash
pda default          # mode interactif (valeur actuelle pré-remplie)
pda default ct60     # définir directement
pda d eda52
```

La valeur est stockée dans `~/pda-cli/config.json` sous la clé `defaultPda`.

---

## pda config

```
pda config
pda c
```

Ouvre l'éditeur interactif de configuration. Affiche tous les paramètres éditables avec leur valeur actuelle. Navigation au clavier, Échap pour quitter.

Paramètres disponibles :

| Paramètre | Description |
|-----------|-------------|
| PDA par défaut | Modèle utilisé par défaut (ex: `ct60`) |
| Chemin ADB | Chemin absolu vers `adb` (vide = détection automatique) |
| Mode debug | Active les logs de débogage détaillés |
| Intervalle de vérification des mises à jour | Fréquence en heures du check npm |

→ Voir [Configuration](configuration.md)

---

## pda package

```
pda package <sous-commande>
pda pkg <sous-commande>
```

Gère les applications Cordova configurées dans pda-cli.

### Sous-commandes

| Sous-commande | Alias | Description |
|---------------|-------|-------------|
| `pda package list` | `ls` | Lister les applications et voir l'app active |
| `pda package add` | | Ajouter une nouvelle application |
| `pda package edit [id]` | | Modifier une application existante |
| `pda package remove` | `rm` | Supprimer une application |
| `pda package use [id]` | | Définir l'application active |
| `pda package commands` | `cmds` | Gérer les commandes personnalisées |

→ Documentation complète : [Gestion des applications](packages.md)

---

## pda version

```
pda version
pda v
```

Affiche la version installée et vérifie si une mise à jour est disponible sur npm. La vérification est effectuée toutes les N heures (configurable via `pda config`).

Si une mise à jour est détectée :
```
╭────────────────────────────────────────────╮
│  Mise à jour disponible !                  │
│  0.4.0 → 1.0.0                             │
│                                            │
│  Exécutez : npm install -g pda-cli@latest  │
╰────────────────────────────────────────────╯
```

---

## pda help

```
pda help [command]
pda h [command]
```

Affiche l'aide générale ou le détail d'une commande spécifique.

```bash
pda help             # aide générale
pda help run         # aide de la commande run
pda help package     # aide de la commande package
pda package help     # équivalent pour les sous-commandes
```