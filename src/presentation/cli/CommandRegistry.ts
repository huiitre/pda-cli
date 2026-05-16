import type { Command } from 'commander'
import chalk from 'chalk'
import { registerListCommand } from './commands/ListCommand.js'
import { registerVersionCommand } from './commands/VersionCommand.js'
import { registerHelpCommand } from './commands/HelpCommand.js'
import { registerDefaultCommand } from './commands/DefaultCommand.js'
import { registerConfigCommand } from './commands/ConfigCommand.js'
import { registerPackageCommand } from './commands/PackageCommand.js'
import { registerRunCommand } from './commands/RunCommand.js'
import { registerStreamCommand } from './commands/StreamCommand.js'
import { registerClearCommand } from './commands/ClearCommand.js'
import { registerUninstallCommand } from './commands/UninstallCommand.js'
import { registerExportCommand } from './commands/ExportCommand.js'
import { registerBuildCommand } from './commands/BuildCommand.js'
import type { AppContext } from './AppContext.js'

export class CommandRegistry {
  constructor(
    private readonly program: Command,
    private readonly ctx: AppContext,
  ) {}

  register(): void {
    this.program.usage('[command] [options]')
    registerRunCommand(this.program, this.ctx)
    registerStreamCommand(this.program, this.ctx)
    registerClearCommand(this.program, this.ctx)
    registerUninstallCommand(this.program, this.ctx)
    registerExportCommand(this.program, this.ctx)
    registerBuildCommand(this.program, this.ctx)
    registerListCommand(this.program, this.ctx)
    registerDefaultCommand(this.program, this.ctx)
    registerConfigCommand(this.program, this.ctx)
    registerPackageCommand(this.program, this.ctx)
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
