import type { CustomCommand } from './CustomCommand.js'

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
  customCommands: CustomCommand[]
}

export type AppEditableFields = Omit<App, 'id' | 'customCommands'>
