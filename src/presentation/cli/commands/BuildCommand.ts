import { select } from '@inquirer/prompts'
import type { Command } from 'commander'
import chalk from 'chalk'
import { ShellBuildRunner } from '../../../infrastructure/shell/ShellBuildRunner.js'
import { BuildApkUseCase } from '../../../application/usecases/BuildApkUseCase.js'
import type { AppContext } from '../AppContext.js'

type BuildType = 'debug' | 'release'

export function registerBuildCommand(program: Command, ctx: AppContext): void {
  program
    .command('build')
    .alias('b')
    .description("Builder l'APK de l'application active (debug ou release)")
    .action(async () => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      let buildType: BuildType
      try {
        buildType = await select<BuildType>({
          message: 'Type de build :',
          choices: [
            { name: 'Debug', value: 'debug' },
            { name: 'Release', value: 'release' },
          ],
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }

      const command = buildType === 'debug' ? activeApp.buildDebugCommand : activeApp.buildReleaseCommand
      console.log(chalk.bold(`\n  Build ${buildType} de "${activeApp.name}"...\n`))

      try {
        await new BuildApkUseCase(new ShellBuildRunner()).execute(command, undefined, activeApp.packageId)
        console.log(chalk.green(`\n  ✓ Build ${buildType} terminé\n`))
      } catch (err) {
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })
}
