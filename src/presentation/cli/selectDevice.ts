import { select } from '@inquirer/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { AdbDeviceRepository } from '../../infrastructure/adb/AdbDeviceRepository.js'
import { AdbNotFoundError } from '../../infrastructure/adb/AdbRunner.js'
import { ListDevicesUseCase } from '../../application/usecases/ListDevicesUseCase.js'
import type { Device } from '../../domain/device/Device.js'
import type { AppContext } from './AppContext.js'

export function formatDevice(d: Device): string {
  const model = d.model ?? chalk.dim('Modèle inconnu')
  return `${model}  ${chalk.dim(d.serialNumber)}`
}

/**
 * Fetches connected devices, optionally filters by model, then prompts the user
 * to pick one if several match. Returns null on any early exit (no devices,
 * ADB missing, user pressed Ctrl+C).
 */
export async function selectDevice(
  ctx: AppContext,
  modelArg: string | undefined,
  promptMessage: string = 'PDA cible :',
): Promise<Device | null> {
  const spinner = ora('Recherche des appareils...').start()

  let devices: Device[]
  try {
    devices = await new ListDevicesUseCase(new AdbDeviceRepository(ctx.adbRunner)).execute()
  } catch (err) {
    spinner.stop()
    if (err instanceof AdbNotFoundError) {
      console.error(chalk.red(`\n  ${err.message}`))
      console.log(chalk.dim('  Installation → https://developer.android.com/tools/adb\n'))
      return null
    }
    throw err
  }

  spinner.stop()

  if (devices.length === 0) {
    console.error(chalk.red('\n  Aucun appareil connecté.\n'))
    return null
  }

  let candidates = devices
  if (modelArg) {
    const lower = modelArg.toLowerCase()
    const filtered = devices.filter((d) => d.model?.toLowerCase().includes(lower))
    if (filtered.length === 0) {
      console.log(chalk.yellow(`\n  Aucun appareil "${modelArg}" trouvé — affichage de tous les appareils.\n`))
    } else {
      candidates = filtered
    }
  }

  if (candidates.length === 1) {
    console.log(chalk.dim(`\n  Appareil : ${formatDevice(candidates[0])}\n`))
    return candidates[0]
  }

  const defaultPda = ctx.config.get('defaultPda').toLowerCase()
  const defaultDevice = candidates.find((d) => d.model?.toLowerCase().includes(defaultPda))

  let serial: string
  try {
    serial = await select<string>({
      message: promptMessage,
      default: defaultDevice?.serialNumber,
      choices: candidates.map((d) => ({ name: formatDevice(d), value: d.serialNumber })),
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'ExitPromptError') return null
    throw err
  }

  return candidates.find((d) => d.serialNumber === serial) ?? null
}
