import type { App } from '../../domain/app/App.js'
import type { ConfigService } from '../services/ConfigService.js'

export class UsePackageUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(idOrName: string): App {
    const apps = this.configService.get('apps')
    const lower = idOrName.toLowerCase()
    const app = apps.find(
      (a) => a.id === idOrName || a.name.toLowerCase() === lower || a.packageId === idOrName,
    )

    if (!app) throw new Error(`Package "${idOrName}" introuvable`)

    this.configService.set('activeAppId', app.id)
    return app
  }
}
