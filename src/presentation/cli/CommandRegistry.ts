import type { Command } from 'commander'
import chalk from 'chalk'
import { registerListCommand } from './commands/ListCommand.js'
import { registerVersionCommand } from './commands/VersionCommand.js'
import { registerHelpCommand } from './commands/HelpCommand.js'
import { registerDefaultCommand } from './commands/DefaultCommand.js'
import type { AppContext } from './AppContext.js'

export class CommandRegistry {
  constructor(
    private readonly program: Command,
    private readonly ctx: AppContext,
  ) {}

  register(): void {
    this.program.usage('[command] [options]')
    registerListCommand(this.program, this.ctx)
    registerDefaultCommand(this.program, this.ctx)
    registerVersionCommand(this.program, this.ctx)
    registerHelpCommand(this.program, this.ctx)

    this.program
      .allowExcessArguments(true)
      .allowUnknownOption(true)
      .action(() => {
        const unknown = process.argv[2]
        if (unknown) {
          console.error(chalk.red(`\nCommande introuvable : "${unknown}"\n`))
          this.program.help({ error: true })
        } else {
          this.program.help()
        }
      })
  }
}
