import type { Command } from 'commander'
import type { AppContext } from '../AppContext.js'

export function registerHelpCommand(program: Command, _ctx: AppContext): void {
  program
    .command('help')
    .description('Affiche la liste des commandes disponibles')
    .action(() => {
      program.help()
    })
}
