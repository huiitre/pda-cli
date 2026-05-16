import type { ConfigService } from '../services/ConfigService.js'

export class RemovePackageUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(id: string): void {
    const apps = this.configService.get('apps')
    const filtered = apps.filter((a) => a.id !== id)

    if (filtered.length === apps.length) {
      throw new Error(`Package "${id}" introuvable`)
    }

    this.configService.set('apps', filtered)

    if (this.configService.get('activeAppId') === id) {
      this.configService.set('activeAppId', filtered[0]?.id ?? null)
    }
  }
}
