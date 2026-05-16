export interface IStreamRunner {
  stream(serial: string): Promise<void>
}
