import { z } from 'zod'

const CustomCommandSchema = z.object({
  id: z.string(),
  name: z.string(),
  command: z.string(),
})

const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  packageId: z.string(),
  runCommand: z.string().default('cordova run android --target={serial}'),
  clearCommand: z.string().default('adb -s {serial} shell pm clear {packageId}'),
  launchCommand: z.string().default('adb -s {serial} shell am start -n {packageId}/.MainActivity'),
  uninstallCommand: z.string().default('adb -s {serial} uninstall {packageId}'),
  buildDebugCommand: z.string().default('cordova build android --debug'),
  buildReleaseCommand: z.string().default('cordova build android --release -- --packageType=apk'),
  customCommands: z.array(CustomCommandSchema).default([]),
})

export const AppConfigSchema = z.object({
  defaultPda: z.string().default('ct60'),
  adbPath: z.string().nullable().default(null),
  debugEnabled: z.boolean().default(false),
  updateCheckIntervalHours: z.number().int().positive().default(4),
  lastUpdateCheck: z.string().nullable().default(null),
  latestVersion: z.string().nullable().default(null),
  apps: z.array(AppSchema).default([]),
  activeAppId: z.string().nullable().default(null),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export const DEFAULT_CONFIG: AppConfig = AppConfigSchema.parse({})
