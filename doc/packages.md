# Gestion des applications

`pda-cli` est multi-application. Chaque "application" correspond à une app Cordova avec son propre `packageId`, ses commandes ADB/Cordova et ses commandes personnalisées.

Une seule application est **active** à la fois : c'est celle que `pda run`, `pda clear`, `pda uninstall`, `pda build` et `pda custom` utilisent.

---

## Gérer les applications

### Lister les applications

```bash
pda package list
pda pkg ls
```

Affiche toutes les applications configurées avec leurs commandes. L'app active est indiquée par `▶`.

```
▶ Appname
    id          appname
    package     net.domain.package
    run         cordova run android --target={serial}
    clear       adb -s {serial} shell pm clear {packageId}
    launch      adb -s {serial} shell am start -n {packageId}/.MainActivity
    uninstall   adb -s {serial} uninstall {packageId}
    build debug cordova build android --debug
    build rel.  cordova build android --release -- --packageType=apk
    custom      Export BDD, Logs ADB
```

### Ajouter une application

```bash
pda package add
```

Démarre un assistant interactif. Les valeurs par défaut Cordova/ADB sont pré-remplies — appuyez sur Entrée pour les conserver ou tapez pour les modifier.

Champs demandés :

| Champ | Exemple | Description |
|-------|---------|-------------|
| Nom | `appname` | Nom affiché dans les listes |
| Package ID | `net.domain.package` | Identifiant Android de l'app |
| Commande de run | `cordova run android --target={serial}` | Déploiement sur PDA |
| Commande de nettoyage | `adb -s {serial} shell pm clear {packageId}` | Clear des données |
| Commande de lancement | `adb -s {serial} shell am start -n {packageId}/.MainActivity` | Relance après clear |
| Commande de désinstallation | `adb -s {serial} uninstall {packageId}` | Désinstallation |
| Build debug | `cordova build android --debug` | Build APK debug |
| Build release | `cordova build android --release -- --packageType=apk` | Build APK release |

Si c'est la première application ajoutée, elle devient automatiquement l'app active.

### Modifier une application

```bash
pda package edit           # sélection interactive
pda package edit appname  # par ID
```

Ouvre un éditeur champ par champ. La valeur actuelle est pré-remplie et éditable directement.

### Supprimer une application

```bash
pda package remove
pda pkg rm
```

### Changer l'application active

```bash
pda package use             # sélection interactive
pda package use appname  # par ID
```

---

## Placeholders

Toutes les commandes d'une application peuvent utiliser ces placeholders, remplacés automatiquement à l'exécution :

| Placeholder | Valeur substituée |
|-------------|------------------|
| `{serial}` | Numéro de série ADB du PDA sélectionné |
| `{packageId}` | Package ID Android de l'application |

**Exemples :**
```bash
# Commande configurée :
adb -s {serial} shell pm clear {packageId}

# Exécutée comme :
adb -s HT123ABC456 shell pm clear net.domain.package
```

---

## Commandes personnalisées

Chaque application peut avoir un nombre illimité de commandes personnalisées. Elles sont exécutées via `pda custom`.

### Gérer les commandes personnalisées

```bash
pda package commands list       # lister les commandes de l'app active
pda package commands add        # ajouter une commande
pda package commands edit       # modifier une commande
pda package commands remove     # supprimer une commande

# Alias
pda pkg cmds ls
pda pkg cmds add
```

### Ajouter une commande personnalisée

```bash
pda package commands add
```

```
Nom : Export BDD
Commande : adb -s {serial} exec-out run-as {packageId} cat "databases/$(adb -s {serial} shell 'run-as {packageId} ls databases' | grep -v '-' | tr -d '\r' | head -1)" > ~/pda-cli/database/{serial}.sqlite
```

### Exécuter une commande personnalisée

```bash
pda custom               # liste interactive
pda custom "Export BDD"  # par nom exact
pda x                    # alias
```

Si la commande contient `{serial}`, la sélection du PDA est demandée automatiquement avant l'exécution. Sinon, la commande s'exécute sans interaction.

### Exemples de commandes personnalisées

**Export de la base de données SQLite :**
```bash
adb -s {serial} exec-out run-as {packageId} cat "databases/$(adb -s {serial} shell 'run-as {packageId} ls databases' | grep -v '-' | tr -d '\r' | head -1)" > ~/pda-cli/database/{serial}.sqlite
```
> Nécessite que `~/pda-cli/database/` existe : `mkdir -p ~/pda-cli/database`

**Désactiver la mise en veille écran :**
```bash
adb -s {serial} shell settings put system screen_off_timeout 2147483647
```

**Voir les logs de l'app en temps réel :**
```bash
adb -s {serial} logcat --pid=$(adb -s {serial} shell pidof -s {packageId})
```

**Redémarrer l'app :**
```bash
adb -s {serial} shell am force-stop {packageId} && adb -s {serial} shell am start -n {packageId}/.MainActivity
```

**Prendre une capture d'écran :**
```bash
adb -s {serial} shell screencap -p /sdcard/screenshot.png && adb -s {serial} pull /sdcard/screenshot.png ~/pda-cli/screenshots/{serial}_$(date +%Y%m%d_%H%M%S).png
```