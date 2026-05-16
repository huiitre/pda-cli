import type { AppConfig } from '../../domain/config/AppConfig.js'

export interface IConfigRepository {
  load(): AppConfig
  save(config: AppConfig): void
}
