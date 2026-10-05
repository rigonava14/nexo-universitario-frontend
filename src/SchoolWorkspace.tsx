import { FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InstitutionSettings } from './institution'
import SchoolConfiguration from './SchoolControl'
import AcademicOffer from './AcademicOffer'
import { SchoolGroup, Subject, enrollStudent, studentProgram } from './school'
import { useSchool } from './school-ui'
import SchoolStudentFile, { SchoolSave } from './SchoolStudentFile'
import { OperationEditor, OperationFeedback, PersonOptions, personName } from './operation-ui'
import './school-workspace.css'

export default function SchoolWorkspace({ settings, onSave, initialView = 'Expedientes' }: { settings: InstitutionSettings; onSave: (settings: InstitutionSettings) => void; initialView?: string }) {
  const [params, setParams] = useSearchParams()
  const [view, setView] = useState(initialView)
  const store = useSchool(settings)
  const { data, students } = store
  const [subject, setSubject] = useState<Subject | null>(null)
  const [group, setGroup] = useState<SchoolGroup | null>(null)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [studentId, setStudentId] = useState('')
  const [planId, setPlanId] = useState('')
  const [planSemester, setPlanSemester] = useState(1)
  const [planSubject, setPlanSubject] = useState('')
  const [query, setQuery] = useState('')
  const programs = settings.academicOffer.programs
  function saveOffer(next: InstitutionSettings) {
    const canonical = new Map(data.subjects.map((item) => [item.code.trim().toLowerCase(), item.id]))
    next = { ...next, academicOffer: { ...next.academicOffer, programs: next.academicOffer.programs.map((program) => ({ ...program, curriculum: program.curriculum.map((term) => ({ ...term, subjects: term.subjects.map((item) => { const code = item.code.trim().toLowerCase(); const id = canonical.get(code) ?? item.id; canonical.set(code, id); return { ...item, id } }) })) })) } }
    for (const current of data.groups) if (!next.academicOffer.programs.some((item) => item.id === current.programId)) { store.setError('No se puede eliminar una carrera que tiene grupos vinculados.'); return false }
    for (const career of data.careers) if (!next.academicOffer.programs.some((item) => item.id === career.programId)) { store.setError('No se puede eliminar una carrera vinculada con expedientes de alumnos.'); return false }
    for (const request of data.requests) {
      const group = data.groups.find((item) => item.id === request.groupId)!
      const plan = next.academicOffer.programs.find((item) => item.id === group.programId)
      if (!plan?.curriculum.some((term) => term.subjects.some((item) => item.id === request.subjectId))) { store.setError('Hay clases asignadas a una materia del plan que intentas retirar. Revisa primero la oferta de coordinación.'); return false }
    }
    const catalogue = new Map(data.subjects.map((item) => [item.id, item]))
    for (const program of next.academicOffer.programs) for (const term of program.curriculum) for (const item of term.subjects) catalogue.set(item.id, item)
    const subjects = [...catalogue.values()]
    next = { ...next, academicOffer: { ...next.academicOffer, programs: next.academicOffer.programs.map((program) => ({ ...program, curriculum: program.curriculum.map((term) => ({ ...term, subjects: term.subjects.map((item) => catalogue.get(item.id)!) })) })) } }
    if (!store.commit({ ...data, subjects })) return false
    try { onSave(next); return true } catch { store.commit(data); store.setError('No se pudo guardar la oferta; se restauró el catálogo anterior.'); return false }
  }
  function saveSubject(event: FormEvent) {
    event.preventDefault(); if (!subject) return
    const item = { ...subject, code: subject.code.trim().toUpperCase(), name: subject.name.trim() }
    if (data.subjects.some((entry) => entry.id !== item.id && entry.code.toLowerCase() === item.code.toLowerCase())) { store.setError('Ya existe una materia con esa clave.'); return }
    const subjects = data.subjects.some((entry) => entry.id === item.id) ? data.subjects.map((entry) => entry.id === item.id ? item : entry) : [...data.subjects, item]
    const nextSettings = { ...settings, academicOffer: { ...settings.academicOffer, programs: programs.map((program) => ({ ...program, curriculum: program.curriculum.map((term) => ({ ...term, subjects: term.subjects.map((entry) => entry.id === item.id ? item : entry) })) })) } }
    if (!store.commit({ ...data, subjects })) return
    try { onSave(nextSettings); setSubject(null) } catch { store.commit(data); store.setError('No se pudo guardar la materia en los planes. Se restauró el catálogo.'); }
  }
  function addToPlan(event: FormEvent) {
    event.preventDefault()
    const program = programs.find((item) => item.id === planId)
    const item = data.subjects.find((entry) => entry.id === planSubject)
    if (!program || !item) return
    if (program.curriculum.some((term) => term.subjects.some((entry) => entry.id === item.id || entry.code === item.code))) { store.setError('La materia ya pertenece al plan de esa carrera.'); return }
    const existing = program.curriculum.some((term) => term.semester === planSemester)
    const curriculum = existing ? program.curriculum.map((term) => term.semester === planSemester ? { ...term, subjects: [...term.subjects, item] } : term) : [...program.curriculum, { semester: planSemester, subjects: [item] }]
    if (saveOffer({ ...settings, academicOffer: { ...settings.academicOffer, programs: programs.map((entry) => entry.id === program.id ? { ...entry, curriculum } : entry) } })) setPlanSubject('')
  }
  function saveGroup(event: FormEvent) {
    event.preventDefault(); if (!group) return
    if (!programs.some((item) => item.id === group.programId && group.semester <= item.durationSemesters)) { store.setError('La carrera no existe o el semestre excede la duración del plan.'); return }
    if (data.groups.some((item) => item.id === group.id && (item.programId !== group.programId || item.period !== group.period || item.semester !== group.semester)) && (group.studentIds.length || data.requests.some((item) => item.groupId === group.id))) { store.setError('Un grupo con alumnos o clases no puede cambiar de carrera, semestre o periodo. Crea un grupo nuevo.'); return }
    const item = { ...group, code: group.code.trim().toUpperCase(), period: group.period.trim() }
    const groups = data.groups.some((entry) => entry.id === item.id) ? data.groups.map((entry) => entry.id === item.id ? item : entry) : [...data.groups, item]
    if (store.commit({ ...data, groups })) { setGroup(null); setSelectedGroup(item.id) }
  }
  const visibleSubjects = data.subjects.filter((item) => `${item.code} ${item.name}`.toLowerCase().includes(query.toLowerCase()))
  const selected = data.groups.find((item) => item.id === selectedGroup)
  return <section className="school-workspace"><div className="module-heading"><div><p className="date-label">OPERACIÓN ACADÉMICA</p><h1>Control escolar</h1><p>Expedientes, carreras, planes, materias, grupos y movimientos relacionados.</p></div></div><nav className="school-tabs" aria-label="Secciones de Control escolar">{['Expedientes', 'Carreras y planes', 'Materias', 'Grupos', 'Bajas y movimientos', 'Configuración académica'].map((item) => <button key={item} className={view === item ? 'active' : ''} onClick={() => { setView(item); store.setError('') }}>{item}</button>)}</nav><p className="directory-local">Demostración local · Las inscripciones respetan cupos, carrera, estado del alumno y bloqueos activos.</p>
    {view !== 'Expedientes' && view !== 'Bajas y movimientos' && <OperationFeedback error={store.error} notice={store.notice} />}
    {(view === 'Expedientes' || view === 'Bajas y movimientos') && <SchoolStudentFile key={view} initialTab={view === 'Bajas y movimientos' ? 'Movimientos' : 'Resumen'} store={store} settings={settings} selectedId={params.get('alumno') ?? ''} select={(id) => setParams(id ? { alumno: id } : {})} />}
    {view === 'Carreras y planes' && <AcademicOffer settings={settings} onSave={saveOffer} />}
    {view === 'Configuración académica' && <SchoolConfiguration settings={settings} onSave={onSave} />}
    {view === 'Materias' && <><div className="operation-toolbar"><label>Buscar materia<input aria-label="Buscar materia" value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="primary-button compact" disabled={store.blocked} onClick={() => { store.setError(''); setSubject({ id: crypto.randomUUID(), code: '', name: '', credits: 6, hours: 4, mandatory: true }) }}>Crear materia</button></div><div className="directory-table-wrap"><table><thead><tr><th>Clave</th><th>Materia</th><th>Créditos</th><th>Horas semanales</th><th>Planes vinculados</th><th>Acción</th></tr></thead><tbody>{visibleSubjects.map((item) => <tr key={item.id}><td>{item.code}</td><td>{item.name}</td><td>{item.credits}</td><td>{item.hours}</td><td>{programs.filter((program) => program.curriculum.some((term) => term.subjects.some((subject) => subject.id === item.id))).map((program) => program.code).join(', ') || 'Sin vincular'}</td><td><button className="secondary-button" onClick={() => { setSubject({ ...item }); store.setError('') }}>Editar materia<span className="directory-sr"> {item.code}</span></button></td></tr>)}</tbody></table></div><article className="operation-panel"><h2>Agregar materia a un plan</h2><form className="directory-form" onSubmit={addToPlan}><label>Carrera y plan<select aria-label="Carrera del plan" required value={planId} onChange={(event) => setPlanId(event.target.value)}><option value="">Seleccionar</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.planVersion}</option>)}</select></label><label>Semestre<input required type="number" min={1} max={programs.find((item) => item.id === planId)?.durationSemesters ?? 20} value={planSemester} onChange={(event) => setPlanSemester(Number(event.target.value))} /></label><label>Materia<select aria-label="Materia para el plan" required value={planSubject} onChange={(event) => setPlanSubject(event.target.value)}><option value="">Seleccionar</option>{data.subjects.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></label><SchoolSave error={store.error} blocked={store.blocked} /></form></article></>}
    {view === 'Grupos' && <><button className="primary-button compact" disabled={store.blocked} onClick={() => { store.setError(''); setGroup({ id: crypto.randomUUID(), code: '', programId: '', semester: 1, period: settings.grading.currentPeriod, capacity: 30, studentIds: [] }) }}>Crear grupo</button><div className="directory-table-wrap"><table><thead><tr><th>Grupo</th><th>Carrera</th><th>Semestre</th><th>Periodo</th><th>Inscritos / cupo</th><th>Acciones</th></tr></thead><tbody>{data.groups.map((item) => <tr key={item.id}><td>{item.code}</td><td>{programs.find((program) => program.id === item.programId)?.name}</td><td>{item.semester}</td><td>{item.period}</td><td>{item.studentIds.length}/{item.capacity}</td><td><button className="secondary-button" onClick={() => setSelectedGroup(item.id)}>Ver alumnos<span className="directory-sr"> de {item.code}</span></button><button className="secondary-button" onClick={() => { store.setError(''); setGroup({ ...item }) }}>Editar grupo<span className="directory-sr"> {item.code}</span></button></td></tr>)}</tbody></table></div>{selected && <article className="operation-panel"><h2>Alumnos de {selected.code}</h2><form className="directory-form" onSubmit={(event) => { event.preventDefault(); const student = students.find((item) => item.id === studentId); if (!student) return; try { if (student.status !== 'Activo') throw new Error('El alumno debe estar activo para inscribirse.'); if (store.commit(enrollStudent(data, selected.id, student.id, studentProgram(data, student.id, student.area, settings)))) setStudentId('') } catch (failure) { store.setError((failure as Error).message) } }}><label>Alumno<select required aria-label="Alumno para inscribir" value={studentId} onChange={(event) => setStudentId(event.target.value)}><PersonOptions records={students} /></select></label><SchoolSave error={store.error} blocked={store.blocked} /></form><div className="directory-table-wrap"><table><thead><tr><th>Alumno</th><th>Expediente</th></tr></thead><tbody>{selected.studentIds.map((id) => <tr key={id}><td>{personName(students, id)}</td><td><button className="secondary-button" onClick={() => { setParams({ alumno: id }); setView('Expedientes') }}>Ver expediente</button></td></tr>)}</tbody></table></div><h3>Materias y docentes del grupo</h3><div className="directory-table-wrap"><table><thead><tr><th>Materia</th><th>Docente</th><th>Horas</th><th>Aula</th></tr></thead><tbody>{data.requests.filter((item) => item.groupId === selected.id).map((item) => <tr key={item.id}><td>{data.subjects.find((subject) => subject.id === item.subjectId)?.name}</td><td>{personName(store.teachers, item.teacherId)}</td><td>{item.hours}</td><td>{item.room}</td></tr>)}</tbody></table></div><p>Las clases y horarios se preparan en Coordinación académica.</p></article>}</>}
    {subject && <OperationEditor title="Materia del catálogo" close={() => setSubject(null)}><form className="directory-form" onSubmit={saveSubject}><label>Clave<input required value={subject.code} onChange={(event) => setSubject({ ...subject, code: event.target.value })} /></label><label>Nombre<input required value={subject.name} onChange={(event) => setSubject({ ...subject, name: event.target.value })} /></label><label>Créditos<input required type="number" min={0} max={100} value={subject.credits} onChange={(event) => setSubject({ ...subject, credits: Number(event.target.value) })} /></label><label>Horas semanales<input required type="number" min={1} max={12} value={subject.hours} onChange={(event) => setSubject({ ...subject, hours: Number(event.target.value) })} /></label><SchoolSave error={store.error} blocked={store.blocked} /></form></OperationEditor>}
    {group && <OperationEditor title="Grupo académico" close={() => setGroup(null)}><form className="directory-form" onSubmit={saveGroup}><label>Código del grupo<input required value={group.code} onChange={(event) => setGroup({ ...group, code: event.target.value })} /></label><label>Carrera<select required aria-label="Carrera del grupo" value={group.programId} onChange={(event) => setGroup({ ...group, programId: event.target.value })}><option value="">Seleccionar</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Semestre<input required type="number" min={1} max={20} value={group.semester} onChange={(event) => setGroup({ ...group, semester: Number(event.target.value) })} /></label><label>Periodo<input required value={group.period} onChange={(event) => setGroup({ ...group, period: event.target.value })} /></label><label>Cupo<input required type="number" min={group.studentIds.length || 1} max={200} value={group.capacity} onChange={(event) => setGroup({ ...group, capacity: Number(event.target.value) })} /></label><SchoolSave error={store.error} blocked={store.blocked} /></form></OperationEditor>}
  </section>
}
