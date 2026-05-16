import type { AppConfig } from '../../domain/config/AppConfig.js'
import { CONFIG_FIELDS_META } from '../../domain/config/ConfigFieldMeta.js'
import type { IConfigEditor } from '../ports/IConfigEditor.js'
import type { ConfigService } from '../services/ConfigService.js'

export class EditConfigUseCase {
  constructor(
    private readonly configService: ConfigService,
    private readonly editor: IConfigEditor,
  ) {}

  async execute(): Promise<void> {
    const config = this.configService.getAll()

    const fields = (Object.entries(CONFIG_FIELDS_META) as [keyof AppConfig, (typeof CONFIG_FIELDS_META)[keyof AppConfig]][])
      .filter(([, meta]) => meta.editable && meta.showInConfig)
      .map(([key, meta]) => ({
        key,
        label: meta.label,
        description: meta.description,
        type: meta.type,
        currentValue: config[key] as string | boolean | number | null,
      }))

    const changes = await this.editor.prompt(fields)

    if (changes) {
      for (const [key, value] of Object.entries(changes)) {
        this.configService.set(key as keyof AppConfig, value as AppConfig[keyof AppConfig])
      }
    }
  }
}
