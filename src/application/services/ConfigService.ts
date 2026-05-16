import type { AppConfig } from '../../domain/config/AppConfig.js'
import type { IConfigRepository } from '../ports/IConfigRepository.js'

export class ConfigService {
  private config: AppConfig

  constructor(private readonly repo: IConfigRepository) {
    this.config = repo.load()
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value
    this.repo.save(this.config)
  }

  getAll(): Readonly<AppConfig> {
    return this.config
  }
}
