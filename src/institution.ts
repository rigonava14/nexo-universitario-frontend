import defaultSettings from './content/institution.json'
export { defaultSettings }

export type InstitutionSettings = typeof defaultSettings
const key = 'nexo-institution-settings-v1'
const hex = /^#[0-9a-fA-F]{6}$/

export function validInstitutionSettings(value: unknown): value is InstitutionSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as InstitutionSettings
  return [settings.name, settings.shortName, settings.tagline, settings.contactEmail].every((item) => typeof item === 'string' && item.trim().length > 0)
    && !!settings.colors
    && ['primary', 'secondary', 'accent', 'background', 'text'].every((field) => {
      const color = settings.colors[field as keyof InstitutionSettings['colors']]
      return typeof color === 'string' && hex.test(color)
    })
}

export function loadInstitutionSettings(): InstitutionSettings {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      if (validInstitutionSettings(parsed)) return parsed
    }
  } catch { /* Ignore a damaged local draft. */ }
  return defaultSettings
}

export function saveInstitutionSettings(settings: InstitutionSettings) {
  localStorage.setItem(key, JSON.stringify(settings))
  applyInstitutionSettings(settings)
}

export function resetInstitutionSettings() {
  localStorage.removeItem(key)
  applyInstitutionSettings(defaultSettings)
  return defaultSettings
}

export function applyInstitutionSettings(settings: InstitutionSettings) {
  const root = document.documentElement
  root.style.setProperty('--brand-violet', settings.colors.primary)
  root.style.setProperty('--brand-coral', settings.colors.secondary)
  root.style.setProperty('--brand-amber', settings.colors.accent)
  root.style.setProperty('--brand-lavender', settings.colors.background)
  root.style.setProperty('--brand-plum', settings.colors.text)
  root.style.setProperty('--blue', settings.colors.primary)
  root.style.setProperty('--navy', settings.colors.text)
  document.title = `${settings.shortName} · Nexo Universitario`
}
