import { FormEvent, useState } from 'react'
import { Plus, Save, Search } from 'lucide-react'
import { Academy } from './operations'
import { OperationEditor, OperationEmpty, OperationFeedback, OperationSummary, PersonOptions, personName, useOperations } from './operation-ui'
import './directory.css'

export default function Academies() {
  const store = useOperations()
  const { data, teachers } = store
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [draft, setDraft] = useState<Academy | null>(null)
  const filtered = data.academies.filter((item) => `${item.name} ${item.area}`.toLowerCase().includes(query.toLowerCase()) && (!status || item.status === status))
  function update(key: keyof Academy, value: string | string[]) { setDraft((current) => current ? { ...current, [key]: value } : current); store.setError('') }
  function save(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    if (!draft.memberIds.includes(draft.coordinatorId)) { store.setError('El responsable debe pertenecer a la academia.'); return }
    if (draft.memberIds.some((id) => !teachers.some((item) => item.id === id))) { store.setError('Todos los integrantes deben existir en el directorio docente.'); return }
    if (data.academies.some((item) => item.id !== draft.id && item.name.trim().toLowerCase() === draft.name.trim().toLowerCase())) { store.setError('Ya existe una academia con ese nombre.'); return }
    const item = { ...draft, name: draft.name.trim(), area: draft.area.trim() }
    const academies = data.academies.some((entry) => entry.id === item.id) ? data.academies.map((entry) => entry.id === item.id ? item : entry) : [...data.academies, item]
    if (store.commit({ ...data, academies })) { setDraft(null); setQuery(''); setStatus('') }
  }
  return <section className="operation-module"><div className="module-heading"><div><p className="date-label">ORGANIZACIÓN ACADÉMICA</p><h1>Academias</h1><p>Organiza responsables, integrantes y acuerdos de trabajo.</p></div><button className="primary-button compact" disabled={store.blocked || !teachers.length} onClick={() => { store.setError(''); setDraft({ id: crypto.randomUUID(), name: '', area: '', coordinatorId: '', memberIds: [], status: 'Activa', agreements: '' }) }}><Plus size={17} />Nueva academia</button></div>
    <p className="directory-local">Demostración local · Los integrantes se seleccionan del directorio docente.</p><OperationFeedback error={draft ? '' : store.error} notice={store.notice} />
    <OperationSummary items={[{ label: 'Academias', value: data.academies.length }, { label: 'Activas', value: data.academies.filter((item) => item.status === 'Activa').length }, { label: 'Docentes participantes', value: new Set(data.academies.flatMap((item) => item.memberIds)).size }]} />
    <div className="academic-catalog"><div className="operation-toolbar"><label><Search size={17} /><input aria-label="Buscar academias" placeholder="Buscar academia o área" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option><option>Activa</option><option>Inactiva</option></select></div><div className="operation-cards">{filtered.map((item) => <article key={item.id}><span className="directory-status">{item.status}</span><h2>{item.name}</h2><p>{item.area}</p><p><strong>Responsable:</strong> {personName(teachers, item.coordinatorId)}</p><p>{item.memberIds.length} integrantes</p><button className="secondary-button" onClick={() => { store.setError(''); setDraft(structuredClone(item)) }}>Integrantes y acuerdos<span className="directory-sr"> de {item.name}</span></button></article>)}</div>{!filtered.length && <OperationEmpty>{teachers.length ? 'Crea una academia o ajusta los filtros.' : 'Registra docentes para asignar responsables e integrantes.'}</OperationEmpty>}</div>
    {draft && <OperationEditor title="Academia e integrantes" close={() => setDraft(null)}><form className="directory-form" onSubmit={save}>
      <label>Nombre de la academia<input required maxLength={150} value={draft.name} onChange={(event) => update('name', event.target.value)} /></label><label>Área académica<input required maxLength={150} value={draft.area} onChange={(event) => update('area', event.target.value)} /></label>
      <label>Responsable<select required value={draft.coordinatorId} onChange={(event) => { const id = event.target.value; setDraft({ ...draft, coordinatorId: id, memberIds: id ? Array.from(new Set([...draft.memberIds, id])) : draft.memberIds }); store.setError('') }}><PersonOptions records={teachers} selectedId={draft.coordinatorId} /></select></label><label>Estado<select value={draft.status} onChange={(event) => update('status', event.target.value)}><option>Activa</option><option>Inactiva</option></select></label>
      <fieldset className="operation-checklist directory-wide"><legend>Integrantes</legend>{teachers.filter((teacher) => teacher.status === 'Activo' || draft.memberIds.includes(teacher.id)).map((teacher) => <label key={teacher.id}><input type="checkbox" checked={draft.memberIds.includes(teacher.id)} disabled={teacher.id === draft.coordinatorId} onChange={(event) => update('memberIds', event.target.checked ? [...draft.memberIds, teacher.id] : draft.memberIds.filter((id) => id !== teacher.id))} />{teacher.name}</label>)}</fieldset>
      <label className="directory-wide">Acuerdos y seguimiento<textarea rows={6} maxLength={10000} placeholder="Fecha, acuerdo, responsable y avance" value={draft.agreements} onChange={(event) => update('agreements', event.target.value)} /></label><div className="directory-wide"><OperationFeedback error={store.error} notice="" /></div><footer className="directory-wide"><button type="button" className="secondary-button" onClick={() => setDraft(null)}>Cancelar</button><button className="primary-button compact" disabled={store.blocked}><Save size={16} />Guardar academia</button></footer>
    </form></OperationEditor>}
  </section>
}
