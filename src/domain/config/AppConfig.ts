import { z } from 'zod'

export const AppConfigSchema = z.object({
  defaultPda: z.string().default('ct60'),
  adbPath: z.string().nullable().default(null),
  debugEnabled: z.boolean().default(false),
  updateCheckIntervalHours: z.number().int().positive().default(4),
  lastUpdateCheck: z.string().nullable().default(null),
  latestVersion: z.string().nullable().default(null),
  emaDefaultAuthor: z.string().default(''),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export const DEFAULT_CONFIG: AppConfig = AppConfigSchema.parse({})
