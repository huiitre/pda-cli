import type { Command } from 'commander'
import chalk from 'chalk'
import { registerListCommand } from './commands/ListCommand.js'
import { registerVersionCommand } from './commands/VersionCommand.js'
import { registerHelpCommand, buildCustomHelp } from './commands/HelpCommand.js'
import { registerDefaultCommand } from './commands/DefaultCommand.js'
import { registerConfigCommand } from './commands/ConfigCommand.js'
import { registerPackageCommand } from './commands/PackageCommand.js'
import { registerRunCommand } from './commands/RunCommand.js'
import { registerStreamCommand } from './commands/StreamCommand.js'
import { registerClearCommand } from './commands/ClearCommand.js'
import { registerUninstallCommand } from './commands/UninstallCommand.js'
import { registerBuildCommand } from './commands/BuildCommand.js'
import { registerCustomCommand } from './commands/CustomCommand.js'
import type { AppContext } from './AppContext.js'

function getParentNames(cmd: Command): string[] {
  const names: string[] = []
  let current = cmd.parent
  while (current?.parent) {
    names.unshift(current.name())
    current = current.parent
  }
  return names
}

export class CommandRegistry {
  constructor(
    private readonly program: Command,
    private readonly ctx: AppContext,
  ) {}

  register(): void {
    this.program.usage('[command]')
    this.program.configureHelp({
      formatHelp: (cmd, helper) => {
        if (!cmd.parent) return buildCustomHelp(this.ctx.version, this.program) + '\n'
        const pad = helper.padWidth(cmd, helper) + 2
        const desc = cmd.description() ? `\n  ${cmd.description()}\n` : ''
        const usage = `\n  ${chalk.dim('Usage:')} pda ${chalk.cyan(cmd.name())} ${chalk.dim(cmd.usage())}\n`
        const opts = helper.visibleOptions(cmd)
          .filter((o) => o.long !== '--help')
          .map((o) => `    ${chalk.cyan(helper.optionTerm(o).padEnd(pad))}  ${chalk.dim(helper.optionDescription(o))}`)
          .join('\n')
        const subs = helper.visibleCommands(cmd)
          .filter((c) => c.name() !== 'help')
          .map((c) => {
            const hasSubCommands = c.commands.filter((s) => s.name() !== 'help').length > 0
            const hint = hasSubCommands ? chalk.dim('  [pda ' + [...getParentNames(c), c.name()].join(' ') + ' help]') : ''
            return `    ${chalk.cyan(helper.subcommandTerm(c).padEnd(pad))}  ${helper.subcommandDescription(c)}${hint}`
          })
          .join('\n')
        return [
          '',
          desc,
          usage,
          opts ? `\n  ${chalk.bold('Options')}\n${opts}\n` : '',
          subs ? `\n  ${chalk.bold('Commandes')}\n${subs}\n` : '',
          '',
        ].join('')
      },
    })
    registerRunCommand(this.program, this.ctx)
    registerStreamCommand(this.program, this.ctx)
    registerClearCommand(this.program, this.ctx)
    registerUninstallCommand(this.program, this.ctx)
    registerBuildCommand(this.program, this.ctx)
    registerCustomCommand(this.program, this.ctx)
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
          console.error(chalk.red(`\n  Commande introuvable : "${unknown}"\n`))
        }
        console.log(buildCustomHelp(this.ctx.version, this.program))
        process.exit(unknown ? 1 : 0)
      })
  }
}
