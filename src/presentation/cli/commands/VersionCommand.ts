import type { Command } from 'commander'
import type { AppContext } from '../AppContext.js'

export function registerVersionCommand(program: Command, ctx: AppContext): void {
  program
    .command('version')
    .description('Affiche la version de pda-cli')
    .action(() => {
      console.log(ctx.version)
    })
}
