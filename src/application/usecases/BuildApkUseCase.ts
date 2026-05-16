import type { IBuildRunner } from '../ports/IBuildRunner.js'

export class BuildApkUseCase {
  constructor(private readonly runner: IBuildRunner) {}

  async execute(command: string, serial?: string, packageId?: string): Promise<void> {
    const cmd = command
      .replace(/\{serial\}/g, serial ?? '')
      .replace(/\{packageId\}/g, packageId ?? '')
    await this.runner.run(cmd)
  }
}
