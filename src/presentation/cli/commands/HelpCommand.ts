import type { Command } from 'commander'
import chalk from 'chalk'
import type { AppContext } from '../AppContext.js'

function row(name: string, args: string, desc: string, hint?: string): string {
  const visibleLen = name.length + (args ? 1 + args.length : 0)
  const padding = ' '.repeat(Math.max(2, 22 - visibleLen))
  const hintStr = hint ? chalk.dim(`  [${hint}]`) : ''
  return `    ${chalk.cyan(name)}${args ? ' ' + chalk.dim(args) : ''}${padding}${desc}${hintStr}`
}

function hasSubCommands(program: Command, name: string): boolean {
  const cmd = program.commands.find((c) => c.name() === name)
  return !!cmd && cmd.commands.filter((c) => c.name() !== 'help').length > 0
}

function section(title: string): string {
  return `\n  ${chalk.bold(title)}\n`
}

export function buildCustomHelp(version: string, program?: Command): string {
  const hint = (name: string) => program && hasSubCommands(program, name) ? `pda ${name} help` : undefined
  return [
    '',
    `  ${chalk.bold('pda')}  ${chalk.dim('v' + version + '  —  CLI tool for Android PDA development')}`,
    section('Déploiement'),
    row('run', '[model]', "Compiler et déployer l'app active"),
    row('build', '', 'Builder l\'APK (debug ou release)'),
    section('Gestion PDA'),
    row('stream', '[model]', 'Streamer l\'écran via scrcpy'),
    row('clear', '[model]', 'Effacer les données et relancer'),
    row('uninstall', '[model]', "Désinstaller l'app"),
    section('Commandes personnalisées'),
    row('custom', '[name]', "Exécuter une commande personnalisée"),
    section('Appareils & Configuration'),
    row('list', '', 'Lister les PDA connectés'),
    row('default', '[model]', 'Définir le PDA par défaut'),
    row('config', '', 'Modifier la configuration'),
    row('package', '', 'Gérer les applications configurées', hint('package')),
    section('Infos'),
    row('version', '', 'Afficher la version'),
    row('help', '[command]', 'Afficher cette aide'),
    '',
  ].join('\n')
}

export function registerHelpCommand(program: Command, ctx: AppContext): void {
  program
    .command('help [command]')
    .description('Afficher cette aide')
    .action((commandName?: string) => {
      if (!commandName) {
        console.log(buildCustomHelp(ctx.version, program))
        return
      }

      const cmd = program.commands.find(
        (c) => c.name() === commandName || c.aliases().includes(commandName),
      )

      if (cmd) {
        cmd.help()
      } else {
        console.error(chalk.red(`\n  Commande inconnue : "${commandName}"\n`))
        console.log(buildCustomHelp(ctx.version))
      }
    })
}
