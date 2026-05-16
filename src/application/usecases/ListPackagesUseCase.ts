import type { App } from '../../domain/app/App.js'
import type { ConfigService } from '../services/ConfigService.js'

export interface PackageListResult {
  apps: App[]
  activeAppId: string | null
}

export class ListPackagesUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(): PackageListResult {
    return {
      apps: this.configService.get('apps'),
      activeAppId: this.configService.get('activeAppId'),
    }
  }
}
