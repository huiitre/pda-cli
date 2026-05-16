import { spawn } from 'child_process'

export class AdbNotFoundError extends Error {
  constructor() {
    super("ADB introuvable. Installez Android SDK Platform Tools et assurez-vous qu'adb est dans votre PATH.")
    this.name = 'AdbNotFoundError'
  }
}

export class AdbRunner {
  constructor(private readonly adbBin: string = 'adb') {}

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
