import type { Device } from '../../domain/device/Device.js'
import type { IDeviceRepository } from '../ports/IDeviceRepository.js'

export class ListDevicesUseCase {
  constructor(private readonly repo: IDeviceRepository) {}

  async execute(): Promise<Device[]> {
    return this.repo.list()
  }
}
