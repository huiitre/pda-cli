import type { AppConfig } from './AppConfig.js'

export type ConfigFieldType = 'string' | 'boolean' | 'number' | 'object'

export interface ConfigFieldMeta {
  label: string
  description: string
  type: ConfigFieldType
  editable: boolean
  showInConfig: boolean
}

export const CONFIG_FIELDS_META: Record<keyof AppConfig, ConfigFieldMeta> = {
  defaultPda: {
    label: 'PDA par défaut',
    description: "Modèle utilisé quand aucun argument n'est fourni (ex: ct60, ct45)",
    type: 'string',
    editable: true,
    showInConfig: true,
  },
  adbPath: {
    label: 'Chemin ADB',
    description: 'Chemin absolu vers le binaire adb (laisser vide pour la détection automatique)',
    type: 'string',
    editable: true,
    showInConfig: true,
  },
  debugEnabled: {
    label: 'Mode debug',
    description: 'Active les logs de débogage détaillés',
    type: 'boolean',
    editable: true,
    showInConfig: true,
  },
  updateCheckIntervalHours: {
    label: 'Intervalle de vérification des mises à jour (h)',
    description: 'Fréquence en heures entre deux vérifications npm',
    type: 'number',
    editable: true,
    showInConfig: true,
  },
  lastUpdateCheck: {
    label: 'Dernier check de mise à jour',
    description: 'Date ISO du dernier check (géré automatiquement)',
    type: 'string',
    editable: false,
    showInConfig: false,
  },
  latestVersion: {
    label: 'Dernière version disponible',
    description: 'Dernière version npm détectée (géré automatiquement)',
    type: 'string',
    editable: false,
    showInConfig: false,
  },
  apps: {
    label: 'Applications',
    description: 'Liste des applications Cordova configurées (géré via pda package)',
    type: 'object',
    editable: false,
    showInConfig: false,
  },
  activeAppId: {
    label: 'Application active',
    description: 'Application sélectionnée par défaut (géré via pda package use)',
    type: 'string',
    editable: false,
    showInConfig: false,
  },
}
