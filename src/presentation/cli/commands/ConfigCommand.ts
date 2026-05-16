import type { Command } from 'commander'
import chalk from 'chalk'
import { EditConfigUseCase } from '../../../application/usecases/EditConfigUseCase.js'
import type { AppContext } from '../AppContext.js'

export function registerConfigCommand(program: Command, ctx: AppContext): void {
  program
    .command('config')
    .alias('c')
    .description('Modifier la configuration de manière interactive')
    .action(async () => {
      const useCase = new EditConfigUseCase(ctx.config, ctx.configEditor)
      try {
        await useCase.execute()
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        console.error(chalk.red('\nErreur lors de la configuration\n'))
        throw err
      }
    })
}
