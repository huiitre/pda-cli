import { input } from '@inquirer/prompts'
import type { Command } from 'commander'
import chalk from 'chalk'
import type { AppContext } from '../AppContext.js'

export function registerDefaultCommand(program: Command, ctx: AppContext): void {
  program
    .command('default')
    .alias('d')
    .description('Définit le modèle de PDA par défaut')
    .action(async () => {
      const current = ctx.config.get('defaultPda')

      console.log(chalk.dim(`\nPDA par défaut actuel : ${chalk.white.bold(current)}\n`))

      try {
        const model = await input({
          message: 'Nouveau modèle :',
          default: current,
        })

        const trimmed = model.trim()
        if (trimmed) {
          ctx.config.set('defaultPda', trimmed)
          console.log(chalk.green(`\nPDA par défaut enregistré : ${chalk.bold(trimmed)}\n`))
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }
    })
}
