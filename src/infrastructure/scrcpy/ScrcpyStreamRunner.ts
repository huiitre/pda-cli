import { spawn } from 'child_process'
import type { IStreamRunner } from '../../application/ports/IStreamRunner.js'

export class ScrcpyNotFoundError extends Error {
  constructor() {
    super('"scrcpy" introuvable. Installez-le depuis https://github.com/Genymobile/scrcpy')
    this.name = 'ScrcpyNotFoundError'
  }
}

export class ScrcpyStreamRunner implements IStreamRunner {
  stream(serial: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const bin = process.platform === 'win32' ? 'scrcpy.exe' : 'scrcpy'
      const child = spawn(bin, ['-s', serial], {
        detached: true,
        stdio: 'ignore',
        // On Windows, SCRCPY_ADB env var can point to a specific adb binary
        ...(process.platform === 'win32' && process.env['ADB_PATH']
          ? { env: { ...process.env, SCRCPY_ADB: process.env['ADB_PATH'] } }
          : {}),
      })

      child.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ENOENT') reject(new ScrcpyNotFoundError())
        else reject(err)
      })

      child.once('spawn', () => {
        child.unref()
        resolve()
      })
    })
  }
}
