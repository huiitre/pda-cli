import type { Device } from '../../domain/device/Device.js'

export interface IDeviceRepository {
  list(): Promise<Device[]>
}
