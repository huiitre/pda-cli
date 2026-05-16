import type { IUpdateRepository } from '../ports/IUpdateRepository.js'
import type { ConfigService } from '../services/ConfigService.js'

function isNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map(Number)
  const [lMaj, lMin, lPatch] = parse(latest)
  const [cMaj, cMin, cPatch] = parse(current)
  if (lMaj !== cMaj) return lMaj > cMaj
  if (lMin !== cMin) return lMin > cMin
  return lPatch > cPatch
}

export interface UpdateInfo {
  available: boolean
  currentVersion: string
  latestVersion: string | null
}

export class CheckUpdateUseCase {
  constructor(
    private readonly repo: IUpdateRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(currentVersion: string): Promise<UpdateInfo> {
    const intervalHours = this.config.get('updateCheckIntervalHours')
    const lastCheck = this.config.get('lastUpdateCheck')
    const cachedLatest = this.config.get('latestVersion')

    const shouldFetch = !lastCheck || !cachedLatest ||
      (Date.now() - new Date(lastCheck).getTime()) > intervalHours * 60 * 60 * 1000

    let latestVersion = cachedLatest

    if (shouldFetch) {
      latestVersion = await this.repo.getLatestVersion()
      this.config.set('lastUpdateCheck', new Date().toISOString())
      this.config.set('latestVersion', latestVersion)
    }

    return {
      available: latestVersion != null && isNewer(latestVersion, currentVersion),
      currentVersion,
      latestVersion,
    }
  }
}
