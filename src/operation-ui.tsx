import { ReactNode, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { DirectoryRecord, loadDirectory } from './directory'
import { Operations, loadOperations, saveOperations } from './operations'
import './operations.css'

export function useOperations() {
  const [loaded] = useState(loadOperations)
  const [students] = useState(() => loadDirectory('students'))
  const [teachers] = useState(() => loadDirectory('teachers'))
  const [data, setData] = useState(loaded.data)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const blocked = loaded.error || students.error || teachers.error
  function commit(next: Operations) {
    setNotice('')
    const current = loadOperations()
    const changedElsewhere = JSON.stringify(current.data) !== JSON.stringify(data)
    const failure = blocked || current.error || (changedElsewhere ? 'Los datos cambiaron en otra pestaña. Recarga este módulo antes de guardar para conservar los cambios existentes.' : saveOperations(next))
    if (failure) { setError(failure); return false }
    setData(next); setError(''); setNotice('Cambios guardados en este navegador.'); return true
  }
  return { data, students: students.records, teachers: teachers.records, error: blocked || error, blocked: !!blocked, notice, setError, commit }
}

export const personName = (records: DirectoryRecord[], id: string) => records.find((item) => item.id === id)?.name ?? 'Expediente no disponible'
export function PersonOptions({ records, selectedId }: { records: DirectoryRecord[]; selectedId?: string }) {
  return <><option value="">Seleccionar</option>{records.filter((item) => item.status === 'Activo' || item.id === selectedId).map((item) => <option key={item.id} value={item.id}>{item.number} · {item.name}</option>)}</>
}
export function OperationFeedback({ error, notice }: { error: string; notice: string }) {
  return <>{error && <p className="directory-error" role="alert">{error}</p>}{!error && notice && <p className="directory-notice" role="status">{notice}</p>}</>
}
export function OperationEditor({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return <dialog ref={ref} className="directory-dialog" aria-labelledby="operation-editor-title" onCancel={close}><div className="directory-dialog-heading"><h2 id="operation-editor-title">{title}</h2><button className="icon-button" aria-label="Cerrar formulario" onClick={close}><X size={20} /></button></div>{children}</dialog>
}
export function OperationSummary({ items }: { items: { label: string; value: string | number }[] }) {
  return <div className="operation-summary">{items.map((item) => <article key={item.label}><small>{item.label}</small><strong>{item.value}</strong></article>)}</div>
}
export function OperationEmpty({ children }: { children: ReactNode }) { return <div className="academic-empty"><h2>Sin registros</h2><p>{children}</p></div> }
