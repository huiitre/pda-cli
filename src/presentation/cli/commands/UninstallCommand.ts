import type { Command } from 'commander'
import chalk from 'chalk'
import { ShellBuildRunner } from '../../../infrastructure/shell/ShellBuildRunner.js'
import { UninstallEMUseCase } from '../../../application/usecases/UninstallEMUseCase.js'
import { selectDevice } from '../selectDevice.js'
import type { AppContext } from '../AppContext.js'

export function registerUninstallCommand(program: Command, ctx: AppContext): void {
  program
    .command('uninstall [model]')
    .alias('u')
    .description("Désinstaller l'application active d'un PDA")
    .action(async (modelArg?: string) => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      const device = await selectDevice(ctx, modelArg, `PDA à désinstaller (${activeApp.name}) :`)
      if (!device) return

      console.log(chalk.bold(`\n  Désinstallation de "${activeApp.name}" sur ${device.model ?? device.serialNumber}...\n`))

      try {
        await new UninstallEMUseCase(new ShellBuildRunner()).execute(
          activeApp.uninstallCommand,
          device.serialNumber,
          activeApp.packageId,
        )
        console.log(chalk.green('  ✓ Application désinstallée\n'))
      } catch (err) {
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
