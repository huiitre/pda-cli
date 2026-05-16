import type { Command } from 'commander'
import chalk from 'chalk'
import { ScrcpyStreamRunner, ScrcpyNotFoundError } from '../../../infrastructure/scrcpy/ScrcpyStreamRunner.js'
import { StreamPdaUseCase } from '../../../application/usecases/StreamPdaUseCase.js'
import { selectDevice } from '../selectDevice.js'
import type { AppContext } from '../AppContext.js'

export function registerStreamCommand(program: Command, ctx: AppContext): void {
  program
    .command('stream [model]')
    .alias('s')
    .description("Streamer l'écran d'un PDA via scrcpy")
    .action(async (modelArg?: string) => {
      const device = await selectDevice(ctx, modelArg, 'PDA à streamer :')
      if (!device) return

      try {
        await new StreamPdaUseCase(new ScrcpyStreamRunner()).execute(device.serialNumber)
        console.log(chalk.green(`\n  ✓ Stream démarré pour ${device.model ?? device.serialNumber}\n`))
      } catch (err) {
        if (err instanceof ScrcpyNotFoundError) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
