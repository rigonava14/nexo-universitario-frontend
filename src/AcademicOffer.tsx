import { useMemo, useState } from 'react'
import { BookOpen, Building2, CheckCircle2, Copy, GraduationCap, Layers3, MapPin, Plus, Save, Search, Trash2, Users, X } from 'lucide-react'
import { InstitutionSettings } from './institution'

type Props = { settings: InstitutionSettings; onSave: (settings: InstitutionSettings) => void | boolean }
type Program = InstitutionSettings['academicOffer']['programs'][number]
type Subject = Program['curriculum'][number]['subjects'][number]
type ProgramTab = 'general' | 'plan'

const statusTone = (status: string) => status === 'Activo' ? 'active' : status === 'Borrador' ? 'draft' : 'inactive'

export default function AcademicOffer({ settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings)
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('Todos')
  const [status, setStatus] = useState('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [programTab, setProgramTab] = useState<ProgramTab>('general')
  const [semester, setSemester] = useState(1)
  const [notice, setNotice] = useState('')

  const programs = draft.academicOffer.programs
  const selected = programs.find((program) => program.id === selectedId) ?? null
  const levels = Array.from(new Set(programs.map((program) => program.level)))
  const filtered = useMemo(() => programs.filter((program) => {
    const matchesQuery = `${program.name} ${program.code} ${program.modality}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (level === 'Todos' || program.level === level) && (status === 'Todos' || program.status === status)
  }), [programs, query, level, status])

  function updateProgram(patch: Partial<Program>) {
    if (!selectedId) return
    setDraft((current) => ({ ...current, academicOffer: { ...current.academicOffer, programs: current.academicOffer.programs.map((program) => program.id === selectedId ? { ...program, ...patch } : program) } }))
    setNotice('')
  }

  function createProgram() {
    const id = `program-${Date.now()}`
    const next: Program = { id, code: 'NUEVO', name: 'Nuevo programa académico', level: 'Licenciatura', modality: 'Escolarizada', status: 'Borrador', durationSemesters: 8, totalCredits: 200, campusIds: [draft.academicOffer.campuses[0]?.id ?? 'central'], capacity: 40, rvoe: 'En trámite', planVersion: 'Plan 2027', description: 'Describe el propósito y perfil general del programa.', curriculum: [{ semester: 1, subjects: [] }] }
    setDraft((current) => ({ ...current, academicOffer: { ...current.academicOffer, programs: [next, ...current.academicOffer.programs] } }))
    setSelectedId(id); setProgramTab('general'); setSemester(1); setNotice('')
  }

  function duplicateProgram(program: Program) {
    const id = `${program.code.toLowerCase()}-${Date.now()}`
    const copy: Program = { ...program, id, code: `${program.code}-C`, name: `${program.name} (copia)`, status: 'Borrador', campusIds: [...program.campusIds], curriculum: program.curriculum.map((term) => ({ ...term, subjects: term.subjects.map((subject) => ({ ...subject, id: `${subject.id}-${Date.now()}` })) })) }
    setDraft((current) => ({ ...current, academicOffer: { ...current.academicOffer, programs: [copy, ...current.academicOffer.programs] } }))
    setSelectedId(id); setNotice('')
  }

  function deleteProgram() {
    if (!selectedId || programs.length === 1) return
    setDraft((current) => ({ ...current, academicOffer: { ...current.academicOffer, programs: current.academicOffer.programs.filter((program) => program.id !== selectedId) } }))
    setSelectedId(null); setNotice('')
  }

  function toggleCampus(campusId: string) {
    if (!selected) return
    const campusIds = selected.campusIds.includes(campusId) ? selected.campusIds.filter((id) => id !== campusId) : [...selected.campusIds, campusId]
    updateProgram({ campusIds })
  }

  function updateSubject(subjectId: string, patch: Partial<Subject>) {
    if (!selected) return
    const curriculum = selected.curriculum.map((term) => term.semester === semester ? { ...term, subjects: term.subjects.map((subject) => subject.id === subjectId ? { ...subject, ...patch } : subject) } : term)
    updateProgram({ curriculum })
  }

  function addSubject() {
    if (!selected) return
    const subject: Subject = { id: `subject-${Date.now()}`, code: `${selected.code}-${semester}00`, name: 'Nueva asignatura', credits: 6, hours: 4, mandatory: true }
    const exists = selected.curriculum.some((term) => term.semester === semester)
    const curriculum = exists ? selected.curriculum.map((term) => term.semester === semester ? { ...term, subjects: [...term.subjects, subject] } : term) : [...selected.curriculum, { semester, subjects: [subject] }]
    updateProgram({ curriculum })
  }

  function removeSubject(subjectId: string) {
    if (!selected) return
    updateProgram({ curriculum: selected.curriculum.map((term) => term.semester === semester ? { ...term, subjects: term.subjects.filter((subject) => subject.id !== subjectId) } : term) })
  }

  function save() { if (onSave(draft) === false) { setNotice('No se guardó la oferta. Revisa las relaciones y los mensajes de Control escolar.'); return false } setNotice('Oferta académica guardada en este navegador.'); return true }
  const subjectCount = programs.reduce((sum, program) => sum + program.curriculum.reduce((termSum, term) => termSum + term.subjects.length, 0), 0)

  return <section className="academic-offer">
    <div className="module-heading"><div><p className="date-label">CATÁLOGO INSTITUCIONAL</p><h1>Oferta académica</h1><p>Administra programas, sedes, modalidades, cupos y planes de estudio.</p></div><button className="primary-button compact" type="button" onClick={createProgram}><Plus size={17} /> Nuevo programa</button></div>

    <div className="academic-summary">
      <article><span><GraduationCap size={20} /></span><div><small>Programas</small><strong>{programs.length}</strong></div></article>
      <article><span><CheckCircle2 size={20} /></span><div><small>Activos</small><strong>{programs.filter((program) => program.status === 'Activo').length}</strong></div></article>
      <article><span><Building2 size={20} /></span><div><small>Campus</small><strong>{draft.academicOffer.campuses.length}</strong></div></article>
      <article><span><BookOpen size={20} /></span><div><small>Asignaturas configuradas</small><strong>{subjectCount}</strong></div></article>
    </div>

    <article className="academic-catalog">
      <div className="academic-toolbar"><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar programa, clave o modalidad" /></label><select value={level} onChange={(event) => setLevel(event.target.value)}><option>Todos</option>{levels.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Activo</option><option>Borrador</option><option>Inactivo</option></select></div>
      <div className="program-grid">{filtered.map((program) => <article key={program.id} className="program-card" onClick={() => { setSelectedId(program.id); setProgramTab('general'); setSemester(1) }}>
        <div className="program-card-top"><span>{program.code}</span><i className={statusTone(program.status)}>{program.status}</i></div><h2>{program.name}</h2><p>{program.description}</p><div className="program-tags"><span>{program.level}</span><span>{program.modality}</span></div><dl><div><dt>Duración</dt><dd>{program.durationSemesters} semestres</dd></div><div><dt>Créditos</dt><dd>{program.totalCredits}</dd></div><div><dt>Cupo</dt><dd>{program.capacity}</dd></div></dl><footer><span><MapPin size={15} /> {program.campusIds.length} {program.campusIds.length === 1 ? 'campus' : 'campus'}</span><button type="button">Configurar</button></footer>
      </article>)}</div>
      {!filtered.length && <div className="academic-empty"><Search size={30} /><h2>Sin coincidencias</h2><p>Prueba con otros filtros o crea un nuevo programa.</p></div>}
    </article>

    <footer className="academic-savebar"><span role="status">{notice || 'Los programas activos se muestran automáticamente en admisiones.'}</span><button type="button" onClick={save}><Save size={17} /> Guardar oferta</button></footer>

    {selected && <div className="academic-editor-layer" role="dialog" aria-modal="true"><button className="academic-backdrop" aria-label="Cerrar editor" onClick={() => setSelectedId(null)} /><aside className="academic-editor">
      <header><div><span>{selected.code} · {selected.planVersion}</span><h2>{selected.name}</h2></div><div><button type="button" title="Duplicar" onClick={() => duplicateProgram(selected)}><Copy size={18} /></button><button type="button" aria-label="Cerrar" onClick={() => setSelectedId(null)}><X size={20} /></button></div></header>
      <nav><button type="button" className={programTab === 'general' ? 'active' : ''} onClick={() => setProgramTab('general')}>Información general</button><button type="button" className={programTab === 'plan' ? 'active' : ''} onClick={() => setProgramTab('plan')}>Mapa curricular</button></nav>
      {programTab === 'general' ? <div className="academic-editor-body"><section><h3>Identidad del programa</h3><div className="academic-fields"><label className="wide">Nombre oficial<input value={selected.name} onChange={(event) => updateProgram({ name: event.target.value })} /></label><label>Clave<input value={selected.code} onChange={(event) => updateProgram({ code: event.target.value.toUpperCase() })} /></label><label>Versión del plan<input value={selected.planVersion} onChange={(event) => updateProgram({ planVersion: event.target.value })} /></label><label>Nivel<select value={selected.level} onChange={(event) => updateProgram({ level: event.target.value })}><option>TSU</option><option>Licenciatura</option><option>Especialidad</option><option>Maestría</option><option>Doctorado</option></select></label><label>Modalidad<select value={selected.modality} onChange={(event) => updateProgram({ modality: event.target.value })}><option>Escolarizada</option><option>Mixta</option><option>En línea</option><option>Híbrida</option></select></label><label>Estatus<select value={selected.status} onChange={(event) => updateProgram({ status: event.target.value })}><option>Activo</option><option>Borrador</option><option>Inactivo</option></select></label><label>RVOE o autorización<input value={selected.rvoe} onChange={(event) => updateProgram({ rvoe: event.target.value })} /></label><label className="wide">Descripción<textarea rows={4} value={selected.description} onChange={(event) => updateProgram({ description: event.target.value })} /></label></div></section><section><h3>Operación académica</h3><div className="academic-fields metrics"><label>Semestres<input type="number" min="1" max="16" value={selected.durationSemesters} onChange={(event) => updateProgram({ durationSemesters: Number(event.target.value) })} /></label><label>Créditos totales<input type="number" min="0" value={selected.totalCredits} onChange={(event) => updateProgram({ totalCredits: Number(event.target.value) })} /></label><label>Cupo por ingreso<input type="number" min="0" value={selected.capacity} onChange={(event) => updateProgram({ capacity: Number(event.target.value) })} /></label></div><h4>Campus donde se imparte</h4><div className="campus-options">{draft.academicOffer.campuses.map((campus) => <label key={campus.id}><input type="checkbox" checked={selected.campusIds.includes(campus.id)} onChange={() => toggleCampus(campus.id)} /><span><Building2 size={16} /> {campus.name}</span></label>)}</div></section></div> : <div className="curriculum-editor"><div className="semester-selector">{Array.from({ length: selected.durationSemesters }, (_, index) => index + 1).map((term) => <button type="button" className={semester === term ? 'active' : ''} key={term} onClick={() => setSemester(term)}><span>{term}</span><small>{selected.curriculum.find((item) => item.semester === term)?.subjects.length ?? 0} materias</small></button>)}</div><div className="curriculum-heading"><div><span>SEMESTRE {semester}</span><h3>Asignaturas del periodo</h3></div><button type="button" onClick={addSubject}><Plus size={16} /> Agregar asignatura</button></div><div className="subject-editor-list">{(selected.curriculum.find((term) => term.semester === semester)?.subjects ?? []).map((subject) => <article key={subject.id}><label>Clave<input value={subject.code} onChange={(event) => updateSubject(subject.id, { code: event.target.value.toUpperCase() })} /></label><label className="subject-name">Asignatura<input value={subject.name} onChange={(event) => updateSubject(subject.id, { name: event.target.value })} /></label><label>Créditos<input type="number" min="0" value={subject.credits} onChange={(event) => updateSubject(subject.id, { credits: Number(event.target.value) })} /></label><label>Horas<input type="number" min="0" value={subject.hours} onChange={(event) => updateSubject(subject.id, { hours: Number(event.target.value) })} /></label><label className="mandatory"><input type="checkbox" checked={subject.mandatory} onChange={(event) => updateSubject(subject.id, { mandatory: event.target.checked })} /> Obligatoria</label><button type="button" aria-label={`Eliminar ${subject.name}`} onClick={() => removeSubject(subject.id)}><Trash2 size={16} /></button></article>)}{!(selected.curriculum.find((term) => term.semester === semester)?.subjects.length) && <div className="semester-empty"><Layers3 size={27} /><strong>Semestre sin asignaturas</strong><p>Agrega materias para construir este bloque del plan.</p></div>}</div></div>}
      <footer><button className="delete-program" type="button" disabled={programs.length === 1} onClick={deleteProgram}><Trash2 size={16} /> Eliminar programa</button><button className="primary-button compact" type="button" onClick={() => { if (save()) setSelectedId(null) }}><Save size={16} /> Guardar cambios</button></footer>
    </aside></div>}
  </section>
}
