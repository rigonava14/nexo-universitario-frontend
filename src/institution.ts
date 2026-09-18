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
    && !!settings.admissions
    && [settings.admissions.callName, settings.admissions.portalHeadline, settings.admissions.portalDescription, settings.admissions.applicationOpen, settings.admissions.applicationClose, settings.admissions.examDate, settings.admissions.resultsDate, settings.admissions.examMode, settings.admissions.supportEmail].every((item) => typeof item === 'string' && item.trim().length > 0)
    && [settings.admissions.applicationFee, settings.admissions.capacity].every((item) => typeof item === 'number' && Number.isFinite(item) && item >= 0)
    && Array.isArray(settings.admissions.requiredDocuments)
    && settings.admissions.requiredDocuments.every((item) => typeof item === 'string' && item.trim().length > 0)
    && !!settings.enrollment
    && [settings.enrollment.newStudentOpen, settings.enrollment.newStudentClose, settings.enrollment.returningOpen, settings.enrollment.returningClose, settings.enrollment.studentIdPrefix, settings.enrollment.instructions].every((item) => typeof item === 'string' && item.trim().length > 0)
    && typeof settings.enrollment.maximumSubjects === 'number'
    && typeof settings.enrollment.lateFee === 'number'
    && !!settings.closingRules
    && [settings.closingRules.lockAfterDeadline, settings.closingRules.requireTeacherConfirmation, settings.closingRules.requireCoordinatorSignature, settings.closingRules.autoActNumber].every((item) => typeof item === 'boolean')
    && !!settings.academicOffer
    && Array.isArray(settings.academicOffer.campuses)
    && settings.academicOffer.campuses.every((campus) => typeof campus.id === 'string' && campus.id.trim().length > 0 && typeof campus.name === 'string' && campus.name.trim().length > 0)
    && Array.isArray(settings.academicOffer.programs)
    && settings.academicOffer.programs.every((program) => [program.id, program.code, program.name, program.level, program.modality, program.status, program.rvoe, program.planVersion, program.description].every((item) => typeof item === 'string') && [program.durationSemesters, program.totalCredits, program.capacity].every((item) => typeof item === 'number' && Number.isFinite(item)) && Array.isArray(program.campusIds) && Array.isArray(program.curriculum))
    && !!settings.finance
    && [settings.finance.currency, settings.finance.fiscalName, settings.finance.rfc].every((item) => typeof item === 'string' && item.trim().length > 0)
    && Array.isArray(settings.finance.paymentMethods)
    && Array.isArray(settings.finance.concepts)
    && Array.isArray(settings.finance.charges)
    && Array.isArray(settings.finance.receipts)
    && Array.isArray(settings.finance.scholarships)
    && Array.isArray(settings.finance.scholarshipPrograms)
    && Array.isArray(settings.finance.scholarshipCandidates)
    && Array.isArray(settings.finance.scholarshipNews)
    && Array.isArray(settings.finance.payroll)
    && !!settings.admissionExam
    && typeof settings.admissionExam.name === 'string'
    && settings.admissionExam.name.trim().length > 0
    && Array.isArray(settings.admissionExam.questions)
    && settings.admissionExam.questions.length > 0
    && settings.admissionExam.questions.every((question) => typeof question.prompt === 'string' && question.prompt.trim().length > 0 && Array.isArray(question.options) && question.options.length >= 2)
    && !!settings.reports
    && Array.isArray(settings.reports.templates)
    && settings.reports.templates.length > 0
    && settings.reports.templates.every((template) => [template.id, template.name, template.documentType, template.pageSize, template.orientation, template.fontFamily, template.textColor, template.accentColor, template.paperColor, template.header, template.body, template.footer].every((item) => typeof item === 'string') && typeof template.fontSize === 'number' && typeof template.marginMm === 'number' && typeof template.showPageBorder === 'boolean')
    && !!settings.accessControl
    && Array.isArray(settings.accessControl.roles)
    && settings.accessControl.roles.every((role) => [role.id, role.name, role.description, role.status].every((item) => typeof item === 'string') && Array.isArray(role.permissions))
    && Array.isArray(settings.accessControl.users)
    && settings.accessControl.users.every((user) => [user.id, user.name, user.email, user.roleId, user.area, user.status].every((item) => typeof item === 'string'))
}

export function normalizeInstitutionSettings(value: unknown): InstitutionSettings | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<InstitutionSettings> & {
    colors?: Partial<InstitutionSettings['colors']>
    grading?: Partial<InstitutionSettings['grading']>
    admissions?: Partial<InstitutionSettings['admissions']>
    enrollment?: Partial<InstitutionSettings['enrollment']>
    closingRules?: Partial<InstitutionSettings['closingRules']>
    academicOffer?: Partial<InstitutionSettings['academicOffer']>
    finance?: Partial<InstitutionSettings['finance']>
    admissionExam?: Partial<InstitutionSettings['admissionExam']>
    reports?: Partial<InstitutionSettings['reports']>
    accessControl?: Partial<InstitutionSettings['accessControl']>
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
    admissions: {
      ...defaultSettings.admissions,
      ...(candidate.admissions ?? {}),
      requiredDocuments: Array.isArray(candidate.admissions?.requiredDocuments) ? candidate.admissions.requiredDocuments : defaultSettings.admissions.requiredDocuments,
    },
    enrollment: { ...defaultSettings.enrollment, ...(candidate.enrollment ?? {}) },
    closingRules: { ...defaultSettings.closingRules, ...(candidate.closingRules ?? {}) },
    academicOffer: {
      ...defaultSettings.academicOffer,
      ...(candidate.academicOffer ?? {}),
      campuses: Array.isArray(candidate.academicOffer?.campuses) ? candidate.academicOffer.campuses : defaultSettings.academicOffer.campuses,
      programs: Array.isArray(candidate.academicOffer?.programs) ? candidate.academicOffer.programs : defaultSettings.academicOffer.programs,
    },
    finance: {
      ...defaultSettings.finance,
      ...(candidate.finance ?? {}),
      paymentMethods: Array.isArray(candidate.finance?.paymentMethods) ? candidate.finance.paymentMethods : defaultSettings.finance.paymentMethods,
      concepts: Array.isArray(candidate.finance?.concepts) ? candidate.finance.concepts : defaultSettings.finance.concepts,
      charges: Array.isArray(candidate.finance?.charges) ? candidate.finance.charges : defaultSettings.finance.charges,
      receipts: Array.isArray(candidate.finance?.receipts) ? candidate.finance.receipts : defaultSettings.finance.receipts,
      scholarships: Array.isArray(candidate.finance?.scholarships) ? candidate.finance.scholarships : defaultSettings.finance.scholarships,
      scholarshipPrograms: Array.isArray(candidate.finance?.scholarshipPrograms) ? candidate.finance.scholarshipPrograms : defaultSettings.finance.scholarshipPrograms,
      scholarshipCandidates: Array.isArray(candidate.finance?.scholarshipCandidates) ? candidate.finance.scholarshipCandidates : defaultSettings.finance.scholarshipCandidates,
      scholarshipNews: Array.isArray(candidate.finance?.scholarshipNews) ? candidate.finance.scholarshipNews : defaultSettings.finance.scholarshipNews,
      payroll: Array.isArray(candidate.finance?.payroll) ? candidate.finance.payroll : defaultSettings.finance.payroll,
    },
    admissionExam: {
      ...defaultSettings.admissionExam,
      ...(candidate.admissionExam ?? {}),
      questions: Array.isArray(candidate.admissionExam?.questions) ? candidate.admissionExam.questions : defaultSettings.admissionExam.questions,
    },
    reports: {
      ...defaultSettings.reports,
      ...(candidate.reports ?? {}),
      templates: Array.isArray(candidate.reports?.templates) ? candidate.reports.templates.map((template, index) => ({
        ...(defaultSettings.reports.templates.find((item) => item.id === template.id) ?? defaultSettings.reports.templates[0]),
        ...template,
        id: template.id || `format-${index + 1}`,
      })) : defaultSettings.reports.templates,
    },
    accessControl: {
      ...defaultSettings.accessControl,
      ...(candidate.accessControl ?? {}),
      roles: Array.isArray(candidate.accessControl?.roles) ? candidate.accessControl.roles : defaultSettings.accessControl.roles,
      users: Array.isArray(candidate.accessControl?.users) ? candidate.accessControl.users : defaultSettings.accessControl.users,
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
