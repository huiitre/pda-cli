import type { ConfigService } from '../../application/services/ConfigService.js'
import type { LogService } from '../../application/services/LogService.js'
import type { AdbRunner } from '../../infrastructure/adb/AdbRunner.js'

export interface AppContext {
  config: ConfigService
  logger: LogService
  adbRunner: AdbRunner
  version: string
}
