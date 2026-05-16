import type { Device } from '../../domain/device/Device.js'
import type { IDeviceRepository } from '../../application/ports/IDeviceRepository.js'
import type { AdbRunner } from './AdbRunner.js'

function buildBatchCommand(packageId?: string): string {
  const parts = [
    'echo "__MODEL__=$(getprop ro.product.model)"',
    'echo "__ANDROID__=$(getprop ro.build.version.release)"',
  ]
  if (packageId) {
    parts.push(`dumpsys package ${packageId} 2>/dev/null | grep versionName= || true`)
  }
  return parts.join('; ')
}

export class AdbDeviceRepository implements IDeviceRepository {
  constructor(private readonly adb: AdbRunner) {}

  async list(packageId?: string): Promise<Device[]> {
    await this.adb.exec(['devices']).catch(() => undefined)

    const output = await this.adb.exec(['devices', '-l'])
    const serials = this.parseSerials(output)

    if (serials.length === 0) return []

    return Promise.all(serials.map((s) => this.fetchDevice(s, packageId)))
  }

  private parseSerials(output: string): string[] {
    return output
      .split('\n')
      .slice(1)
      .filter((line) => /^\S+\s+device(\s|$)/.test(line))
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean)
  }

  private async fetchDevice(serialNumber: string, packageId?: string): Promise<Device> {
    try {
      const out = await this.adb.exec(
        ['-s', serialNumber, 'shell', buildBatchCommand(packageId)],
        7000,
      )
      const lines = out.split('\n')
      const get = (prefix: string) =>
        lines.find((l) => l.startsWith(prefix))?.split('=')[1]?.trim() ?? null

      return {
        serialNumber,
        model: get('__MODEL__'),
        androidVersion: get('__ANDROID__'),
        appVersion: packageId
          ? (lines.find((l) => l.includes('versionName='))?.split('versionName=')[1]?.trim() ?? null)
          : null,
      }
    } catch {
      return { serialNumber, model: null, androidVersion: null, appVersion: null }
    }
  }
}
