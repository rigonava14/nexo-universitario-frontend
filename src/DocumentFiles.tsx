import { FormEvent, useState } from 'react'
import { SchoolDocument, validateAttachment } from './document-store'
import { useDocuments } from './hooks/data'
import { OperationFeedback } from './operation-ui'
import './directory.css'

export default function DocumentFiles({
  ownerType,
  ownerId,
  administrative = true,
}: {
  ownerType: SchoolDocument['ownerType']
  ownerId: string
  administrative?: boolean
}) {
  const store = useDocuments(ownerType, ownerId)
  const documents = store.data ?? []
  const [draft, setDraft] = useState<SchoolDocument | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const loading = store.isPending
  const [saving, setSaving] = useState(false)
  const loadError = store.error instanceof Error ? store.error.message : ''
  async function save(event: FormEvent) {
    event.preventDefault()
    if (!draft || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (file) await validateAttachment(file)
      const document = {
        ...draft,
        name: draft.name.trim(),
        blob: file ?? draft.blob,
        fileName: file?.name ?? draft.fileName,
      }
      await store.save(document)
      setDraft(null)
      setFile(null)
      setNotice('Documento guardado en este navegador.')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo guardar el documento.')
    } finally {
      setSaving(false)
    }
  }
  function download(document: SchoolDocument) {
    if (!document.blob) return
    const url = URL.createObjectURL(document.blob)
    const link = window.document.createElement('a')
    link.href = url
    link.download = document.fileName
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <section className="operation-panel">
      <div className="operation-panel-heading">
        <h2>Documentos del expediente</h2>
        <button
          className="secondary-button"
          disabled={loading || saving}
          onClick={() => {
            setError('')
            setFile(null)
            setDraft({
              id: crypto.randomUUID(),
              ownerType,
              ownerId,
              name: '',
              physical: false,
              receivedDate: '',
              receivedBy: '',
              reviewed: false,
              notes: '',
              fileName: '',
              createdAt: new Date().toISOString(),
            })
          }}
        >
          Registrar documento
        </button>
      </div>
      <p className="directory-local">
        PDF, PNG o JPEG · Hasta 10 MB por archivo. Archivos locales en este navegador; la revisión la registra el
        personal responsable.
      </p>
      <OperationFeedback error={error || loadError} notice={notice} />
      {loading ? (
        <p role="status">Cargando documentos…</p>
      ) : (
        <div className="directory-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Digital</th>
                <th>Físico recibido</th>
                <th>Revisión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{document.name}</td>
                  <td>{document.fileName || 'Sin archivo'}</td>
                  <td>{document.physical ? `${document.receivedDate} · ${document.receivedBy}` : 'No registrado'}</td>
                  <td>{document.reviewed ? 'Revisado' : 'Pendiente'}</td>
                  <td>
                    {administrative && (
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setDraft({ ...document })
                          setFile(null)
                          setError('')
                        }}
                      >
                        Editar<span className="directory-sr"> documento {document.name}</span>
                      </button>
                    )}
                    {document.blob && (
                      <button className="secondary-button" onClick={() => download(document)}>
                        Descargar<span className="directory-sr"> {document.name}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!documents.length && <p>No hay documentos registrados.</p>}
        </div>
      )}
      {draft && (
        <form className="directory-form" onSubmit={save}>
          <label>
            Tipo o nombre del documento
            <input
              required
              maxLength={150}
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            />
          </label>
          <label>
            Archivo digital
            <input
              type="file"
              required={!administrative}
              accept="application/pdf,image/png,image/jpeg"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          {administrative && (
            <fieldset className="operation-checklist directory-wide">
              <legend>Recepción y revisión</legend>
              <label>
                <input
                  type="checkbox"
                  checked={draft.physical}
                  onChange={(event) => setDraft({ ...draft, physical: event.target.checked })}
                />
                Documento físico recibido
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={draft.reviewed}
                  onChange={(event) => setDraft({ ...draft, reviewed: event.target.checked })}
                />
                Revisado por Control escolar
              </label>
            </fieldset>
          )}
          {draft.physical && (
            <>
              <label>
                Fecha de recepción
                <input
                  required
                  type="date"
                  value={draft.receivedDate}
                  onChange={(event) => setDraft({ ...draft, receivedDate: event.target.value })}
                />
              </label>
              <label>
                Recibido por
                <input
                  required
                  value={draft.receivedBy}
                  onChange={(event) => setDraft({ ...draft, receivedBy: event.target.value })}
                />
              </label>
            </>
          )}
          <label className="directory-wide">
            Observaciones
            <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} />
          </label>
          <footer className="directory-wide">
            <button type="button" className="secondary-button" disabled={saving} onClick={() => setDraft(null)}>
              Cancelar
            </button>
            <button className="primary-button compact" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar documento'}
            </button>
          </footer>
        </form>
      )}
    </section>
  )
}
