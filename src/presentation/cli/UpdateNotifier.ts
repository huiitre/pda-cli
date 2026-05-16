import boxen from 'boxen'
import chalk from 'chalk'
import type { UpdateInfo } from '../../application/usecases/CheckUpdateUseCase.js'

export function displayUpdateNotification(info: UpdateInfo): void {
  if (!info.available || !info.latestVersion) return

  const message = [
    chalk.bold('Mise à jour disponible !'),
    `${chalk.dim(info.currentVersion)} → ${chalk.green.bold(info.latestVersion)}`,
    '',
    `Exécutez : ${chalk.cyan('npm install -g pda-cli@latest')}`,
  ].join('\n')

  console.log(boxen(message, {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'yellow',
  }))
}
