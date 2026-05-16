import type { Device } from '../../domain/device/Device.js'

export interface IDeviceRepository {
  list(packageId?: string): Promise<Device[]>
}
