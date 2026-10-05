import { FormEvent, useState } from 'react'
import { Plus, Save, Search } from 'lucide-react'
import { Graduation, Residency, graduationError, graduationRequirements, residencyError } from './operations'
import { OperationEditor, OperationEmpty, OperationFeedback, OperationSummary, PersonOptions, personName, useOperations } from './operation-ui'
import './directory.css'

export default function ProcessModules({ kind }: { kind: 'residencies' | 'graduations' }) {
  const store = useOperations()
  const { data, students, teachers } = store
  const residence = kind === 'residencies'
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [draft, setDraft] = useState<Residency | Graduation | null>(null)
  const list = residence ? data.residencies : data.graduations
  const statuses = residence ? ['Solicitada', 'En proceso', 'Concluida', 'Cancelada'] : ['En revisión', 'Lista para examen', 'Titulada', 'Cancelada']
  const filtered = list.filter((item) => `${personName(students, item.studentId)} ${'project' in item ? `${item.project} ${item.company}` : `${item.title} ${item.modality}`}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (!status || item.status === status))
  function create() {
    store.setError('')
    const id = crypto.randomUUID()
    setDraft(residence ? { id, studentId: '', teacherId: '', project: '', company: '', start: '', end: '', hours: 0, status: 'Solicitada', evidence: '', notes: '' } : { id, studentId: '', advisorId: '', modality: data.settings.graduationModalities[0], title: '', date: '', status: 'En revisión', requirements: [], notes: '' })
  }
  function update(key: string, value: string | number | string[]) { setDraft((current) => current ? { ...current, [key]: value } : current); store.setError('') }
  function save(event: FormEvent) {
    event.preventDefault()
    if (!draft) return
    const teacherId = 'project' in draft ? draft.teacherId : draft.advisorId
    if (!students.some((item) => item.id === draft.studentId) || !teachers.some((item) => item.id === teacherId)) { store.setError('Selecciona un alumno y un asesor del directorio.'); return }
    const failure = 'project' in draft ? residencyError(draft, data.settings, data.residencies) : graduationError(draft, data.graduations)
    if (failure) { store.setError(failure); return }
    const replace = <T extends { id: string }>(records: T[], record: T) => records.some((item) => item.id === record.id) ? records.map((item) => item.id === record.id ? record : item) : [...records, record]
    const next = 'project' in draft ? { ...data, residencies: replace(data.residencies, { ...draft, project: draft.project.trim(), company: draft.company.trim(), evidence: draft.evidence.trim() }) } : { ...data, graduations: replace(data.graduations, { ...draft, title: draft.title.trim() }) }
    if (store.commit(next)) { setDraft(null); setQuery(''); setStatus('') }
  }
  return <section className="operation-module"><div className="module-heading"><div><p className="date-label">GESTIÓN UNIVERSITARIA</p><h1>{residence ? 'Residencias' : 'Titulación'}</h1><p>{residence ? 'Proyectos, asesores, horas y seguimiento de evidencias.' : 'Modalidades, revisión de requisitos y actos de titulación.'}</p></div><button className="primary-button compact" disabled={store.blocked || !students.length || !teachers.length} onClick={create}><Plus size={17} />{residence ? 'Nueva residencia' : 'Nuevo expediente'}</button></div>
    <p className="directory-local">Demostración local · {residence ? `Mínimo de liberación: ${data.settings.residencyHours} horas.` : 'La revisión de requisitos la registra el personal responsable.'}</p>
    <OperationFeedback error={draft ? '' : store.error} notice={store.notice} />
    <OperationSummary items={[{ label: 'Expedientes', value: list.length }, { label: residence ? 'En proceso' : 'En revisión', value: list.filter((item) => item.status === (residence ? 'En proceso' : 'En revisión')).length }, { label: residence ? 'Concluidas' : 'Titulados', value: list.filter((item) => item.status === (residence ? 'Concluida' : 'Titulada')).length }]} />
    <div className="academic-catalog"><div className="operation-toolbar"><label><Search size={17} /><input aria-label="Buscar expedientes" placeholder="Buscar alumno o proyecto" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="directory-table-wrap"><table><caption>{filtered.length} expedientes encontrados</caption><thead><tr><th>Alumno</th><th>{residence ? 'Proyecto y empresa' : 'Trabajo y modalidad'}</th><th>Asesor</th><th>{residence ? 'Horas' : 'Requisitos'}</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{personName(students, item.studentId)}</td><td><strong>{'project' in item ? item.project : item.title}</strong><small>{'company' in item ? item.company : item.modality}</small></td><td>{personName(teachers, 'teacherId' in item ? item.teacherId : item.advisorId)}</td><td>{'hours' in item ? `${item.hours} / ${data.settings.residencyHours}` : `${item.requirements.length} / ${graduationRequirements.length}`}</td><td><span className="directory-status">{item.status}</span></td><td><button className="secondary-button" onClick={() => { store.setError(''); setDraft(structuredClone(item)) }}>Ver expediente<span className="directory-sr"> de {personName(students, item.studentId)}</span></button></td></tr>)}</tbody></table></div>
      {!filtered.length && <OperationEmpty>{students.length && teachers.length ? 'Registra un expediente o ajusta los filtros.' : 'Primero registra alumnos y docentes en sus directorios.'}</OperationEmpty>}</div>
    {draft && <OperationEditor title={residence ? 'Expediente de residencia' : 'Expediente de titulación'} close={() => setDraft(null)}><form className="directory-form" onSubmit={save}>
      <label>Alumno<select required value={draft.studentId} onChange={(event) => update('studentId', event.target.value)}><PersonOptions records={students} selectedId={draft.studentId} /></select></label>
      <label>Asesor<select required value={'teacherId' in draft ? draft.teacherId : draft.advisorId} onChange={(event) => update('teacherId' in draft ? 'teacherId' : 'advisorId', event.target.value)}><PersonOptions records={teachers} selectedId={'teacherId' in draft ? draft.teacherId : draft.advisorId} /></select></label>
      {'project' in draft ? <>
        <label>Proyecto<input required maxLength={200} value={draft.project} onChange={(event) => update('project', event.target.value)} /></label><label>Empresa o institución<input required maxLength={150} value={draft.company} onChange={(event) => update('company', event.target.value)} /></label>
        <label>Inicio<input required type="date" value={draft.start} onChange={(event) => update('start', event.target.value)} /></label><label>Término<input required type="date" min={draft.start} value={draft.end} onChange={(event) => update('end', event.target.value)} /></label>
        <label>Horas realizadas<input required type="number" min={0} max={10000} step={1} value={draft.hours} onChange={(event) => update('hours', Number(event.target.value))} /></label>
        <label>Referencia de evidencia (URL)<input type="url" placeholder="https://…" value={draft.evidence} onChange={(event) => update('evidence', event.target.value)} /></label>
        {draft.evidence.startsWith('https://') && <a className="directory-wide" href={draft.evidence} target="_blank" rel="noopener noreferrer">Abrir referencia de evidencia</a>}
      </> : <>
        <label>Modalidad<select required value={draft.modality} onChange={(event) => update('modality', event.target.value)}>{Array.from(new Set([...data.settings.graduationModalities, draft.modality])).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Trabajo o tema<input required maxLength={200} value={draft.title} onChange={(event) => update('title', event.target.value)} /></label><label>Fecha del acto<input type="date" value={draft.date} onChange={(event) => update('date', event.target.value)} /></label>
        <fieldset className="operation-checklist directory-wide"><legend>Requisitos revisados</legend>{graduationRequirements.map((requirement) => <label key={requirement}><input type="checkbox" checked={draft.requirements.includes(requirement)} onChange={(event) => update('requirements', event.target.checked ? [...draft.requirements, requirement] : draft.requirements.filter((item) => item !== requirement))} />{requirement}</label>)}</fieldset>
      </>}
      <label>Estado<select value={draft.status} onChange={(event) => update('status', event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="directory-wide">Observaciones<textarea rows={3} maxLength={3000} value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></label>
      <div className="directory-wide"><OperationFeedback error={store.error} notice="" /></div><footer className="directory-wide"><button type="button" className="secondary-button" onClick={() => setDraft(null)}>Cancelar</button><button className="primary-button compact" disabled={store.blocked}><Save size={16} />Guardar expediente</button></footer>
    </form></OperationEditor>}
  </section>
}
