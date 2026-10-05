import { FormEvent, useEffect, useRef, useState } from 'react'
import { GraduationCap, Plus, Save, Search, Users, X } from 'lucide-react'
import { DirectoryKind, DirectoryRecord, filterDirectory, loadDirectory, prepareDirectoryRecord } from './directory'
import { InstitutionSettings } from './institution'
import './directory.css'
import { Link } from 'react-router-dom'
import DocumentFiles from './DocumentFiles'
import { effectiveStudentStatus, loadSchool, studentIsWithdrawn } from './school'

export default function PeopleDirectory({ kind, settings }: { kind: DirectoryKind; settings: InstitutionSettings }) {
  const [loaded] = useState(() => loadDirectory(kind))
  const [records, setRecords] = useState(loaded.records)
  const [school] = useState(() => loadSchool(settings))
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DirectoryRecord | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const student = kind === 'students'
  const title = student ? 'Alumnos' : 'Docentes'
  const numberLabel = student ? 'Matrícula' : 'Número de empleado'
  const areaLabel = student ? 'Programa académico' : 'Departamento'
  const displayedRecords = student ? records.map((item) => ({ ...item, area: settings.academicOffer.programs.find((program) => program.id === school.data.careers.find((career) => career.studentId === item.id)?.programId)?.name ?? item.area, status: effectiveStudentStatus(school.data, item.id, item.status) })) : records
  const selected = displayedRecords.find((item) => item.id === selectedId)
  const filtered = filterDirectory(displayedRecords, query, area, status)
  const areas = Array.from(new Set(displayedRecords.map((item) => item.area))).sort()
  const programs = Array.from(new Set(settings.academicOffer.programs.map((item) => item.name)))

  useEffect(() => {
    if (draft || selected) dialog.current?.showModal()
    else dialog.current?.close()
  }, [draft, selected])

  function close() { setDraft(null); setSelectedId(null); setError('') }
  function edit(item?: DirectoryRecord) {
    setError(''); setNotice(''); setSelectedId(null)
    setDraft(item ? { ...item } : { id: crypto.randomUUID(), number: '', name: '', email: '', phone: '', area: '', status: 'Activo', semester: 1, qualification: '', notes: '' })
  }
  function update<K extends keyof DirectoryRecord>(key: K, value: DirectoryRecord[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current)
    setError('')
  }
  function save(event: FormEvent) {
    event.preventDefault()
    if (!draft || loaded.error) return
    if (student && school.data.careers.some((item) => item.studentId === draft.id) && displayedRecords.find((item) => item.id === draft.id)?.area !== draft.area) { setError('Registra el cambio de carrera desde Movimientos en Control escolar.'); return }
    if (student && studentIsWithdrawn(school.data, draft.id) && draft.status !== 'Baja') { setError('Registra un reingreso desde Control escolar antes de cambiar el estado.'); return }
    const result = prepareDirectoryRecord(draft, records, kind)
    if (result.error) { setError(result.error); return }
    const next = records.some((item) => item.id === draft.id) ? records.map((item) => item.id === draft.id ? result.record : item) : [...records, result.record]
    try { localStorage.setItem(`campusone-${kind}-v1`, JSON.stringify(next)) }
    catch { setError('No se pudo guardar. Revisa el espacio o los permisos del navegador e intenta nuevamente.'); return }
    setRecords(next); setQuery(''); setArea(''); setStatus(''); close(); setSelectedId(result.record.id)
    setNotice('Expediente guardado en este navegador.')
  }

  return <section className="people-directory">
    <div className="module-heading"><div><p className="date-label">COMUNIDAD CAMPUSONE</p><h1>{title}</h1><p>{student ? 'Administra datos de contacto y el expediente académico básico.' : 'Administra el directorio y los expedientes profesionales del personal docente.'}</p></div><button className="primary-button compact" disabled={!!loaded.error} onClick={() => edit()}><Plus size={18} />{student ? 'Nuevo alumno' : 'Nuevo docente'}</button></div>
    <p className="directory-local">Demostración local · Los expedientes de este directorio se guardan únicamente en este navegador.</p>
    {loaded.error && <p className="directory-error" role="alert">{loaded.error}</p>}
    {notice && <p className="directory-notice" role="status">{notice}</p>}
    <div className="academic-summary"><article><span><Users size={22} /></span><div><small>Total de {title.toLowerCase()}</small><strong>{records.length}</strong></div></article><article><span><GraduationCap size={22} /></span><div><small>Activos</small><strong>{displayedRecords.filter((item) => item.status === 'Activo').length}</strong></div></article></div>
    <div className="academic-catalog">
      <div className="academic-toolbar"><label><Search size={18} /><input aria-label={`Buscar ${title.toLowerCase()}`} placeholder="Buscar por nombre, identificador o correo" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label={`Filtrar por ${areaLabel.toLowerCase()}`} value={area} onChange={(event) => setArea(event.target.value)}><option value="">{student ? 'Todos los programas' : 'Todos los departamentos'}</option>{areas.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option>{['Activo', 'Inactivo', 'Baja'].map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className="directory-table-wrap"><table><caption>{filtered.length} de {records.length} expedientes</caption><thead><tr><th>{numberLabel}</th><th>Nombre y contacto</th><th>{areaLabel}</th><th>{student ? 'Semestre' : 'Grado académico'}</th><th>Estado</th><th>Expediente</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{item.number}</td><td><strong>{item.name}</strong><small>{item.email}</small></td><td>{item.area}</td><td>{student ? `${item.semester}°` : item.qualification}</td><td><span className={`directory-status ${item.status === 'Activo' ? 'active' : ''}`}>{item.status}</span></td><td><button className="secondary-button" onClick={() => { setSelectedId(item.id); setNotice('') }}>Consultar<span className="directory-sr"> expediente de {item.name}</span></button></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="academic-empty"><Users size={28} /><h2>{records.length ? 'Sin coincidencias' : 'No hay expedientes disponibles'}</h2><p>{records.length ? 'Prueba otro nombre o cambia los filtros.' : 'Registra el primer expediente para comenzar.'}</p></div>}
    </div>
    <dialog ref={dialog} className="directory-dialog" aria-labelledby="directory-title" onCancel={close}>
      <div className="directory-dialog-heading"><div><p className="date-label">{draft ? 'DATOS DEL EXPEDIENTE' : numberLabel.toUpperCase() + ' · ' + (selected?.number ?? '')}</p><h2 id="directory-title">{draft ? records.some((item) => item.id === draft.id) ? 'Editar expediente' : student ? 'Nuevo alumno' : 'Nuevo docente' : selected?.name}</h2></div><button className="icon-button" aria-label="Cerrar expediente" onClick={close}><X size={20} /></button></div>
      {draft ? <form onSubmit={save} className="directory-form">
        <label>{numberLabel}<input autoFocus required maxLength={40} value={draft.number} onChange={(event) => update('number', event.target.value)} /></label>
        <label>Nombre completo<input required maxLength={150} value={draft.name} onChange={(event) => update('name', event.target.value)} /></label>
        <label>Correo electrónico<input type="email" required maxLength={150} value={draft.email} onChange={(event) => update('email', event.target.value)} /></label>
        <label>Teléfono<input type="tel" maxLength={30} value={draft.phone} onChange={(event) => update('phone', event.target.value)} /></label>
        <label>{areaLabel}<input required maxLength={150} list={student ? 'directory-programs' : undefined} value={draft.area} onChange={(event) => update('area', event.target.value)} />{student && <datalist id="directory-programs">{programs.map((item) => <option key={item} value={item} />)}</datalist>}</label>
        {student ? <label>Semestre<input type="number" required min={1} max={20} step={1} value={draft.semester} onChange={(event) => update('semester', Number(event.target.value))} /></label> : <label>Grado académico<input required maxLength={150} value={draft.qualification} onChange={(event) => update('qualification', event.target.value)} /></label>}
        <label>Estado<select value={draft.status} onChange={(event) => update('status', event.target.value as DirectoryRecord['status'])}>{['Activo', 'Inactivo', 'Baja'].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="directory-wide">Observaciones<textarea rows={3} maxLength={2000} value={draft.notes} onChange={(event) => update('notes', event.target.value)} /></label>
        {error && <p className="directory-error directory-wide" role="alert">{error}</p>}
        <footer className="directory-wide"><button type="button" className="secondary-button" onClick={close}>Cancelar</button><button className="primary-button compact" type="submit"><Save size={16} />Guardar expediente</button></footer>
      </form> : selected && <><dl className="directory-details">{[[numberLabel, selected.number], ['Estado', selected.status], [areaLabel, selected.area], [student ? 'Semestre' : 'Grado académico', student ? `${selected.semester}°` : selected.qualification], ['Correo', selected.email], ['Teléfono', selected.phone || 'Sin registrar'], ['Observaciones', selected.notes || 'Sin observaciones']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="directory-dialog-actions">{student && <Link className="secondary-button" to={`/admin/control-escolar?alumno=${selected.id}`}>Expediente escolar y kárdex</Link>}<button className="primary-button compact" disabled={!!loaded.error} onClick={() => edit(selected)}>Editar expediente</button></div>{student && <DocumentFiles key={selected.id} ownerType="student" ownerId={selected.id} />}</>}
    </dialog>
  </section>
}
