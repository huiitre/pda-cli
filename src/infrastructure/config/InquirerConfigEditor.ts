import { select, input, confirm, number } from '@inquirer/prompts'
import chalk from 'chalk'
import type { IConfigEditor, ConfigEditableField } from '../../application/ports/IConfigEditor.js'

const QUIT_KEY = '__quit__'

function formatCurrentValue(value: string | boolean | number | null): string {
  if (value === null || value === '') return chalk.dim('(non défini)')
  if (typeof value === 'boolean') return value ? chalk.green('activé') : chalk.red('désactivé')
  return chalk.cyan(String(value))
}

export class InquirerConfigEditor implements IConfigEditor {
  async prompt(fields: ConfigEditableField[]): Promise<Record<string, string | boolean | number | null> | null> {
    const changes: Record<string, string | boolean | number | null> = {}

    console.log(chalk.bold('\n  Configuration\n'))

    while (true) {
      const fieldsWithCurrentValues = fields.map((f) => ({
        ...f,
        currentValue: f.key in changes ? changes[f.key] : f.currentValue,
      }))

      let selected: string
      try {
        selected = await select<string>({
          message: 'Paramètre à modifier :',
          choices: [
            ...fieldsWithCurrentValues.map((f) => ({
              name: `${f.label.padEnd(45)} ${formatCurrentValue(f.currentValue)}`,
              value: f.key,
              description: chalk.dim(f.description),
            })),
            { name: chalk.dim('Quitter'), value: QUIT_KEY },
          ],
        })
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') break
        throw err
      }

      if (selected === QUIT_KEY) break

      const field = fieldsWithCurrentValues.find((f) => f.key === selected)!
      const currentValue = field.currentValue

      try {
        let newValue: string | boolean | number | null

        if (field.type === 'boolean') {
          newValue = await confirm({
            message: field.label,
            default: typeof currentValue === 'boolean' ? currentValue : false,
          })
        } else if (field.type === 'number') {
          const raw = await number({
            message: field.label,
            default: typeof currentValue === 'number' ? currentValue : undefined,
          })
          newValue = raw ?? null
        } else {
          if (currentValue !== null && currentValue !== '') {
            console.log(chalk.dim(`  Actuel : ${currentValue}\n`))
          }
          const raw = await input({
            message: field.label,
            default: currentValue !== null ? String(currentValue) : '',
          })
          newValue = raw.trim() === '' ? null : raw.trim()
        }

        changes[field.key] = newValue
        console.log(chalk.green(`  ✓ ${field.label} → ${formatCurrentValue(newValue)}\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') continue
        throw err
      }
    }

    return Object.keys(changes).length > 0 ? changes : null
  }
}
