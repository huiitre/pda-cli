import type { ConfigFieldType } from '../../domain/config/ConfigFieldMeta.js'

export interface ConfigEditableField {
  key: string
  label: string
  description: string
  type: ConfigFieldType
  currentValue: string | boolean | number | null
}

export interface IConfigEditor {
  // Lance la session interactive. Retourne les changements effectués, ou null si annulé sans modification.
  prompt(fields: ConfigEditableField[]): Promise<Record<string, string | boolean | number | null> | null>
}
