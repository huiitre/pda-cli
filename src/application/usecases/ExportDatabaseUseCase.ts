import type { IExportRunner } from '../ports/IExportRunner.js'

export class ExportDatabaseUseCase {
  constructor(private readonly exportRunner: IExportRunner) {}

  async execute(serial: string, packageId: string, destFile: string): Promise<void> {
    await this.exportRunner.export(serial, packageId, destFile)
  }
}
