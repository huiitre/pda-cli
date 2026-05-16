import { input } from '@inquirer/prompts'
import type { Command } from 'commander'
import chalk from 'chalk'
import type { AppContext } from '../AppContext.js'

export function registerDefaultCommand(program: Command, ctx: AppContext): void {
  program
    .command('default [model]')
    .alias('d')
    .description('Définit le modèle de PDA par défaut')
    .action(async (model?: string) => {
      const current = ctx.config.get('defaultPda')

      console.log(chalk.dim(`\nPDA par défaut actuel : ${chalk.white.bold(current)}\n`))

      if (model) {
        ctx.config.set('defaultPda', model.trim())
        console.log(chalk.green(`PDA par défaut enregistré : ${chalk.bold(model.trim())}\n`))
        return
      }

      try {
        const entered = await input({
          message: 'Nouveau modèle :',
          default: current,
        })

        const trimmed = entered.trim()
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
