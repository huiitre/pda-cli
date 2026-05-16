import type { ConfigService } from '../services/ConfigService.js'

export class RemoveCustomCommandUseCase {
  constructor(private readonly config: ConfigService) {}

  execute(appId: string, commandId: string): void {
    const apps = this.config.get('apps')
    const appIndex = apps.findIndex((a) => a.id === appId)
    if (appIndex === -1) throw new Error(`App "${appId}" introuvable`)

    const app = apps[appIndex]
    if (!app.customCommands.some((c) => c.id === commandId)) {
      throw new Error(`Commande "${commandId}" introuvable`)
    }

    const newApps = [...apps]
    newApps[appIndex] = { ...app, customCommands: app.customCommands.filter((c) => c.id !== commandId) }
    this.config.set('apps', newApps)
  }
}
