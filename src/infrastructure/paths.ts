import { homedir } from 'os'
import { join } from 'path'

export const APP_DIR = join(homedir(), 'pda-cli')
export const CONFIG_FILE = join(APP_DIR, 'config.json')
export const DATABASE_DIR = join(APP_DIR, 'database')
export const LOGS_DIR = join(APP_DIR, 'logs')