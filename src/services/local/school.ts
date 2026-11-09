import type { InstitutionSettings } from '../../institution'
import { SchoolData, emptySchool, validSchool } from '../../school'
import type { SchoolService } from '../index'
import type { Loaded, Saved } from '../types'

const schoolKey = 'campusone-school-v1'

export function loadSchool(settings: InstitutionSettings): Loaded<SchoolData> {
  try {
    const saved = localStorage.getItem(schoolKey)
    const data: unknown = saved === null ? structuredClone(emptySchool) : JSON.parse(saved)
    if (!validSchool(data)) throw new Error('Invalid school data')
    // The catalogue starts with the existing plan subjects; no existing record is replaced.
    for (const program of settings.academicOffer.programs)
      for (const term of program.curriculum)
        for (const subject of term.subjects)
          if (
            !data.subjects.some(
              (item) => item.id === subject.id || item.code.toLowerCase() === subject.code.toLowerCase(),
            )
          )
            data.subjects.push({ ...subject })
    return { data, error: '', version: saved }
  } catch {
    return {
      data: structuredClone(emptySchool),
      error: 'No se pudo leer Control escolar. La escritura está bloqueada para proteger los datos guardados.',
      version: null,
    }
  }
}

export function saveSchool(data: SchoolData, expectedVersion: string | null): Saved {
  try {
    if (localStorage.getItem(schoolKey) !== expectedVersion)
      return { error: 'Los datos cambiaron en otra pestaña. Recarga antes de guardar.', version: expectedVersion }
    const serialized = JSON.stringify(data)
    localStorage.setItem(schoolKey, serialized)
    return { error: '', version: serialized }
  } catch {
    return {
      error: 'No se pudo guardar. El estado anterior se conservó. Revisa el espacio disponible del navegador.',
      version: expectedVersion,
    }
  }
}

export const localSchoolService: SchoolService = {
  async load(settings) {
    return loadSchool(settings)
  },
  async save(data, expectedVersion) {
    return saveSchool(data, expectedVersion)
  },
}
