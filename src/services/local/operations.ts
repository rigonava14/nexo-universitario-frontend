import { Operations, defaultOperations, validOperations } from '../../operations'
import type { OperationsService } from '../index'
import type { Loaded, Saved } from '../types'

const operationsKey = 'campusone-operations-v1'

export function loadOperations(): Loaded<Operations> {
  try {
    const saved = localStorage.getItem(operationsKey)
    if (saved === null) return { data: structuredClone(defaultOperations), error: '', version: null }
    const data: unknown = JSON.parse(saved)
    if (!validOperations(data)) throw new Error('Invalid operations')
    return { data, error: '', version: saved }
  } catch {
    return {
      data: structuredClone(defaultOperations),
      error:
        'No se pudieron leer los datos operativos guardados. Para protegerlos, la edición está bloqueada hasta corregir el almacenamiento del navegador.',
      version: null,
    }
  }
}

export function saveOperations(data: Operations, expectedVersion: string | null): Saved {
  if (!validOperations(data))
    return {
      error: 'Revisa los campos obligatorios, fechas, identificadores, cupos y porcentajes.',
      version: expectedVersion,
    }
  try {
    if (localStorage.getItem(operationsKey) !== expectedVersion)
      return {
        error:
          'Los datos cambiaron en otra pestaña. Recarga este módulo antes de guardar para conservar los cambios existentes.',
        version: expectedVersion,
      }
    const serialized = JSON.stringify(data)
    localStorage.setItem(operationsKey, serialized)
    return { error: '', version: serialized }
  } catch {
    return {
      error: 'No se pudo guardar. Revisa el espacio y los permisos del navegador e intenta de nuevo.',
      version: expectedVersion,
    }
  }
}

export const localOperationsService: OperationsService = {
  async load() {
    return loadOperations()
  },
  async save(data, expectedVersion) {
    return saveOperations(data, expectedVersion)
  },
}
