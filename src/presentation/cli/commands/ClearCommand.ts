import type { Command } from 'commander'
import chalk from 'chalk'
import { ShellBuildRunner } from '../../../infrastructure/shell/ShellBuildRunner.js'
import { ClearEMUseCase } from '../../../application/usecases/ClearEMUseCase.js'
import { selectDevice } from '../selectDevice.js'
import type { AppContext } from '../AppContext.js'

export function registerClearCommand(program: Command, ctx: AppContext): void {
  program
    .command('clear [model]')
    .alias('cl')
    .description("Effacer les données de l'application active et la relancer")
    .action(async (modelArg?: string) => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      const device = await selectDevice(ctx, modelArg, `PDA à nettoyer (${activeApp.name}) :`)
      if (!device) return

      console.log(chalk.bold(`\n  Nettoyage de "${activeApp.name}" sur ${device.model ?? device.serialNumber}...\n`))

      try {
        await new ClearEMUseCase(new ShellBuildRunner()).execute(
          activeApp.clearCommand,
          activeApp.launchCommand,
          device.serialNumber,
          activeApp.packageId,
        )
        console.log(chalk.green('  ✓ Application nettoyée et relancée\n'))
      } catch (err) {
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
