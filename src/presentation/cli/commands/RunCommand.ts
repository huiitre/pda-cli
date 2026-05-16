import type { Command } from 'commander'
import chalk from 'chalk'
import { ShellBuildRunner } from '../../../infrastructure/shell/ShellBuildRunner.js'
import { RunPdaUseCase } from '../../../application/usecases/RunPdaUseCase.js'
import { selectDevice } from '../selectDevice.js'
import type { AppContext } from '../AppContext.js'

export function registerRunCommand(program: Command, ctx: AppContext): void {
  program
    .command('run [model]')
    .alias('r')
    .description("Compiler et déployer l'application active sur un PDA")
    .action(async (modelArg?: string) => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      const device = await selectDevice(ctx, modelArg, 'PDA cible :')
      if (!device) return

      console.log(chalk.bold(`\n  Déploiement de "${activeApp.name}" sur ${device.model ?? device.serialNumber}...\n`))

      try {
        await new RunPdaUseCase(new ShellBuildRunner()).execute(activeApp.runCommand, device.serialNumber)
        console.log(chalk.green('\n  ✓ Déploiement terminé\n'))
      } catch (err) {
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
