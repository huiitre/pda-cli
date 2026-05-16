import { createWriteStream, mkdirSync } from 'fs'
import { dirname } from 'path'
import type { IExportRunner } from '../../application/ports/IExportRunner.js'
import type { AdbRunner } from './AdbRunner.js'

const DB_PATHS = [
  'databases',
  'app_webview/Default/databases/file__0',
]

export class DbNotFoundError extends Error {
  constructor() {
    super("Aucune base de données trouvée sur le PDA. L'application est-elle installée et a-t-elle été lancée au moins une fois ?")
    this.name = 'DbNotFoundError'
  }
}

export class AdbExportRunner implements IExportRunner {
  constructor(private readonly adb: AdbRunner) {}

  async export(serial: string, packageId: string, destFile: string): Promise<void> {
    const found = await this.findDb(serial, packageId)
    if (!found) throw new DbNotFoundError()

    mkdirSync(dirname(destFile), { recursive: true })

    const writeStream = createWriteStream(destFile)
    await this.adb.spawnBinary(
      ['-s', serial, 'exec-out', `run-as ${packageId} cat ${found.dbPath}/${found.dbFile}`],
      writeStream,
    )
  }

  private async findDb(
    serial: string,
    packageId: string,
  ): Promise<{ dbPath: string; dbFile: string } | null> {
    for (const dbPath of DB_PATHS) {
      try {
        const out = await this.adb.exec(
          ['-s', serial, 'shell', `run-as ${packageId} ls ${dbPath} | grep -v '-'`],
          10_000,
        )
        const file = out.trim().split('\n').map((l) => l.trim()).filter(Boolean)[0]
        if (file) return { dbPath, dbFile: file }
      } catch {
        // path doesn't exist or app not installed — try next
      }
    }
    return null
  }
}
