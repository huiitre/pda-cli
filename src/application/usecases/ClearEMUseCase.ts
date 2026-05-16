import type { IBuildRunner } from '../ports/IBuildRunner.js'

function substitute(command: string, serial: string, packageId: string): string {
  return command.replace(/\{serial\}/g, serial).replace(/\{packageId\}/g, packageId)
}

export class ClearEMUseCase {
  constructor(private readonly runner: IBuildRunner) {}

  async execute(clearCommand: string, launchCommand: string, serial: string, packageId: string): Promise<void> {
    await this.runner.run(substitute(clearCommand, serial, packageId))
    await this.runner.run(substitute(launchCommand, serial, packageId))
  }
}
