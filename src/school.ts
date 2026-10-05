import type { InstitutionSettings } from './institution'
import type { Availability, ScheduleSlot, TeachingRequest } from './scheduling'
export type Subject = { id: string; code: string; name: string; credits: number; hours: number; mandatory: boolean }
export type SchoolGroup = { id: string; code: string; programId: string; semester: number; period: string; capacity: number; studentIds: string[] }
export type StudentCareer = { studentId: string; programId: string }
export type StudentBlock = { id: string; studentId: string; area: string; reason: string; scope: 'Inscripción' | 'Documentos' | 'Ambos'; active: boolean; createdAt: string; releasedAt: string; releaseReason: string }
export type Grade = { id: string; studentId: string; subjectId: string; period: string; grade: number; origin: 'Curso' | 'Revalidación'; reference: string }
export type Movement = { id: string; studentId: string; type: 'Baja temporal' | 'Baja definitiva' | 'Reingreso' | 'Cambio de carrera' | 'Justificante'; reason: string; date: string; end: string; programId: string; author: string }
export type CoordinationArea = { id: string; name: string; email: string; programIds: string[] }
export type SchoolData = { subjects: Subject[]; groups: SchoolGroup[]; careers: StudentCareer[]; blocks: StudentBlock[]; grades: Grade[]; movements: Movement[]; areas: CoordinationArea[]; requests: TeachingRequest[]; availability: Availability[]; limits: { teacherId: string; maxHours: number }[]; schedules: { id: string; period: string; slots: ScheduleSlot[]; source: string; createdAt: string; requestSnapshot: TeachingRequest[] }[] }
export const schoolKey = 'campusone-school-v1'
export const emptySchool: SchoolData = { subjects: [], groups: [], careers: [], blocks: [], grades: [], movements: [], areas: [], requests: [], availability: [], limits: [], schedules: [] }
const str = (value: unknown) => typeof value === 'string'
const required = (value: unknown) => str(value) && !!(value as string).trim()
const range = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
export const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
export function validSchool(value: unknown): value is SchoolData {
  if (!value || typeof value !== 'object') return false
  const data = value as SchoolData
  for (const key of ['subjects', 'groups', 'careers', 'blocks', 'grades', 'movements', 'areas', 'requests', 'availability', 'limits', 'schedules'] as const) if (!Array.isArray(data[key]) || data[key].some((item) => !item || typeof item !== 'object')) return false
  const ids = ['subjects', 'groups', 'blocks', 'grades', 'movements', 'areas', 'requests', 'availability', 'schedules'] as const
  if (ids.some((key) => data[key].some((item) => !required(item.id)) || new Set(data[key].map((item) => item.id)).size !== data[key].length)) return false
  const uniqueStrings = (value: unknown): value is string[] => Array.isArray(value) && value.every(required) && new Set(value).size === value.length
  return data.subjects.every((item) => [item.code, item.name].every(required) && range(item.credits, 0, 100) && range(item.hours, 1, 12) && Number.isInteger(item.hours) && typeof item.mandatory === 'boolean')
    && new Set(data.subjects.map((item) => item.code.trim().toLowerCase())).size === data.subjects.length
    && data.groups.every((item) => [item.code, item.programId, item.period].every(required) && Number.isInteger(item.semester) && range(item.semester, 1, 20) && Number.isInteger(item.capacity) && range(item.capacity, 1, 200) && uniqueStrings(item.studentIds) && item.studentIds.length <= item.capacity)
    && new Set(data.groups.map((item) => `${item.period}|${item.code.toLowerCase()}`)).size === data.groups.length
    && data.careers.every((item) => required(item.studentId) && required(item.programId)) && new Set(data.careers.map((item) => item.studentId)).size === data.careers.length
    && data.blocks.every((item) => [item.studentId, item.area, item.reason, item.createdAt].every(required) && ['Inscripción', 'Documentos', 'Ambos'].includes(item.scope) && typeof item.active === 'boolean' && str(item.releasedAt) && str(item.releaseReason) && (item.active || (required(item.releasedAt) && required(item.releaseReason))))
    && data.grades.every((item) => [item.studentId, item.subjectId, item.period].every(required) && data.subjects.some((subject) => subject.id === item.subjectId) && range(item.grade, 0, 100) && ['Curso', 'Revalidación'].includes(item.origin) && str(item.reference) && (item.origin !== 'Revalidación' || required(item.reference)))
    && new Set(data.grades.map((item) => `${item.studentId}|${item.subjectId}|${item.period}`)).size === data.grades.length
    && data.movements.every((item) => [item.studentId, item.reason, item.author].every(required) && str(item.date) && validDate(item.date) && ['Baja temporal', 'Baja definitiva', 'Reingreso', 'Cambio de carrera', 'Justificante'].includes(item.type) && str(item.programId) && str(item.end) && (item.type !== 'Cambio de carrera' || required(item.programId)) && (item.type !== 'Justificante' || (validDate(item.end) && item.end >= item.date)))
    && data.areas.every((item) => required(item.name) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) && uniqueStrings(item.programIds) && item.programIds.length > 0)
    && data.requests.every((item) => data.groups.some((group) => group.id === item.groupId) && data.subjects.some((subject) => subject.id === item.subjectId) && [item.teacherId, item.room].every(required) && Number.isInteger(item.hours) && range(item.hours, 1, 12))
    && new Set(data.requests.map((item) => `${item.groupId}|${item.subjectId}`)).size === data.requests.length
    && data.availability.every((item) => required(item.teacherId) && Number.isInteger(item.day) && range(item.day, 0, 4) && Number.isInteger(item.start) && Number.isInteger(item.end) && range(item.start, 7, 21) && range(item.end, 8, 22) && item.start < item.end)
    && data.limits.every((item) => required(item.teacherId) && Number.isInteger(item.maxHours) && range(item.maxHours, 1, 60)) && new Set(data.limits.map((item) => item.teacherId)).size === data.limits.length
    && data.schedules.every((item) => [item.period, item.source, item.createdAt].every(required) && Array.isArray(item.slots) && Array.isArray(item.requestSnapshot) && item.requestSnapshot.every((request) => request && [request.id, request.groupId, request.subjectId, request.teacherId, request.room].every(required) && Number.isInteger(request.hours) && range(request.hours, 1, 12)) && new Set(item.requestSnapshot.map((request) => request.id)).size === item.requestSnapshot.length && item.slots.every((slot) => slot && item.requestSnapshot.some((request) => request.id === slot.requestId) && Number.isInteger(slot.day) && range(slot.day, 0, 4) && Number.isInteger(slot.hour) && range(slot.hour, 7, 21)))
}
export function loadSchool(settings: InstitutionSettings): { data: SchoolData; error: string } {
  try {
    const saved = localStorage.getItem(schoolKey)
    const data: unknown = saved === null ? structuredClone(emptySchool) : JSON.parse(saved)
    if (!validSchool(data)) throw new Error('Invalid school data')
    // The catalogue starts with the existing plan subjects; no existing record is replaced.
    for (const program of settings.academicOffer.programs) for (const term of program.curriculum) for (const subject of term.subjects) if (!data.subjects.some((item) => item.id === subject.id || item.code.toLowerCase() === subject.code.toLowerCase())) data.subjects.push({ ...subject })
    return { data, error: '' }
  } catch { return { data: structuredClone(emptySchool), error: 'No se pudo leer Control escolar. La escritura está bloqueada para proteger los datos guardados.' } }
}
export function studentProgram(data: SchoolData, studentId: string, area: string, settings: InstitutionSettings) { return data.careers.find((item) => item.studentId === studentId)?.programId ?? settings.academicOffer.programs.find((item) => item.name === area)?.id ?? '' }
export function effectiveStudentStatus(data: SchoolData, studentId: string, fallback: 'Activo' | 'Inactivo' | 'Baja'): 'Activo' | 'Inactivo' | 'Baja' { const last = data.movements.filter((item) => item.studentId === studentId && ['Baja temporal', 'Baja definitiva', 'Reingreso'].includes(item.type)).at(-1); return last ? last.type === 'Reingreso' ? 'Activo' : 'Baja' : fallback }
export function studentIsWithdrawn(data: SchoolData, studentId: string) { return effectiveStudentStatus(data, studentId, 'Activo') === 'Baja' }
export function blockingReasons(data: SchoolData, studentId: string, scope: 'Inscripción' | 'Documentos') { return data.blocks.filter((item) => item.studentId === studentId && item.active && (item.scope === scope || item.scope === 'Ambos')).map((item) => `${item.area}: ${item.reason}`) }
export function enrollStudent(data: SchoolData, groupId: string, studentId: string, programId: string): SchoolData {
  const group = data.groups.find((item) => item.id === groupId)
  if (!group) throw new Error('Grupo inexistente.')
  if (studentIsWithdrawn(data, studentId)) throw new Error('El alumno está de baja. Registra su reingreso antes de inscribirlo.')
  const blocked = blockingReasons(data, studentId, 'Inscripción')
  if (blocked.length) throw new Error(`Inscripción bloqueada: ${blocked.join('; ')}`)
  if (group.programId !== programId) throw new Error('La carrera del alumno no coincide con la del grupo.')
  if (group.studentIds.includes(studentId)) throw new Error('El alumno ya pertenece al grupo.')
  if (data.groups.some((item) => item.id !== group.id && item.period === group.period && item.studentIds.includes(studentId))) throw new Error('El alumno ya pertenece a otro grupo de este periodo.')
  if (group.studentIds.length >= group.capacity) throw new Error('El grupo no tiene cupo disponible.')
  return { ...data, groups: data.groups.map((item) => item.id === groupId ? { ...item, studentIds: [...item.studentIds, studentId] } : item) }
}
export function applyMovement(data: SchoolData, movement: Movement): SchoolData {
  const next = { ...data, movements: [...data.movements, movement] }
  if (movement.type.startsWith('Baja') || movement.type === 'Cambio de carrera') next.groups = data.groups.map((group) => ({ ...group, studentIds: group.studentIds.filter((id) => id !== movement.studentId) }))
  if (movement.type === 'Cambio de carrera') next.careers = [...data.careers.filter((item) => item.studentId !== movement.studentId), { studentId: movement.studentId, programId: movement.programId }]
  return next
}
