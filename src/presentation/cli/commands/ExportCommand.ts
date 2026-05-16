import { join } from 'path'
import type { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { AdbExportRunner, DbNotFoundError } from '../../../infrastructure/adb/AdbExportRunner.js'
import { ExportDatabaseUseCase } from '../../../application/usecases/ExportDatabaseUseCase.js'
import { DATABASE_DIR } from '../../../infrastructure/paths.js'
import { selectDevice } from '../selectDevice.js'
import type { AppContext } from '../AppContext.js'

export function registerExportCommand(program: Command, ctx: AppContext): void {
  program
    .command('export [model]')
    .alias('e')
    .description("Exporter la base de données SQLite de l'application active")
    .action(async (modelArg?: string) => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      const device = await selectDevice(ctx, modelArg, `PDA à exporter (${activeApp.name}) :`)
      if (!device) return

      const model = (device.model ?? device.serialNumber).replace(/\s+/g, '_')
      const destFile = join(DATABASE_DIR, model, `${model}_${device.serialNumber}`)

      const spinner = ora(`Export de la base de données depuis ${device.model ?? device.serialNumber}...`).start()

      try {
        await new ExportDatabaseUseCase(new AdbExportRunner(ctx.adbRunner)).execute(
          device.serialNumber,
          activeApp.packageId,
          destFile,
        )
        spinner.succeed(chalk.green(`Base exportée → ${destFile}`))
      } catch (err) {
        spinner.stop()
        if (err instanceof DbNotFoundError) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
