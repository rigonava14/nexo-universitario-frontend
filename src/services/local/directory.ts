import { DirectoryKind, DirectoryRecord, directorySeeds, validDirectoryRecord } from '../../directory'
import type { DirectoryService } from '../index'
import type { Loaded } from '../types'

const directoryKey = (kind: DirectoryKind) => `campusone-${kind}-v1`

export function loadDirectory(kind: DirectoryKind): Loaded<DirectoryRecord[]> {
  try {
    const saved = localStorage.getItem(directoryKey(kind))
    if (saved === null) return { data: directorySeeds[kind].map((item) => ({ ...item })), error: '', version: null }
    const records: unknown = JSON.parse(saved)
    if (
      !Array.isArray(records) ||
      !records.every(validDirectoryRecord) ||
      new Set(records.map((item) => item.id)).size !== records.length ||
      new Set(records.map((item) => item.number.toLowerCase())).size !== records.length
    )
      throw new Error('Invalid directory')
    return { data: records, error: '', version: saved }
  } catch {
    return {
      data: [],
      error:
        'No se pudo leer el directorio guardado. Los datos existentes no se sobrescribirán. Revisa el almacenamiento del navegador antes de continuar.',
      version: null,
    }
  }
}

export function saveDirectory(kind: DirectoryKind, records: DirectoryRecord[], expectedVersion: string | null) {
  try {
    if (localStorage.getItem(directoryKey(kind)) !== expectedVersion)
      return { error: 'Los datos cambiaron en otra pestaña. Recarga antes de guardar.', version: expectedVersion }
    const serialized = JSON.stringify(records)
    localStorage.setItem(directoryKey(kind), serialized)
    return { error: '', version: serialized }
  } catch {
    return {
      error: 'No se pudo guardar. Revisa el espacio o los permisos del navegador e intenta nuevamente.',
      version: expectedVersion,
    }
  }
}

export const localDirectoryService: DirectoryService = {
  async load(kind) {
    return loadDirectory(kind)
  },
  async save(kind, records, expectedVersion) {
    return saveDirectory(kind, records, expectedVersion)
  },
}
