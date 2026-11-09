import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { DirectoryKind } from '../directory'
import type { SchoolDocument } from '../document-store'
import type { InstitutionSettings } from '../institution'
import { services } from '../services'
import { queryKeys } from './query-client'
import { useVersionedStore } from './useVersionedStore'

/** Directorio de alumnos o docentes con guardado. */
export function useDirectoryStore(kind: DirectoryKind) {
  return useVersionedStore(
    queryKeys.directory(kind),
    () => services.directory.load(kind),
    (records, version) => services.directory.save(kind, records, version),
  )
}

/** Solo lectura del directorio: `{ records, error }`, como devolvía la función anterior. */
export function useDirectoryRecords(kind: DirectoryKind) {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.directory(kind),
    queryFn: () => services.directory.load(kind),
  })
  return { records: data.data, error: data.error }
}

export function useOperationsStore() {
  return useVersionedStore(queryKeys.operations, () => services.operations.load(), services.operations.save)
}

/** Solo lectura de operaciones: `{ data, error }`. */
export function useOperationsData() {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.operations, queryFn: () => services.operations.load() })
  return { data: data.data, error: data.error }
}

export function useSchoolStore(settings: InstitutionSettings) {
  return useVersionedStore(queryKeys.school, () => services.school.load(settings), services.school.save)
}

/** Solo lectura de control escolar: `{ data, error }`. */
export function useSchoolData(settings: InstitutionSettings) {
  const { data } = useSuspenseQuery({ queryKey: queryKeys.school, queryFn: () => services.school.load(settings) })
  return { data: data.data, error: data.error }
}

/** Documentos de un aspirante o alumno. La carga no suspende: la pantalla muestra su propio estado. */
export function useDocuments(ownerType: SchoolDocument['ownerType'], ownerId: string) {
  const queryClient = useQueryClient()
  const key = queryKeys.documents(ownerType, ownerId)
  const query = useQuery({ queryKey: key, queryFn: () => services.documents.list(ownerType, ownerId) })
  async function save(document: SchoolDocument) {
    await services.documents.save(document)
    await queryClient.invalidateQueries({ queryKey: key })
  }
  return { ...query, save }
}
