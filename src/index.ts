import { createRequire } from 'module'
import { program } from 'commander'
import { JsonConfigRepository } from './infrastructure/config/JsonConfigRepository.js'
import { NpmRegistryAdapter } from './infrastructure/update/NpmRegistryAdapter.js'
import { AdbRunner } from './infrastructure/adb/AdbRunner.js'
import { ConfigService } from './application/services/ConfigService.js'
import { LogService } from './application/services/LogService.js'
import { CheckUpdateUseCase } from './application/usecases/CheckUpdateUseCase.js'
import { CommandRegistry } from './presentation/cli/CommandRegistry.js'
import { displayUpdateNotification } from './presentation/cli/UpdateNotifier.js'

const require = createRequire(import.meta.url)
const { version } = require('../package.json') as { version: string }

const configService = new ConfigService(new JsonConfigRepository())
const logger = new LogService(configService)
const adbRunner = new AdbRunner(configService.get('adbPath') ?? undefined)

logger.debug('pda-cli starting', { version })

checkUpdate().catch(() => undefined)

program
  .name('pda')
  .description('CLI tool for Android PDA development — ADB, Cordova, EasyMobile')
  .version(version, '-v, --version')

const registry = new CommandRegistry(program, { config: configService, logger, adbRunner, version })
registry.register()

program.parse()

async function checkUpdate(): Promise<void> {
  const info = await new CheckUpdateUseCase(new NpmRegistryAdapter(), configService).execute(version)
  displayUpdateNotification(info)
}
