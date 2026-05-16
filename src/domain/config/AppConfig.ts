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
  defaultPda: z.string().default('ct60').catch('ct60'),
  adbPath: z.string().nullable().default(null).catch(null),
  debugEnabled: z.boolean().default(false).catch(false),
  updateCheckIntervalHours: z.number().int().min(0).default(4).catch(4),
  lastUpdateCheck: z.string().nullable().default(null).catch(null),
  latestVersion: z.string().nullable().default(null).catch(null),
  apps: z.array(AppSchema).default([]).catch([]),
  activeAppId: z.string().nullable().default(null).catch(null),
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export const DEFAULT_CONFIG: AppConfig = AppConfigSchema.parse({})
