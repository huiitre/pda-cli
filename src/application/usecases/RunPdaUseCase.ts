import type { IBuildRunner } from '../ports/IBuildRunner.js'

export class RunPdaUseCase {
  constructor(private readonly buildRunner: IBuildRunner) {}

  async execute(runCommand: string, serial: string): Promise<void> {
    const command = runCommand.replace(/\{serial\}/g, serial)
    await this.buildRunner.run(command)
  }
}
