import { spawn } from 'child_process'
import type { Writable } from 'stream'

export class AdbNotFoundError extends Error {
  constructor() {
    super("ADB introuvable. Installez Android SDK Platform Tools et assurez-vous qu'adb est dans votre PATH.")
    this.name = 'AdbNotFoundError'
  }
}

export class AdbRunner {
  constructor(private readonly adbBin: string = 'adb') {}

  spawnBinary(args: string[], outStream: Writable, timeoutMs = 30_000): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.adbBin, args, { stdio: ['ignore', 'pipe', 'pipe'], timeout: timeoutMs })

      child.stdout.pipe(outStream)

      let stderr = ''
      child.stderr.on('data', (d: Buffer) => (stderr += d.toString()))

      outStream.on('error', (err) => { child.kill(); reject(err) })

      child.on('close', (code) => {
        if (code !== 0 && stderr.trim()) reject(new Error(stderr.trim()))
        else resolve()
      })

      child.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ENOENT') reject(new AdbNotFoundError())
        else reject(err)
      })
    })
  }

  exec(args: string[], timeoutMs = 5000): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.adbBin, args, { timeout: timeoutMs })
      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (d: Buffer) => (stdout += d.toString()))
      child.stderr.on('data', (d: Buffer) => (stderr += d.toString()))

      child.on('close', (code: number | null) => {
        if (code !== 0 && !stdout.trim())
          reject(new Error(stderr.trim() || `adb a retourné le code ${code}`))
        else
          resolve(stdout)
      })

      child.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'ENOENT') reject(new AdbNotFoundError())
        else reject(err)
      })
    })
  }
}
