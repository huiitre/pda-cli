export interface IBuildRunner {
  run(command: string): Promise<void>
}
