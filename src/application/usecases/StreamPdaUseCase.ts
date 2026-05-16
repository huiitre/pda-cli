import type { IStreamRunner } from '../ports/IStreamRunner.js'

export class StreamPdaUseCase {
  constructor(private readonly streamRunner: IStreamRunner) {}

  async execute(serial: string): Promise<void> {
    await this.streamRunner.stream(serial)
  }
}
