export interface App {
  id: string
  name: string
  packageId: string
  runCommand: string
  clearCommand: string
  launchCommand: string
  uninstallCommand: string
  buildDebugCommand: string
  buildReleaseCommand: string
}

export type AppEditableFields = Omit<App, 'id'>
