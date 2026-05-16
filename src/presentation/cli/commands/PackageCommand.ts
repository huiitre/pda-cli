import { select, input } from '@inquirer/prompts'
import type { Command } from 'commander'
import chalk from 'chalk'
import type { App, AppEditableFields } from '../../../domain/app/App.js'
import { APP_FIELDS_META } from '../../../domain/app/AppFieldMeta.js'
import { ListPackagesUseCase } from '../../../application/usecases/ListPackagesUseCase.js'
import { AddPackageUseCase } from '../../../application/usecases/AddPackageUseCase.js'
import { RemovePackageUseCase } from '../../../application/usecases/RemovePackageUseCase.js'
import { UsePackageUseCase } from '../../../application/usecases/UsePackageUseCase.js'
import { EditPackageUseCase } from '../../../application/usecases/EditPackageUseCase.js'
import { AddCustomCommandUseCase } from '../../../application/usecases/AddCustomCommandUseCase.js'
import { EditCustomCommandUseCase } from '../../../application/usecases/EditCustomCommandUseCase.js'
import { RemoveCustomCommandUseCase } from '../../../application/usecases/RemoveCustomCommandUseCase.js'
import type { AppContext } from '../AppContext.js'

const QUIT_KEY = '__quit__'

// Prompts chaque champ éditable d'une app en s'appuyant sur APP_FIELDS_META.
// Retourne les valeurs saisies, ou null si annulé.
async function promptAppFields(current?: App): Promise<AppEditableFields | null> {
  const entries = Object.entries(APP_FIELDS_META) as [keyof AppEditableFields, (typeof APP_FIELDS_META)[keyof AppEditableFields]][]
  const result: Partial<AppEditableFields> = {}

  for (const [key, meta] of entries) {
    const defaultValue = current ? String(current[key]) : (meta.default ?? '')
    try {
      const value = await input({
        message: `${meta.label} :`,
        default: defaultValue,
      })
      if (!value.trim()) {
        console.log(chalk.yellow('\n  Annulé.\n'))
        return null
      }
      result[key] = value.trim()
    } catch (err) {
      if (err instanceof Error && err.name === 'ExitPromptError') return null
      throw err
    }
  }

  return result as AppEditableFields
}

// Prompt de sélection d'un champ pour l'édition (boucle ESC = retour).
async function promptEditField(app: App): Promise<Partial<AppEditableFields> | null> {
  const changes: Partial<AppEditableFields> = {}
  const entries = Object.entries(APP_FIELDS_META) as [keyof AppEditableFields, (typeof APP_FIELDS_META)[keyof AppEditableFields]][]

  while (true) {
    let selected: string
    try {
      selected = await select<string>({
        message: `Modifier "${app.name}" :`,
        choices: [
          ...entries.map(([key, meta]) => ({
            name: `${meta.label.padEnd(20)} ${chalk.cyan(key in changes ? String(changes[key]) : String(app[key]))}`,
            value: key,
            description: chalk.dim(meta.description),
          })),
          { name: chalk.dim('Terminer'), value: QUIT_KEY },
        ],
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'ExitPromptError') break
      throw err
    }

    if (selected === QUIT_KEY) break

    const key = selected as keyof AppEditableFields
    const meta = APP_FIELDS_META[key]
    const currentValue = key in changes ? String(changes[key]) : String(app[key])

    try {
      console.log(chalk.dim(`\n  Actuel : ${currentValue}\n`))
      const value = await input({ message: `${meta.label} :`, default: currentValue })
      if (value.trim()) {
        changes[key] = value.trim()
        console.log(chalk.green(`  ✓ ${meta.label} mis à jour\n`))
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'ExitPromptError') continue
      throw err
    }
  }

  return Object.keys(changes).length > 0 ? changes : null
}

export function registerPackageCommand(program: Command, ctx: AppContext): void {
  const pkg = program
    .command('package')
    .alias('pkg')
    .description('Gérer les applications Cordova configurées')

  pkg
    .command('list')
    .alias('ls')
    .description('Lister les applications configurées')
    .action(() => {
      const { apps, activeAppId } = new ListPackagesUseCase(ctx.config).execute()

      if (apps.length === 0) {
        console.log(chalk.dim('\n  Aucune application configurée. Utilisez `pda package add`.\n'))
        return
      }

      console.log('')
      for (const app of apps) {
        const active = app.id === activeAppId
        const indicator = active ? chalk.green('▶ ') : '  '
        const name = active ? chalk.green.bold(app.name) : chalk.white(app.name)
        console.log(`${indicator}${name}`)
        console.log(`    ${chalk.dim('id         ')} ${app.id}`)
        console.log(`    ${chalk.dim('package    ')} ${app.packageId}`)
        console.log(`    ${chalk.dim('run        ')} ${chalk.dim(app.runCommand)}`)
        console.log(`    ${chalk.dim('clear      ')} ${chalk.dim(app.clearCommand)}`)
        console.log(`    ${chalk.dim('launch     ')} ${chalk.dim(app.launchCommand)}`)
        console.log(`    ${chalk.dim('uninstall  ')} ${chalk.dim(app.uninstallCommand)}`)
        console.log(`    ${chalk.dim('build debug')} ${chalk.dim(app.buildDebugCommand)}`)
        console.log(`    ${chalk.dim('build rel. ')} ${chalk.dim(app.buildReleaseCommand)}`)
        if (app.customCommands.length > 0) {
          console.log(`    ${chalk.dim('custom     ')} ${app.customCommands.map((c) => chalk.cyan(c.name)).join(', ')}`)
        }
        console.log('')
      }
    })

  pkg
    .command('add')
    .description('Ajouter une application')
    .action(async () => {
      console.log(chalk.bold('\n  Nouvelle application\n'))
      try {
        const fields = await promptAppFields()
        if (!fields) return

        const app = new AddPackageUseCase(ctx.config).execute(fields)
        const isFirst = ctx.config.get('apps').length === 1
        console.log(chalk.green(`\n  ✓ "${app.name}" ajouté${isFirst ? ' et défini comme actif' : ''}\n`))
      } catch (err) {
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })

  pkg
    .command('edit [id]')
    .description('Modifier une application existante')
    .action(async (id?: string) => {
      const { apps } = new ListPackagesUseCase(ctx.config).execute()

      if (apps.length === 0) {
        console.log(chalk.dim('\n  Aucune application configurée.\n'))
        return
      }

      let app: App | undefined

      if (id) {
        const lower = id.toLowerCase()
        app = apps.find((a) => a.id === id || a.name.toLowerCase() === lower)
        if (!app) {
          console.error(chalk.red(`\n  Package "${id}" introuvable\n`))
          return
        }
      } else {
        try {
          const selected = await select<string>({
            message: 'Application à modifier :',
            choices: apps.map((a) => ({ name: `${a.name}  ${chalk.dim(a.packageId)}`, value: a.id })),
          })
          app = apps.find((a) => a.id === selected)!
        } catch (err) {
          if (err instanceof Error && err.name === 'ExitPromptError') return
          throw err
        }
      }

      try {
        const changes = await promptEditField(app)
        if (!changes) return

        const updated = new EditPackageUseCase(ctx.config).execute(app.id, changes)
        console.log(chalk.green(`\n  ✓ "${updated.name}" mis à jour\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }
    })

  pkg
    .command('remove')
    .alias('rm')
    .description('Supprimer une application')
    .action(async () => {
      const { apps } = new ListPackagesUseCase(ctx.config).execute()

      if (apps.length === 0) {
        console.log(chalk.dim('\n  Aucune application configurée.\n'))
        return
      }

      try {
        const id = await select<string>({
          message: 'Application à supprimer :',
          choices: apps.map((a) => ({ name: `${a.name}  ${chalk.dim(a.packageId)}`, value: a.id })),
        })

        new RemovePackageUseCase(ctx.config).execute(id)
        const removed = apps.find((a) => a.id === id)!
        console.log(chalk.green(`\n  ✓ "${removed.name}" supprimé\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }
    })

  pkg
    .command('use [id]')
    .description("Définir l'application active")
    .action(async (id?: string) => {
      if (id) {
        try {
          const app = new UsePackageUseCase(ctx.config).execute(id)
          console.log(chalk.green(`\n  ✓ Application active : "${app.name}"\n`))
        } catch (err) {
          if (err instanceof Error) {
            console.error(chalk.red(`\n  ${err.message}\n`))
            return
          }
          throw err
        }
        return
      }

      const { apps, activeAppId } = new ListPackagesUseCase(ctx.config).execute()

      if (apps.length === 0) {
        console.log(chalk.dim('\n  Aucune application configurée. Utilisez `pda package add`.\n'))
        return
      }

      try {
        const selected = await select<string>({
          message: 'Application active :',
          default: activeAppId ?? undefined,
          choices: apps.map((a) => ({
            name: `${a.name}  ${chalk.dim(a.packageId)}`,
            value: a.id,
          })),
        })

        const app = new UsePackageUseCase(ctx.config).execute(selected)
        console.log(chalk.green(`\n  ✓ Application active : "${app.name}"\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }
    })

  const cmds = pkg
    .command('commands')
    .alias('cmds')
    .description("Gérer les commandes personnalisées de l'application active")

  cmds
    .command('list')
    .alias('ls')
    .description('Lister les commandes personnalisées')
    .action(() => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      if (activeApp.customCommands.length === 0) {
        console.log(chalk.dim(`\n  Aucune commande personnalisée pour "${activeApp.name}".\n`))
        return
      }

      console.log(chalk.bold(`\n  Commandes de "${activeApp.name}"\n`))
      for (const cmd of activeApp.customCommands) {
        console.log(`  ${chalk.cyan(cmd.name)}`)
        console.log(`    ${chalk.dim(cmd.command)}`)
        console.log('')
      }
    })

  cmds
    .command('add')
    .description('Ajouter une commande personnalisée')
    .action(async () => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active. Configurez-en une avec `pda package use`.\n'))
        return
      }

      console.log(chalk.bold(`\n  Nouvelle commande pour "${activeApp.name}"\n`))
      console.log(chalk.dim('  Placeholders disponibles : {serial}, {packageId}\n'))

      try {
        const name = await input({ message: 'Nom :' })
        if (!name.trim()) return

        const command = await input({ message: 'Commande :' })
        if (!command.trim()) return

        const cmd = new AddCustomCommandUseCase(ctx.config).execute(activeApp.id, name.trim(), command.trim())
        console.log(chalk.green(`\n  ✓ "${cmd.name}" ajouté\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        if (err instanceof Error) {
          console.error(chalk.red(`\n  ${err.message}\n`))
          return
        }
        throw err
      }
    })

  cmds
    .command('edit [name]')
    .description('Modifier une commande personnalisée')
    .action(async (nameArg?: string) => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active.\n'))
        return
      }

      if (activeApp.customCommands.length === 0) {
        console.log(chalk.dim('\n  Aucune commande personnalisée à modifier.\n'))
        return
      }

      let commandId: string
      if (nameArg) {
        const lower = nameArg.toLowerCase()
        const found = activeApp.customCommands.find((c) => c.name.toLowerCase() === lower)
        if (!found) {
          console.error(chalk.red(`\n  Commande "${nameArg}" introuvable.\n`))
          return
        }
        commandId = found.id
      } else {
        try {
          commandId = await select<string>({
            message: 'Commande à modifier :',
            choices: activeApp.customCommands.map((c) => ({
              name: c.name,
              value: c.id,
              description: chalk.dim(c.command),
            })),
          })
        } catch (err) {
          if (err instanceof Error && err.name === 'ExitPromptError') return
          throw err
        }
      }

      const cmd = activeApp.customCommands.find((c) => c.id === commandId)!

      try {
        const changes: Partial<{ name: string; command: string }> = {}

        const newName = await input({ message: 'Nom :', default: cmd.name })
        if (newName.trim() && newName.trim() !== cmd.name) changes.name = newName.trim()

        console.log(chalk.dim(`\n  Actuel : ${cmd.command}\n`))
        const newCommand = await input({ message: 'Commande :', default: cmd.command })
        if (newCommand.trim() && newCommand.trim() !== cmd.command) changes.command = newCommand.trim()

        if (Object.keys(changes).length === 0) {
          console.log(chalk.dim('\n  Aucun changement.\n'))
          return
        }

        const updated = new EditCustomCommandUseCase(ctx.config).execute(activeApp.id, commandId, changes)
        console.log(chalk.green(`\n  ✓ "${updated.name}" mis à jour\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }
    })

  cmds
    .command('remove')
    .alias('rm')
    .description('Supprimer une commande personnalisée')
    .action(async () => {
      const activeAppId = ctx.config.get('activeAppId')
      const apps = ctx.config.get('apps')
      const activeApp = activeAppId ? apps.find((a) => a.id === activeAppId) : undefined

      if (!activeApp) {
        console.error(chalk.red('\n  Aucune application active.\n'))
        return
      }

      if (activeApp.customCommands.length === 0) {
        console.log(chalk.dim('\n  Aucune commande personnalisée à supprimer.\n'))
        return
      }

      try {
        const commandId = await select<string>({
          message: 'Commande à supprimer :',
          choices: activeApp.customCommands.map((c) => ({
            name: c.name,
            value: c.id,
            description: chalk.dim(c.command),
          })),
        })

        const cmd = activeApp.customCommands.find((c) => c.id === commandId)!
        new RemoveCustomCommandUseCase(ctx.config).execute(activeApp.id, commandId)
        console.log(chalk.green(`\n  ✓ "${cmd.name}" supprimé\n`))
      } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') return
        throw err
      }
    })
}
