import type { App, AppEditableFields } from '../../domain/app/App.js'
import type { ConfigService } from '../services/ConfigService.js'

export class EditPackageUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(id: string, changes: Partial<AppEditableFields>): App {
    const apps = this.configService.get('apps')
    const index = apps.findIndex((a) => a.id === id)

    if (index === -1) throw new Error(`Package "${id}" introuvable`)

    const updated: App = { ...apps[index], ...changes }
    const newApps = [...apps]
    newApps[index] = updated
    this.configService.set('apps', newApps)
    return updated
  }
}
