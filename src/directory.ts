export type DirectoryKind = 'students' | 'teachers'
export type DirectoryRecord = {
  id: string
  number: string
  name: string
  email: string
  phone: string
  area: string
  status: 'Activo' | 'Inactivo' | 'Baja'
  semester: number
  qualification: string
  notes: string
}

const record = (id: string, number: string, name: string, area: string, email: string, semester = 1, qualification = ''): DirectoryRecord => ({ id, number, name, area, email, semester, qualification, phone: '', status: 'Activo', notes: '' })
export const directorySeeds: Record<DirectoryKind, DirectoryRecord[]> = {
  students: [
    record('student-ana', '20260184', 'Ana Martínez López', 'Ingeniería en Sistemas', 'ana.martinez@universidad.edu.mx', 6),
    record('student-carlos', '20260421', 'Carlos Ramírez Soto', 'Ingeniería Industrial', 'carlos.ramirez@universidad.edu.mx', 2),
    record('student-daniela', '20251106', 'Daniela Vega Ruiz', 'Gestión Empresarial', 'daniela.vega@universidad.edu.mx', 6),
    record('student-jorge', '20260097', 'Jorge Luna Pérez', 'Ingeniería Mecatrónica', 'jorge.luna@universidad.edu.mx', 4),
  ],
  teachers: [
    record('teacher-elena', 'DOC-0048', 'Dra. Elena Márquez', 'Sistemas y Computación', 'elena.marquez@universidad.edu.mx', 1, 'Doctorado en Ciencias de la Computación'),
    record('teacher-paola', 'DOC-0184', 'Mtra. Paola Hernández', 'Docencia', 'paola.hernandez@universidad.edu.mx', 1, 'Maestría en Educación'),
  ],
}

export function validDirectoryRecord(value: unknown): value is DirectoryRecord {
  if (!value || typeof value !== 'object') return false
  const item = value as DirectoryRecord
  return ['id', 'number', 'name', 'email', 'phone', 'area', 'qualification', 'notes'].every((key) => typeof item[key as keyof DirectoryRecord] === 'string')
    && !!item.id && !!item.number.trim() && !!item.name.trim() && !!item.area.trim()
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)
    && ['Activo', 'Inactivo', 'Baja'].includes(item.status)
    && Number.isInteger(item.semester) && item.semester >= 1 && item.semester <= 20
}

export function loadDirectory(kind: DirectoryKind): { records: DirectoryRecord[]; error: string } {
  try {
    const saved = localStorage.getItem(`campusone-${kind}-v1`)
    if (saved === null) return { records: directorySeeds[kind].map((item) => ({ ...item })), error: '' }
    const records: unknown = JSON.parse(saved)
    if (!Array.isArray(records) || !records.every(validDirectoryRecord)
      || new Set(records.map((item) => item.id)).size !== records.length
      || new Set(records.map((item) => item.number.toLowerCase())).size !== records.length) throw new Error('Invalid directory')
    return { records, error: '' }
  } catch {
    return { records: [], error: 'No se pudo leer el directorio guardado. Los datos existentes no se sobrescribirán. Revisa el almacenamiento del navegador antes de continuar.' }
  }
}

export function prepareDirectoryRecord(draft: DirectoryRecord, records: DirectoryRecord[], kind: DirectoryKind): { record: DirectoryRecord; error: string } {
  const normalized = { ...draft, number: draft.number.trim().toUpperCase(), name: draft.name.trim(), email: draft.email.trim().toLowerCase(), phone: draft.phone.trim(), area: draft.area.trim(), qualification: draft.qualification.trim(), notes: draft.notes.trim() }
  let error = ''
  if (!validDirectoryRecord(normalized)) error = 'Completa nombre, identificador, correo válido y área. El semestre debe estar entre 1 y 20.'
  else if (kind === 'teachers' && !normalized.qualification) error = 'Indica el grado académico del docente.'
  else if (records.some((item) => item.id !== draft.id && item.number.toLowerCase() === normalized.number.toLowerCase())) error = 'Ese identificador ya está registrado.'
  else if (records.some((item) => item.id !== draft.id && item.email.toLowerCase() === normalized.email)) error = 'Ese correo ya está registrado en este directorio.'
  return { record: normalized, error }
}

export function filterDirectory(records: DirectoryRecord[], query: string, area: string, status: string) {
  const text = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  return records.filter((item) => text(`${item.name} ${item.number} ${item.email} ${item.area}`).includes(text(query.trim())) && (!area || item.area === area) && (!status || item.status === status))
}
