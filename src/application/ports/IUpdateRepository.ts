export interface IUpdateRepository {
  getLatestVersion(): Promise<string | null>
}
