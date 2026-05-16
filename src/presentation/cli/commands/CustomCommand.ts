import { select } from '@inquirer/prompts'
import type { Command } from 'commander'
import chalk from 'chalk'
import { ShellBuildRunner } from '../../../infrastructure/shell/ShellBuildRunner.js'
import { RunCustomCommandUseCase } from '../../../application/usecases/RunCustomCommandUseCase.js'
import { selectDevice } from '../selectDevice.js'
import type { AppContext } from '../AppContext.js'

export function registerCustomCommand(program: Command, ctx: AppContext): void {
  program
    .command('custom [name]')
    .alias('x')
    .description("Exécuter une commande personnalisée de l'application active")
    .action(async (nameArg?: string) => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      if (activeApp.customCommands.length === 0) {
        console.error(chalk.red('\n  Aucune commande personnalisée configurée. Utilisez `pda package commands add`.\n'))
        return
      }

      let commandId: string

      if (nameArg) {
        const lower = nameArg.toLowerCase()
        const found = activeApp.customCommands.find((c) => c.name.toLowerCase() === lower)
        if (!found) {
          console.error(chalk.red(`\n  Commande "${nameArg}" introuvable dans "${activeApp.name}".\n`))
          return
        }
        commandId = found.id
      } else {
        try {
          commandId = await select<string>({
            message: 'Commande à exécuter :',
            choices: activeApp.customCommands.map((c) => ({
              name: c.name,
              value: c.id,
              description: chalk.dim(c.command),
            })),
          })
        } catch (err) {
          if (err instanceof Error && err.name === 'ExitPromptError') return
          throw err
        }
      }

      const cmd = activeApp.customCommands.find((c) => c.id === commandId)!
      const needsDevice = cmd.command.includes('{serial}')

      let serial: string | undefined
      if (needsDevice) {
        const device = await selectDevice(ctx, undefined, `PDA cible (${cmd.name}) :`)
        if (!device) return
        serial = device.serialNumber
      }

      console.log(chalk.bold(`\n  ${cmd.name}...\n`))

      try {
        await new RunCustomCommandUseCase(new ShellBuildRunner()).execute(cmd.command, serial, activeApp.packageId)
        console.log(chalk.green(`\n  ✓ ${cmd.name} terminé\n`))
      } catch (err) {
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
