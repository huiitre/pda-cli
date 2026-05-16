import type { IUpdateRepository } from '../../application/ports/IUpdateRepository.js'

const REGISTRY_URL = 'https://registry.npmjs.org/pda-cli/latest'
const TIMEOUT_MS = 2000

export class NpmRegistryAdapter implements IUpdateRepository {
  async getLatestVersion(): Promise<string | null> {
    try {
      const response = await fetch(REGISTRY_URL, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!response.ok) return null
      const data = await response.json() as { version: string }
      return data.version ?? null
    } catch {
      return null
    }
  }
}
