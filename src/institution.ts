import defaultSettings from './content/institution.json'
export { defaultSettings }

export type InstitutionSettings = typeof defaultSettings
const key = 'nexo-institution-settings-v1'
const hex = /^#[0-9a-fA-F]{6}$/
const colorKeys: (keyof InstitutionSettings['colors'])[] = [
  'primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted', 'border', 'sidebar', 'sidebarText',
]

export function validInstitutionSettings(value: unknown): value is InstitutionSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as InstitutionSettings
  return [settings.name, settings.shortName, settings.tagline, settings.contactEmail].every((item) => typeof item === 'string' && item.trim().length > 0)
    && !!settings.colors
    && colorKeys.every((field) => {
      const color = settings.colors[field]
      return typeof color === 'string' && hex.test(color)
    })
    && !!settings.grading
    && [settings.grading.currentPeriod, settings.grading.currentEvaluation, settings.grading.captureDeadline].every((item) => typeof item === 'string' && item.trim().length > 0)
    && [settings.grading.minimumGrade, settings.grading.maximumGrade, settings.grading.passingGrade, settings.grading.decimals].every((item) => typeof item === 'number' && Number.isFinite(item))
    && settings.grading.minimumGrade < settings.grading.maximumGrade
    && settings.grading.passingGrade >= settings.grading.minimumGrade
    && settings.grading.passingGrade <= settings.grading.maximumGrade
    && settings.grading.decimals >= 0
    && settings.grading.decimals <= 2
    && Array.isArray(settings.grading.specialCodes)
    && settings.grading.specialCodes.every((item) => typeof item.code === 'string' && item.code.trim().length > 0 && typeof item.label === 'string' && item.label.trim().length > 0 && typeof item.description === 'string')
}

export function normalizeInstitutionSettings(value: unknown): InstitutionSettings | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<InstitutionSettings> & {
    colors?: Partial<InstitutionSettings['colors']>
    grading?: Partial<InstitutionSettings['grading']>
  }
  if (![candidate.name, candidate.shortName, candidate.tagline, candidate.contactEmail].every((item) => typeof item === 'string' && item.trim().length > 0)) return null

  const normalized: InstitutionSettings = {
    ...defaultSettings,
    name: candidate.name!,
    shortName: candidate.shortName!,
    tagline: candidate.tagline!,
    contactEmail: candidate.contactEmail!,
    colors: { ...defaultSettings.colors, ...(candidate.colors ?? {}) },
    grading: {
      ...defaultSettings.grading,
      ...(candidate.grading ?? {}),
      specialCodes: Array.isArray(candidate.grading?.specialCodes) ? candidate.grading.specialCodes : defaultSettings.grading.specialCodes,
    },
  }
  return validInstitutionSettings(normalized) ? normalized : null
}

export function loadInstitutionSettings(): InstitutionSettings {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed: unknown = JSON.parse(stored)
      const normalized = normalizeInstitutionSettings(parsed)
      if (normalized) return normalized
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
  root.style.setProperty('--campus-canvas', settings.colors.background)
  root.style.setProperty('--campus-paper', settings.colors.surface)
  root.style.setProperty('--campus-ink', settings.colors.text)
  root.style.setProperty('--campus-muted', settings.colors.muted)
  root.style.setProperty('--campus-line', settings.colors.border)
  root.style.setProperty('--sidebar-bg', settings.colors.sidebar)
  root.style.setProperty('--sidebar-text', settings.colors.sidebarText)
  root.style.setProperty('--blue', settings.colors.primary)
  root.style.setProperty('--navy', settings.colors.text)
  document.title = `${settings.shortName} · Nexo Universitario`
}
