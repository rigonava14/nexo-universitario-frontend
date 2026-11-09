import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { DirectoryRecord } from './directory'
import { Operations, validOperations } from './operations'
import { useDirectoryRecords, useOperationsStore } from './hooks/data'
import './operations.css'

export function useOperations() {
  const store = useOperationsStore()
  const students = useDirectoryRecords('students')
  const teachers = useDirectoryRecords('teachers')
  const blocked = store.loadError || students.error || teachers.error
  function commit(next: Operations) {
    store.setNotice('')
    if (blocked) {
      store.setError(blocked)
      return false
    }
    if (!validOperations(next)) {
      store.setError('Revisa los campos obligatorios, fechas, identificadores, cupos y porcentajes.')
      return false
    }
    return store.commit(next)
  }
  return {
    data: store.data,
    students: students.records,
    teachers: teachers.records,
    error: blocked || store.error,
    blocked: !!blocked,
    notice: store.notice,
    setError: store.setError,
    commit,
  }
}

export const personName = (records: DirectoryRecord[], id: string) =>
  records.find((item) => item.id === id)?.name ?? 'Expediente no disponible'
export function PersonOptions({ records, selectedId }: { records: DirectoryRecord[]; selectedId?: string }) {
  return (
    <>
      <option value="">Seleccionar</option>
      {records
        .filter((item) => item.status === 'Activo' || item.id === selectedId)
        .map((item) => (
          <option key={item.id} value={item.id}>
            {item.number} · {item.name}
          </option>
        ))}
    </>
  )
}
export function OperationFeedback({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      {error && (
        <p className="directory-error" role="alert">
          {error}
        </p>
      )}
      {!error && notice && (
        <p className="directory-notice" role="status">
          {notice}
        </p>
      )}
    </>
  )
}
export function OperationEditor({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog ref={ref} className="directory-dialog" aria-labelledby="operation-editor-title" onCancel={close}>
      <div className="directory-dialog-heading">
        <h2 id="operation-editor-title">{title}</h2>
        <button className="icon-button" aria-label="Cerrar formulario" onClick={close}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function OperationSummary({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="operation-summary">
      {items.map((item) => (
        <article key={item.label}>
          <small>{item.label}</small>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  )
}
export function OperationEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="academic-empty">
      <h2>Sin registros</h2>
      <p>{children}</p>
    </div>
  )
}
