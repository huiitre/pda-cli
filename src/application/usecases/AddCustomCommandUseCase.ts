import type { CustomCommand } from '../../domain/app/CustomCommand.js'
import type { ConfigService } from '../services/ConfigService.js'

function toId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export class AddCustomCommandUseCase {
  constructor(private readonly config: ConfigService) {}

  execute(appId: string, name: string, command: string): CustomCommand {
    const apps = this.config.get('apps')
    const index = apps.findIndex((a) => a.id === appId)
    if (index === -1) throw new Error(`App "${appId}" introuvable`)

    const app = apps[index]
    const lower = name.toLowerCase()
    if (app.customCommands.some((c) => c.name.toLowerCase() === lower)) {
      throw new Error(`Une commande "${name}" existe déjà dans cette application`)
    }

    const baseId = toId(name)
    let id = baseId
    let counter = 1
    while (app.customCommands.some((c) => c.id === id)) {
      id = `${baseId}-${counter++}`
    }

    const newCmd: CustomCommand = { id, name, command }
    const newApps = [...apps]
    newApps[index] = { ...app, customCommands: [...app.customCommands, newCmd] }
    this.config.set('apps', newApps)
    return newCmd
  }
}
