export interface IExportRunner {
  export(serial: string, packageId: string, destFile: string): Promise<void>
}
