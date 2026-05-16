import type { App, AppEditableFields } from '../../domain/app/App.js'
import type { ConfigService } from '../services/ConfigService.js'

function toId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export class AddPackageUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(fields: AppEditableFields): App {
    const apps = this.configService.get('apps')

    if (apps.some((a) => a.packageId === fields.packageId)) {
      throw new Error(`Le package "${fields.packageId}" est déjà configuré`)
    }

    const baseId = toId(fields.name)
    let id = baseId
    let counter = 1
    while (apps.some((a) => a.id === id)) {
      id = `${baseId}-${counter++}`
    }

    const newApp: App = { id, ...fields, customCommands: [] }
    this.configService.set('apps', [...apps, newApp])

    if (apps.length === 0) {
      this.configService.set('activeAppId', id)
    }

    return newApp
  }
}
