# Configuration

## Fichier de configuration

La configuration est stockée dans **`~/pda-cli/config.json`**. Ce fichier est créé automatiquement au premier lancement et survit aux mises à jour npm (il est en dehors du dossier d'installation).

Ne jamais le supprimer manuellement — toutes les applications et commandes personnalisées y sont stockées.

---

## Paramètres globaux

### Via l'éditeur interactif

```bash
pda config
```

Navigation : flèches pour sélectionner un paramètre, Entrée pour l'éditer, Échap pour quitter.

### Paramètres disponibles

| Clé | Type | Défaut | Description |
|-----|------|--------|-------------|
| `defaultPda` | string | `ct60` | Modèle de PDA sélectionné par défaut quand plusieurs sont connectés |
| `adbPath` | string \| null | `null` | Chemin absolu vers le binaire `adb`. Si `null`, ADB est recherché dans le `PATH` |
| `debugEnabled` | boolean | `false` | Active les logs de débogage détaillés |
| `updateCheckIntervalHours` | number | `4` | Fréquence en heures entre deux vérifications de mise à jour npm |

### Paramètres gérés automatiquement

Ces champs sont mis à jour par pda-cli et ne sont pas éditables via `pda config` :

| Clé | Description |
|-----|-------------|
| `lastUpdateCheck` | Date ISO du dernier check de mise à jour |
| `latestVersion` | Dernière version npm détectée |
| `apps` | Liste des applications (géré via `pda package`) |
| `activeAppId` | ID de l'application active (géré via `pda package use`) |

---

## PDA par défaut

```bash
pda default          # mode interactif
pda default ct60     # définir directement
```

Le PDA par défaut est utilisé dans ce cas précis : plusieurs PDA sont connectés, la commande est filtrée par modèle, et un seul PDA de ce modèle est détecté — il est sélectionné automatiquement sans prompt.

Valeurs courantes : `ct60`, `ct45`, `eda52`

---

## Chemin ADB

Par défaut, `pda-cli` cherche `adb` dans le `PATH` système. Si ADB est installé à un emplacement non standard :

```bash
pda config
# → sélectionner "Chemin ADB"
# → entrer le chemin absolu, ex: /home/user/android-sdk/platform-tools/adb
```

Ou directement dans `~/pda-cli/config.json` :
```json
{
  "adbPath": "/home/user/android-sdk/platform-tools/adb"
}
```

---

## Vérification des mises à jour

À chaque lancement, pda-cli vérifie si une nouvelle version est disponible sur npm — mais au maximum toutes les `updateCheckIntervalHours` heures (défaut : 4h) pour ne pas ralentir le démarrage.

La vérification est non-bloquante : si le registry npm ne répond pas en 2 secondes, elle est ignorée silencieusement.

Pour forcer un re-check, effacez `lastUpdateCheck` et `latestVersion` dans `~/pda-cli/config.json` :
```json
{
  "lastUpdateCheck": null,
  "latestVersion": null
}
```

---

## Structure complète de config.json

```json
{
  "defaultPda": "ct60",
  "adbPath": null,
  "debugEnabled": false,
  "updateCheckIntervalHours": 4,
  "lastUpdateCheck": "2026-05-16T21:00:00.000Z",
  "latestVersion": "1.0.0",
  "activeAppId": "appname",
  "apps": [
    {
      "id": "appname",
      "name": "appname",
      "packageId": "net.domain.package",
      "runCommand": "cordova run android --target={serial}",
      "clearCommand": "adb -s {serial} shell pm clear {packageId}",
      "launchCommand": "adb -s {serial} shell am start -n {packageId}/.MainActivity",
      "uninstallCommand": "adb -s {serial} uninstall {packageId}",
      "buildDebugCommand": "cordova build android --debug",
      "buildReleaseCommand": "cordova build android --release -- --packageType=apk",
      "customCommands": []
    }
  ]
}
```