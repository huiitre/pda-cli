import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { ConfigService } from './ConfigService.js'
import { LOGS_DIR } from '../../infrastructure/paths.js'

export class LogService {
  constructor(private readonly config: ConfigService) {}

  debug(message: string, data?: unknown): void {
    if (!this.config.get('debugEnabled')) return
    const line = this.format('DEBUG', message, data)
    process.stdout.write(line + '\n')
    this.write(line)
  }

  info(message: string, data?: unknown): void {
    this.write(this.format('INFO', message, data))
  }

  error(message: string, error?: unknown): void {
    const line = this.format('ERROR', message, error instanceof Error ? error.message : error)
    process.stderr.write(line + '\n')
    this.write(line)
  }

  private format(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const suffix = data !== undefined ? ` — ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] ${message}${suffix}`
  }

  private write(line: string): void {
    try {
      if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true })
      const date = new Date().toISOString().slice(0, 10)
      appendFileSync(join(LOGS_DIR, `pda-cli-${date}.log`), line + '\n', 'utf-8')
    } catch {
      // Silencieux : un échec de log ne doit jamais planter la CLI
    }
  }
}
