export type Residency = { id: string; studentId: string; teacherId: string; project: string; company: string; start: string; end: string; hours: number; status: 'Solicitada' | 'En proceso' | 'Concluida' | 'Cancelada'; evidence: string; notes: string }
export const graduationRequirements = ['Kárdex completo', 'Servicio social liberado', 'Residencia liberada', 'No adeudo', 'Identificación oficial'] as const
export type Graduation = { id: string; studentId: string; advisorId: string; modality: string; title: string; date: string; status: 'En revisión' | 'Lista para examen' | 'Titulada' | 'Cancelada'; requirements: string[]; notes: string }
export type Academy = { id: string; name: string; area: string; coordinatorId: string; memberIds: string[]; status: 'Activa' | 'Inactiva'; agreements: string }
export type EnglishGroup = { id: string; code: string; level: string; teacherId: string; period: string; schedule: string; room: string; capacity: number; status: 'Abierto' | 'Cerrado' }
export type EnglishEnrollment = { id: string; groupId: string; studentId: string; grade: number | null; attendance: number; status: 'Inscrito' | 'Baja' }
export type OperatingSettings = { residencyHours: number; englishPassingGrade: number; englishMinimumAttendance: number; graduationModalities: string[] }
export type Operations = { residencies: Residency[]; graduations: Graduation[]; academies: Academy[]; englishGroups: EnglishGroup[]; englishEnrollments: EnglishEnrollment[]; settings: OperatingSettings }
export const operationsKey = 'campusone-operations-v1'
export const defaultOperations: Operations = { residencies: [], graduations: [], academies: [], englishGroups: [], englishEnrollments: [], settings: { residencyHours: 500, englishPassingGrade: 70, englishMinimumAttendance: 80, graduationModalities: ['Tesis', 'Proyecto de investigación', 'Informe de residencia', 'Examen general de egreso'] } }

const text = (value: unknown): value is string => typeof value === 'string'
const required = (value: unknown) => text(value) && !!value.trim()
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(required) && new Set(value).size === value.length
const numeric = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
const date = (value: unknown) => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const oneOf = (value: unknown, options: readonly string[]) => text(value) && options.includes(value)
const safeEvidence = (value: string) => !value || (() => { try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false } })()

export function validOperations(value: unknown): value is Operations {
  if (!value || typeof value !== 'object') return false
  const data = value as Operations
  const settings = data.settings
  if (!settings || !numeric(settings.residencyHours, 1, 10000) || !Number.isInteger(settings.residencyHours) || !numeric(settings.englishPassingGrade, 0, 100) || !numeric(settings.englishMinimumAttendance, 0, 100) || !strings(settings.graduationModalities) || !settings.graduationModalities.length) return false
  const lists = [data.residencies, data.graduations, data.academies, data.englishGroups, data.englishEnrollments]
  if (!lists.every((items) => Array.isArray(items) && items.every((item) => item && typeof item === 'object' && required(item.id)) && new Set(items.map((item) => item.id)).size === items.length)) return false
  if (!data.residencies.every((item) => [item.studentId, item.teacherId, item.project, item.company].every(required) && date(item.start) && date(item.end) && item.end >= item.start && numeric(item.hours, 0, 10000) && Number.isInteger(item.hours) && text(item.notes) && text(item.evidence) && safeEvidence(item.evidence) && oneOf(item.status, ['Solicitada', 'En proceso', 'Concluida', 'Cancelada']))) return false
  if (!data.graduations.every((item) => [item.studentId, item.advisorId, item.modality, item.title].every(required) && (item.date === '' || date(item.date)) && strings(item.requirements) && item.requirements.every((requirement) => graduationRequirements.includes(requirement as typeof graduationRequirements[number])) && text(item.notes) && oneOf(item.status, ['En revisión', 'Lista para examen', 'Titulada', 'Cancelada']))) return false
  if (!data.academies.every((item) => [item.name, item.area, item.coordinatorId].every(required) && strings(item.memberIds) && item.memberIds.includes(item.coordinatorId) && oneOf(item.status, ['Activa', 'Inactiva']) && text(item.agreements))) return false
  if (!data.englishGroups.every((item) => [item.code, item.teacherId, item.period, item.schedule, item.room].every(required) && oneOf(item.level, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) && numeric(item.capacity, 1, 200) && Number.isInteger(item.capacity) && oneOf(item.status, ['Abierto', 'Cerrado']))) return false
  if (new Set(data.englishGroups.map((item) => `${item.period.toLowerCase()}|${item.code.toLowerCase()}`)).size !== data.englishGroups.length) return false
  if (!data.englishEnrollments.every((item) => required(item.studentId) && data.englishGroups.some((group) => group.id === item.groupId) && (item.grade === null || numeric(item.grade, 0, 100)) && numeric(item.attendance, 0, 100) && oneOf(item.status, ['Inscrito', 'Baja']))) return false
  if (new Set(data.englishEnrollments.map((item) => `${item.groupId}|${item.studentId}`)).size !== data.englishEnrollments.length) return false
  return data.englishGroups.every((group) => data.englishEnrollments.filter((item) => item.groupId === group.id && item.status === 'Inscrito').length <= group.capacity)
}

export function loadOperations(): { data: Operations; error: string } {
  try {
    const saved = localStorage.getItem(operationsKey)
    if (saved === null) return { data: structuredClone(defaultOperations), error: '' }
    const data: unknown = JSON.parse(saved)
    if (!validOperations(data)) throw new Error('Invalid operations')
    return { data, error: '' }
  } catch { return { data: structuredClone(defaultOperations), error: 'No se pudieron leer los datos operativos guardados. Para protegerlos, la edición está bloqueada hasta corregir el almacenamiento del navegador.' } }
}

export function saveOperations(data: Operations): string {
  if (!validOperations(data)) return 'Revisa los campos obligatorios, fechas, identificadores, cupos y porcentajes.'
  try { localStorage.setItem(operationsKey, JSON.stringify(data)); return '' }
  catch { return 'No se pudo guardar. Revisa el espacio y los permisos del navegador e intenta de nuevo.' }
}

export function residencyError(item: Residency, settings: OperatingSettings, others: Residency[]) {
  if (item.end < item.start) return 'La fecha de término debe ser igual o posterior al inicio.'
  if (item.status === 'Concluida' && (item.hours < settings.residencyHours || !item.evidence)) return `Para concluir se necesitan ${settings.residencyHours} horas y una referencia de evidencia.`
  if (!['Cancelada', 'Concluida'].includes(item.status) && others.some((other) => other.id !== item.id && other.studentId === item.studentId && !['Cancelada', 'Concluida'].includes(other.status))) return 'Este alumno ya tiene una residencia activa.'
  return ''
}
export function graduationError(item: Graduation, others: Graduation[]) {
  if (['Lista para examen', 'Titulada'].includes(item.status) && graduationRequirements.some((requirement) => !item.requirements.includes(requirement))) return 'Completa la revisión de todos los requisitos antes de avanzar el expediente.'
  if (['Lista para examen', 'Titulada'].includes(item.status) && !item.date) return 'Registra la fecha del examen o acto de titulación.'
  if (item.status !== 'Cancelada' && others.some((other) => other.id !== item.id && other.studentId === item.studentId && other.status !== 'Cancelada')) return 'Este alumno ya tiene un expediente de titulación vigente.'
  return ''
}
export function englishResult(item: EnglishEnrollment, settings: OperatingSettings) {
  if (item.status === 'Baja') return 'Baja'
  if (item.grade === null) return 'Sin evaluar'
  return item.grade >= settings.englishPassingGrade && item.attendance >= settings.englishMinimumAttendance ? 'Acreditado' : 'No acreditado'
}

export function csvText(headers: string[], rows: (string | number | null)[][]) {
  const cell = (value: string | number | null) => {
    const raw = String(value ?? '')
    const safe = /^[\s]*[=+@-]/.test(raw) ? `'${raw}` : raw
    return `"${safe.replace(/"/g, '""')}"`
  }
  return '\uFEFF' + [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n')
}

export function downloadCsv(name: string, headers: string[], rows: (string | number | null)[][]) {
  const url = URL.createObjectURL(new Blob([csvText(headers, rows)], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = `${name}.csv`; anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
