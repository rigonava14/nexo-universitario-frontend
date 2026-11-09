import { InstitutionSettings, defaultSettings, normalizeInstitutionSettings } from '../../institution'
import type { InstitutionService } from '../index'

export const institutionStorageKey = 'nexo-institution-settings-v1'

/** Lectura síncrona: la usa también la sesión de demostración para validar usuarios administrativos. */
export function readInstitutionSettings(): InstitutionSettings {
  try {
    const stored = localStorage.getItem(institutionStorageKey)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      const normalized = normalizeInstitutionSettings(parsed)
      if (normalized) return normalized
    }
  } catch {
    /* Ignore a damaged local draft. */
  }
  return defaultSettings
}

export const localInstitutionService: InstitutionService = {
  async load() {
    return readInstitutionSettings()
  },
  async save(settings) {
    localStorage.setItem(institutionStorageKey, JSON.stringify(settings))
  },
  async reset() {
    localStorage.removeItem(institutionStorageKey)
    return defaultSettings
  },
}
