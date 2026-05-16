import type { Device } from '../../domain/device/Device.js'
import type { IDeviceRepository } from '../ports/IDeviceRepository.js'

export class ListDevicesUseCase {
  constructor(private readonly repo: IDeviceRepository) {}

  async execute(packageId?: string): Promise<Device[]> {
    return this.repo.list(packageId)
  }
}
