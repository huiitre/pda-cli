import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { AppConfigSchema, DEFAULT_CONFIG, type AppConfig } from '../../domain/config/AppConfig.js'
import type { IConfigRepository } from '../../application/ports/IConfigRepository.js'
import { CONFIG_FILE } from '../paths.js'

export class JsonConfigRepository implements IConfigRepository {
  load(): AppConfig {
    this.ensureDirectoryExists()

    if (!existsSync(CONFIG_FILE)) {
      this.save(DEFAULT_CONFIG)
      return DEFAULT_CONFIG
    }

    try {
      const raw = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
      // Merge : valeurs existantes conservées, nouvelles clés → défaut, clés obsolètes → supprimées
      const merged = AppConfigSchema.parse(raw)
      this.save(merged)
      return merged
    } catch {
      // Config corrompue : on repart des défauts
      this.save(DEFAULT_CONFIG)
      return DEFAULT_CONFIG
    }
  }

  save(config: AppConfig): void {
    this.ensureDirectoryExists()
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
  }

  private ensureDirectoryExists(): void {
    const dir = dirname(CONFIG_FILE)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  }
}
