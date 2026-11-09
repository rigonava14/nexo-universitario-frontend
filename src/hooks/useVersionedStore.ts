import { useState } from 'react'
import { QueryKey, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { Loaded, Saved } from '../services'

const queues = new Map<string, Promise<unknown>>()

/**
 * Datos versionados con guardado optimista.
 *
 * `commit` es síncrono para que las pantallas sigan su flujo actual: aplica el cambio al momento y lo guarda
 * en segundo plano. Los guardados de una misma clave se encadenan para que cada uno use la versión que dejó
 * el anterior. Si un guardado falla, se restaura el estado previo y se muestra el error.
 */
export function useVersionedStore<T>(
  key: QueryKey,
  load: () => Promise<Loaded<T>>,
  save: (data: T, expectedVersion: string | null) => Promise<Saved>,
) {
  const queryClient = useQueryClient()
  const { data: loaded } = useSuspenseQuery({ queryKey: key, queryFn: load })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function commit(next: T, savedNotice = 'Cambios guardados en este navegador.') {
    const previous = queryClient.getQueryData<Loaded<T>>(key) ?? loaded
    queryClient.setQueryData<Loaded<T>>(key, { ...previous, data: next })
    setError('')
    setNotice(savedNotice)
    const id = JSON.stringify(key)
    const run = (queues.get(id) ?? Promise.resolve()).then(async () => {
      const version = queryClient.getQueryData<Loaded<T>>(key)?.version ?? null
      const result = await save(next, version)
      if (result.error) {
        queryClient.setQueryData<Loaded<T>>(key, previous)
        setNotice('')
        setError(result.error)
        return
      }
      const current = queryClient.getQueryData<Loaded<T>>(key)
      queryClient.setQueryData<Loaded<T>>(key, { data: current?.data ?? next, error: '', version: result.version })
    })
    queues.set(
      id,
      run.catch(() => undefined),
    )
    return true
  }

  return { data: loaded.data, loadError: loaded.error, error, setError, notice, setNotice, commit }
}
