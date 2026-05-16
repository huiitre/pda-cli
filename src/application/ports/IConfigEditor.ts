import type { ConfigFieldType } from '../../domain/config/ConfigFieldMeta.js'

export interface ConfigEditableField {
  key: string
  label: string
  description: string
  type: ConfigFieldType
  currentValue: string | boolean | number | null
}

export interface IConfigEditor {
  prompt(
    fields: ConfigEditableField[],
    onSave: (key: string, value: string | boolean | number | null) => void,
  ): Promise<void>
}
