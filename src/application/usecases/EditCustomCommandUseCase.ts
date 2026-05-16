import type { CustomCommand } from '../../domain/app/CustomCommand.js'
import type { ConfigService } from '../services/ConfigService.js'

export class EditCustomCommandUseCase {
  constructor(private readonly config: ConfigService) {}

  execute(appId: string, commandId: string, changes: Partial<Pick<CustomCommand, 'name' | 'command'>>): CustomCommand {
    const apps = this.config.get('apps')
    const appIndex = apps.findIndex((a) => a.id === appId)
    if (appIndex === -1) throw new Error(`App "${appId}" introuvable`)

    const app = apps[appIndex]
    const cmdIndex = app.customCommands.findIndex((c) => c.id === commandId)
    if (cmdIndex === -1) throw new Error(`Commande "${commandId}" introuvable`)

    const updated: CustomCommand = { ...app.customCommands[cmdIndex], ...changes }
    const newCmds = [...app.customCommands]
    newCmds[cmdIndex] = updated

    const newApps = [...apps]
    newApps[appIndex] = { ...app, customCommands: newCmds }
    this.config.set('apps', newApps)
    return updated
  }
}
