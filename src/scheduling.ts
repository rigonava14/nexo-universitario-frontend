export type TeachingRequest = { id: string; groupId: string; subjectId: string; teacherId: string; room: string; hours: number }
export type Availability = { id: string; teacherId: string; day: number; start: number; end: number }
export type ScheduleSlot = { requestId: string; day: number; hour: number }
export type ScheduleInput = { requests: TeachingRequest[]; availability: Availability[]; limits: { teacherId: string; maxHours: number }[] }
export type ScheduleProposal = { slots: ScheduleSlot[]; explanation: string }

export function validateScheduleInput(input: unknown): input is ScheduleInput {
  if (!input || typeof input !== 'object') return false
  const data = input as ScheduleInput
  const text = (value: unknown) => typeof value === 'string' && !!value.trim() && value.length <= 150
  return Array.isArray(data.requests) && data.requests.length > 0 && data.requests.length <= 100
    && data.requests.every((item) => item && [item.id, item.groupId, item.subjectId, item.teacherId, item.room].every(text) && Number.isInteger(item.hours) && item.hours >= 1 && item.hours <= 12)
    && new Set(data.requests.map((item) => item.id)).size === data.requests.length
    && Array.isArray(data.availability) && data.availability.length <= 1000 && data.availability.every((item) => item && text(item.teacherId) && Number.isInteger(item.day) && item.day >= 0 && item.day <= 4 && Number.isInteger(item.start) && Number.isInteger(item.end) && item.start >= 7 && item.end <= 22 && item.start < item.end)
    && Array.isArray(data.limits) && data.limits.length <= 100 && data.limits.every((item) => item && text(item.teacherId) && Number.isInteger(item.maxHours) && item.maxHours >= 1 && item.maxHours <= 60)
    && new Set(data.limits.map((item) => item.teacherId)).size === data.limits.length
}

export function scheduleIssues(input: ScheduleInput, proposal: unknown): string[] {
  if (!proposal || typeof proposal !== 'object' || !Array.isArray((proposal as ScheduleProposal).slots)) return ['La propuesta no contiene una tabla de horarios válida.']
  const slots = (proposal as ScheduleProposal).slots
  if (slots.length > 1200) return ['La propuesta excede el tamaño permitido.']
  const errors = new Set<string>()
  const counts = new Map<string, number>()
  const occupied = new Set<string>()
  const teacherHours = new Map<string, number>()
  for (const slot of slots) {
    const request = input.requests.find((item) => item.id === slot?.requestId)
    if (!request || !Number.isInteger(slot.day) || slot.day < 0 || slot.day > 4 || !Number.isInteger(slot.hour) || slot.hour < 7 || slot.hour >= 22) { errors.add('La propuesta contiene clases, días u horas desconocidos.'); continue }
    if (!input.availability.some((item) => item.teacherId === request.teacherId && item.day === slot.day && item.start <= slot.hour && item.end > slot.hour)) errors.add(`Docente fuera de disponibilidad en ${request.id}.`)
    for (const resource of [`grupo:${request.groupId}`, `docente:${request.teacherId}`, `aula:${request.room.trim().toLowerCase()}`]) {
      const key = `${resource}|${slot.day}|${slot.hour}`
      if (occupied.has(key)) errors.add(`Cruce de ${resource} en día ${slot.day + 1}, ${slot.hour}:00.`)
      occupied.add(key)
    }
    counts.set(request.id, (counts.get(request.id) ?? 0) + 1)
    teacherHours.set(request.teacherId, (teacherHours.get(request.teacherId) ?? 0) + 1)
  }
  for (const request of input.requests) if (counts.get(request.id) !== request.hours) errors.add(`La clase ${request.id} requiere exactamente ${request.hours} horas semanales.`)
  for (const [teacherId, hours] of teacherHours) if (hours > (input.limits.find((item) => item.teacherId === teacherId)?.maxHours ?? 20)) errors.add(`Carga máxima excedida para ${teacherId}.`)
  return [...errors]
}

export function generateLocalSchedule(input: ScheduleInput): ScheduleProposal {
  const candidates = (request: TeachingRequest) => Array.from({ length: 5 }, (_, day) => Array.from({ length: 15 }, (_, index) => ({ requestId: request.id, day, hour: index + 7 }))).flat().filter((slot) => input.availability.some((item) => item.teacherId === request.teacherId && item.day === slot.day && item.start <= slot.hour && item.end > slot.hour))
  const sorted = [...input.requests].sort((a, b) => candidates(a).length - candidates(b).length)
  const tasks = sorted.flatMap((request) => Array.from({ length: request.hours }, () => request))
  if (tasks.length > 300) throw new Error('Divide la oferta en periodos o áreas; el generador local admite hasta 300 horas por propuesta.')
  const load = new Map<string, number>()
  for (const request of sorted) load.set(request.teacherId, (load.get(request.teacherId) ?? 0) + request.hours)
  for (const [id, hours] of load) if (hours > (input.limits.find((item) => item.teacherId === id)?.maxHours ?? 20)) throw new Error('La oferta excede la carga máxima de un docente. Corrige la carga antes de generar.')
  const slots: ScheduleSlot[] = []
  const used = new Set<string>()
  let attempts = 0
  function assign(index: number): boolean {
    if (index === tasks.length) return true
    if (++attempts > 50000) return false
    const request = tasks[index]
    const previous = slots.filter((slot) => slot.requestId === request.id).at(-1)
    for (const slot of candidates(request)) {
      if (previous && slot.day * 24 + slot.hour <= previous.day * 24 + previous.hour) continue
      const keys = [`g:${request.groupId}`, `t:${request.teacherId}`, `r:${request.room.trim().toLowerCase()}`].map((key) => `${key}|${slot.day}|${slot.hour}`)
      if (keys.some((key) => used.has(key))) continue
      keys.forEach((key) => used.add(key)); slots.push(slot)
      if (assign(index + 1)) return true
      slots.pop(); keys.forEach((key) => used.delete(key))
    }
    return false
  }
  if (!assign(0)) throw new Error('No se encontró una propuesta completa dentro del límite de búsqueda. Amplía disponibilidades, cambia aulas o reduce la carga.')
  const result = { slots, explanation: 'Propuesta del generador local por restricciones, sin IA. Requiere revisión de coordinación.' }
  const issues = scheduleIssues(input, result)
  if (issues.length) throw new Error(issues.join(' '))
  return result
}
