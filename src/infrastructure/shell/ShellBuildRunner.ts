import { spawn } from 'child_process'
import type { IBuildRunner } from '../../application/ports/IBuildRunner.js'

export class ShellBuildRunner implements IBuildRunner {
  run(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, { stdio: 'inherit', shell: true })

      const onSigint = () => child.kill('SIGINT')
      process.on('SIGINT', onSigint)

      child.on('close', (code) => {
        process.off('SIGINT', onSigint)
        if (code === 0 || code === null) resolve()
        else reject(new Error(`La commande a retourné le code ${code}`))
      })

      child.on('error', (err: NodeJS.ErrnoException) => {
        process.off('SIGINT', onSigint)
        if (err.code === 'ENOENT') {
          const bin = command.split(' ')[0]
          reject(new Error(`"${bin}" introuvable. Vérifiez que l'outil est installé et dans votre PATH.`))
        } else {
          reject(err)
        }
      })
    })
  }
}
