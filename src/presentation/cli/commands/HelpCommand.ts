import type { Command } from 'commander'
import chalk from 'chalk'
import type { AppContext } from '../AppContext.js'

export function registerHelpCommand(program: Command, _ctx: AppContext): void {
  program
    .command('help [command]')
    .description('Affiche la liste des commandes disponibles')
    .action((commandName?: string) => {
      if (!commandName) {
        program.help()
      }

      const cmd = program.commands.find(
        (c) => c.name() === commandName || c.aliases().includes(commandName),
      )

      if (cmd) {
        cmd.help()
      } else {
        console.error(chalk.red(`\nCommande inconnue : "${commandName}"\n`))
        program.help({ error: true })
      }
    })
}
