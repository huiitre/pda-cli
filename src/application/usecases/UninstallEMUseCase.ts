import type { IBuildRunner } from '../ports/IBuildRunner.js'

export class UninstallEMUseCase {
  constructor(private readonly runner: IBuildRunner) {}

  async execute(uninstallCommand: string, serial: string, packageId: string): Promise<void> {
    const command = uninstallCommand
      .replace(/\{serial\}/g, serial)
      .replace(/\{packageId\}/g, packageId)
    await this.runner.run(command)
  }
}
