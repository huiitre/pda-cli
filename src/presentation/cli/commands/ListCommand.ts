import type { Command } from 'commander'
import Table from 'cli-table3'
import chalk from 'chalk'
import ora from 'ora'
import { AdbDeviceRepository } from '../../../infrastructure/adb/AdbDeviceRepository.js'
import { AdbNotFoundError } from '../../../infrastructure/adb/AdbRunner.js'
import { ListDevicesUseCase } from '../../../application/usecases/ListDevicesUseCase.js'
import type { AppContext } from '../AppContext.js'

export function registerListCommand(program: Command, ctx: AppContext): void {
  program
    .command('list')
    .alias('ls')
    .description('Liste les PDA connectés via ADB')
    .option('--json', 'Affiche la liste au format JSON')
    .action(async (options: { json?: boolean }) => {
      const spinner = ora('Recherche des appareils...').start()

      try {
        const activeAppId = ctx.config.get('activeAppId')
        const apps = ctx.config.get('apps')
        const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

        const useCase = new ListDevicesUseCase(new AdbDeviceRepository(ctx.adbRunner))
        const devices = await useCase.execute(activeApp?.packageId)
        spinner.stop()

        if (options.json) {
          console.log(JSON.stringify(devices, null, 2))
          return
        }

        if (devices.length === 0) {
          console.log(chalk.yellow('\nAucun appareil connecté.'))
          return
        }

        const headers = ['Modèle', 'Numéro de série']
        if (activeApp) headers.push(`Version ${activeApp.name}`)
        headers.push('Android')

        const table = new Table({
          head: headers.map((h) => chalk.cyan.bold(h)),
        })

        for (const d of devices) {
          const row = [
            d.model ?? chalk.dim('—'),
            d.serialNumber,
          ]
          if (activeApp) row.push(d.appVersion ?? chalk.dim('—'))
          row.push(d.androidVersion ?? chalk.dim('—'))
          table.push(row)
        }

        console.log(`\n${chalk.bold(`${devices.length} appareil(s) connecté(s) :`)}\n`)
        console.log(table.toString())

      } catch (err) {
        spinner.stop()
        if (err instanceof AdbNotFoundError) {
          console.error(chalk.red(`\n${err.message}`))
          console.log(chalk.dim('\nInstallation → https://developer.android.com/tools/adb'))
          process.exit(1)
        }
        throw err
      }
    })
}
