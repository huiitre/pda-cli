import type { Device } from '../../domain/device/Device.js'
import type { IDeviceRepository } from '../../application/ports/IDeviceRepository.js'
import type { AdbRunner } from './AdbRunner.js'

const BATCH_COMMAND = [
  'echo "__MODEL__=$(getprop ro.product.model)"',
  'echo "__ANDROID__=$(getprop ro.build.version.release)"',
  'dumpsys package net.distrilog.easymobile 2>/dev/null | grep versionName= || true',
].join('; ')

export class AdbDeviceRepository implements IDeviceRepository {
  constructor(private readonly adb: AdbRunner) {}

  async list(): Promise<Device[]> {
    await this.adb.exec(['devices']).catch(() => undefined)

    const output = await this.adb.exec(['devices', '-l'])
    const serials = this.parseSerials(output)

    if (serials.length === 0) return []

    return Promise.all(serials.map(s => this.fetchDevice(s)))
  }

  private parseSerials(output: string): string[] {
    return output
      .split('\n')
      .slice(1)
      .filter(line => /^\S+\s+device(\s|$)/.test(line))
      .map(line => line.trim().split(/\s+/)[0])
      .filter(Boolean)
  }

  private async fetchDevice(serialNumber: string): Promise<Device> {
    try {
      const out = await this.adb.exec(
        ['-s', serialNumber, 'shell', BATCH_COMMAND],
        7000,
      )
      const lines = out.split('\n')
      const get = (prefix: string) =>
        lines.find(l => l.startsWith(prefix))?.split('=')[1]?.trim() ?? null

      return {
        serialNumber,
        model: get('__MODEL__'),
        androidVersion: get('__ANDROID__'),
        emVersion: lines.find(l => l.includes('versionName='))?.split('versionName=')[1]?.trim() ?? null,
      }
    } catch {
      return { serialNumber, model: null, androidVersion: null, emVersion: null }
    }
  }
}
