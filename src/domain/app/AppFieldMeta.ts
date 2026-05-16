import type { AppEditableFields } from './App.js'

export interface AppFieldMeta {
  label: string
  description: string
  default?: string
}

// Source de vérité pour les champs éditables d'une App.
// Pour ajouter un champ : 1) App.ts  2) AppConfig.ts (Zod)  3) ici
export const APP_FIELDS_META: Record<keyof AppEditableFields, AppFieldMeta> = {
  name: {
    label: 'Nom',
    description: 'Nom affiché dans les listes',
  },
  packageId: {
    label: 'Package ID',
    description: "Identifiant Android de l'app (ex: com.example.myapp)",
  },
  runCommand: {
    label: 'Commande de run',
    description: 'Déploiement sur le PDA — placeholders disponibles : {serial}, {packageId}',
    default: 'cordova run android --target={serial}',
  },
  clearCommand: {
    label: 'Commande de nettoyage',
    description: "Efface les données de l'app — placeholders disponibles : {serial}, {packageId}",
    default: 'adb -s {serial} shell pm clear {packageId}',
  },
  launchCommand: {
    label: 'Commande de lancement',
    description: "Lance l'app après nettoyage — placeholders disponibles : {serial}, {packageId}",
    default: 'adb -s {serial} shell am start -n {packageId}/.MainActivity',
  },
  uninstallCommand: {
    label: 'Commande de désinstallation',
    description: "Désinstalle l'app du PDA — placeholders disponibles : {serial}, {packageId}",
    default: 'adb -s {serial} uninstall {packageId}',
  },
  buildDebugCommand: {
    label: 'Build debug',
    description: 'Build APK debug (sans déploiement) — placeholder disponible : {packageId}',
    default: 'cordova build android --debug',
  },
  buildReleaseCommand: {
    label: 'Build release',
    description: 'Build APK release (sans déploiement) — placeholders disponibles : {packageId}',
    default: 'cordova build android --release -- --packageType=apk',
  },
}
