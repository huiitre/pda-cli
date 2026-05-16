# pda-cli

CLI de développement Android. Déploiement, gestion et debug d'applications Cordova sur PDA (CT45, CT60, EDA52…) via ADB.

```
npm install -g pda-cli
```

---

## Prérequis

| Outil | Rôle | Installation |
|-------|------|-------------|
| **Node.js** ≥ 18 | Runtime | [nodejs.org](https://nodejs.org) |
| **ADB** | Communication avec les PDA | Android SDK Platform Tools — doit être dans le `PATH` |
| **scrcpy** | Stream d'écran (`pda stream`) | [github.com/Genymobile/scrcpy](https://github.com/Genymobile/scrcpy) |
| **Cordova** | Build et déploiement | `npm install -g cordova` |

> `pda-cli` ne fournit aucun binaire embarqué. Chaque outil s'installe indépendamment et `pda-cli` détecte leur absence avec un message clair.

---

## Installation

```bash
npm install -g pda-cli
```

### Premier démarrage

La première fois, configurez au moins une application :

```bash
pda package add
```

Renseignez le nom, le `packageId` Android (ex: `net.domain.package`) et les commandes de déploiement. Les valeurs par défaut Cordova/ADB sont pré-remplies.

```bash
# Définir l'application comme active
pda package use

# Vérifier la configuration
pda package list
```

---

## Commandes

### Déploiement

| Commande | Alias | Description |
|----------|-------|-------------|
| `pda run [model]` | `r` | Compiler et déployer l'app active sur un PDA |
| `pda build` | `b` | Builder l'APK (debug ou release) sans déployer |

### Gestion PDA

| Commande | Alias | Description |
|----------|-------|-------------|
| `pda stream [model]` | `s` | Streamer l'écran d'un PDA via scrcpy |
| `pda clear [model]` | `cl` | Effacer les données de l'app et la relancer |
| `pda uninstall [model]` | `u` | Désinstaller l'app d'un PDA |

### Commandes personnalisées

| Commande | Alias | Description |
|----------|-------|-------------|
| `pda custom [name]` | `x` | Exécuter une commande personnalisée de l'app active |

### Appareils & Configuration

| Commande | Alias | Description |
|----------|-------|-------------|
| `pda list` | `l` | Lister les PDA connectés (modèle, serial, versions) |
| `pda default [model]` | `d` | Définir le modèle de PDA par défaut |
| `pda config` | `c` | Modifier la configuration globale |
| `pda package` | `pkg` | Gérer les applications configurées |

### Infos

| Commande | Alias | Description |
|----------|-------|-------------|
| `pda version` | `v` | Afficher la version et vérifier les mises à jour |
| `pda help [command]` | `h` | Afficher l'aide générale ou d'une commande |

---

## Sélection du PDA

Pour toutes les commandes qui agissent sur un PDA (`run`, `stream`, `clear`, `uninstall`, `custom`), le fonctionnement est identique :

- **Sans argument** : liste interactive de tous les PDA connectés
- **Avec un modèle** (`pda run ct60`) : filtre par modèle, sélection si plusieurs appareils correspondent
- **PDA par défaut** : utilisé si aucun autre PDA n'est connecté (configurable via `pda default`)

---

## Configuration

La configuration est stockée dans `~/pda-cli/config.json` — indépendante des mises à jour npm.

```bash
pda config          # éditeur interactif
pda default ct60    # changer le PDA par défaut directement
```

→ [Documentation complète de la configuration](doc/configuration.md)

---

## Gestion des applications

`pda-cli` est multi-application. Chaque application Cordova a ses propres commandes configurables avec les placeholders `{serial}` et `{packageId}`.

```bash
pda package list              # voir les apps et l'app active
pda package add               # ajouter une app
pda package edit              # modifier une app
pda package use               # changer d'app active
pda package commands add      # ajouter une commande personnalisée
```

→ [Documentation complète des applications](doc/packages.md)

---

## Commandes personnalisées

Créez n'importe quelle commande ADB, shell ou autre directement dans la config de l'app :

```bash
pda package commands add
# Nom    : Export BDD
# Commande : adb -s {serial} exec-out run-as {packageId} cat databases/db.sqlite > ~/export.sqlite

pda custom "Export BDD"     # l'exécuter
pda x                       # raccourci interactif
```

→ [Documentation des commandes personnalisées](doc/packages.md#commandes-personnalisées)

---

## Développement

→ [Guide de développement](doc/development.md)

---

## Licence

MIT — [github.com/huiitre/pda-cli](https://github.com/huiitre/pda-cli)
