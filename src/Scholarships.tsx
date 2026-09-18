import { useMemo, useState } from 'react'
import { Award, BadgePercent, BellRing, CheckCircle2, Filter, GraduationCap, Mail, Plus, Save, Search, Send, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react'
import { InstitutionSettings } from './institution'

type Props = { settings: InstitutionSettings; onSave: (settings: InstitutionSettings) => void }
type Tab = 'candidates' | 'programs' | 'assigned' | 'communications'
type Candidate = InstitutionSettings['finance']['scholarshipCandidates'][number]
type ScholarshipProgram = InstitutionSettings['finance']['scholarshipPrograms'][number]

export default function Scholarships({ settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings)
  const [tab, setTab] = useState<Tab>('candidates')
  const [query, setQuery] = useState('')
  const [candidateStatus, setCandidateStatus] = useState('Todos')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [creatingProgram, setCreatingProgram] = useState<ScholarshipProgram | null>(null)
  const [notice, setNotice] = useState('')
  const [composing, setComposing] = useState(false)
  const [message, setMessage] = useState({ title: 'Convocatoria de becas disponible', audience: 'Alumnos elegibles', channel: 'Portal y correo', body: 'Conoce los apoyos disponibles y completa tu solicitud antes de la fecha límite.' })

  const finance = draft.finance
  const evaluatedCandidates = useMemo(() => finance.scholarshipCandidates.map((candidate) => {
    if (candidate.status === 'Asignada') return candidate
    const recommendation = [...finance.scholarshipPrograms]
      .filter((program) => program.status !== 'Inactiva' && candidate.average >= program.minimumAverage && candidate.attendance >= program.minimumAttendance)
      .sort((a, b) => b.discount - a.discount)[0]
    return { ...candidate, recommendedProgramId: recommendation?.id ?? '', status: recommendation ? 'Elegible' : 'Por mejorar' }
  }), [finance.scholarshipCandidates, finance.scholarshipPrograms])
  const eligible = evaluatedCandidates.filter((item) => item.status === 'Elegible')
  const filteredCandidates = useMemo(() => evaluatedCandidates.filter((candidate) => {
    const matches = `${candidate.studentName} ${candidate.studentId} ${candidate.program}`.toLowerCase().includes(query.toLowerCase())
    return matches && (candidateStatus === 'Todos' || candidate.status === candidateStatus)
  }), [evaluatedCandidates, query, candidateStatus])

  function updateFinance(patch: Partial<InstitutionSettings['finance']>) {
    setDraft((current) => ({ ...current, finance: { ...current.finance, ...patch } }))
    setNotice('')
  }

  function updateProgram(id: string, patch: Partial<ScholarshipProgram>) {
    updateFinance({ scholarshipPrograms: finance.scholarshipPrograms.map((item) => item.id === id ? { ...item, ...patch } : item) })
  }

  function newProgram() {
    setCreatingProgram({ id: `program-${Date.now()}`, name: 'Nueva beca', description: 'Describe el objetivo, alcance y población a la que está dirigida.', discount: 20, minimumAverage: 80, minimumAttendance: 85, slots: 20, validUntil: '2027-06-30', status: 'Borrador' })
  }

  function createProgram() {
    if (!creatingProgram || !creatingProgram.name.trim()) return
    updateFinance({ scholarshipPrograms: [creatingProgram, ...finance.scholarshipPrograms] })
    setCreatingProgram(null)
    setNotice('Programa de beca creado. Ya puede detectar candidatos y asignarse.')
  }

  function openAssignment(candidate: Candidate) {
    setSelectedCandidate(candidate)
    setSelectedProgramId(candidate.recommendedProgramId || finance.scholarshipPrograms[0]?.id || '')
  }

  function assignScholarship() {
    if (!selectedCandidate) return
    const program = finance.scholarshipPrograms.find((item) => item.id === selectedProgramId)
    if (!program) return
    const assignment = { id: `scholar-${Date.now()}`, studentName: selectedCandidate.studentName, studentId: selectedCandidate.studentId, name: program.name, discount: program.discount, validUntil: program.validUntil, status: 'Activa' }
    updateFinance({
      scholarships: [assignment, ...finance.scholarships.filter((item) => item.studentId !== selectedCandidate.studentId)],
      scholarshipCandidates: finance.scholarshipCandidates.map((item) => item.id === selectedCandidate.id ? { ...item, status: 'Asignada', recommendedProgramId: program.id } : item),
    })
    setSelectedCandidate(null)
    setNotice(`${program.name} asignada a ${selectedCandidate.studentName}; ya aparece en Finanzas.`)
  }

  function sendNews() {
    const item = { id: `news-${Date.now()}`, title: message.title, audience: message.audience, channel: message.channel, message: message.body, date: new Date().toISOString().slice(0, 10), status: 'Enviada' }
    updateFinance({ scholarshipNews: [item, ...finance.scholarshipNews] })
    setComposing(false)
    setNotice(`Noticia enviada a: ${message.audience}.`)
  }

  function save() { onSave(draft); setNotice('Becas y asignaciones guardadas en este navegador.') }

  return <section className="scholarships-module">
    <div className="module-heading"><div><p className="date-label">BIENESTAR ESTUDIANTIL</p><h1>Becas y apoyos</h1><p>Detecta candidatos, configura reglas, asigna beneficios y comunica convocatorias.</p></div><button className="primary-button compact" type="button" onClick={() => setComposing(true)}><Send size={16} /> Enviar noticia</button></div>

    <div className="scholarship-summary">
      <article><span><Award size={20} /></span><div><small>Becas activas</small><strong>{finance.scholarships.filter((item) => item.status === 'Activa').length}</strong><em>reflejadas en Finanzas</em></div></article>
      <article><span><Sparkles size={20} /></span><div><small>Candidatos detectados</small><strong>{eligible.length}</strong><em>cumplen alguna regla</em></div></article>
      <article><span><GraduationCap size={20} /></span><div><small>Promedio de candidatos</small><strong>{(finance.scholarshipCandidates.reduce((sum, item) => sum + item.average, 0) / finance.scholarshipCandidates.length).toFixed(1)}</strong><em>periodo actual</em></div></article>
      <article><span><Mail size={20} /></span><div><small>Comunicaciones</small><strong>{finance.scholarshipNews.length}</strong><em>enviadas o programadas</em></div></article>
    </div>

    <nav className="scholarship-tabs"><button type="button" className={tab === 'candidates' ? 'active' : ''} onClick={() => setTab('candidates')}>Candidatos</button><button type="button" className={tab === 'programs' ? 'active' : ''} onClick={() => setTab('programs')}>Programas y reglas</button><button type="button" className={tab === 'assigned' ? 'active' : ''} onClick={() => setTab('assigned')}>Becas asignadas</button><button type="button" className={tab === 'communications' ? 'active' : ''} onClick={() => setTab('communications')}>Comunicaciones</button></nav>

    {tab === 'candidates' && <article className="scholarship-panel"><header><div><h2>Radar de candidatos</h2><p>El sistema compara promedio y asistencia con las reglas configuradas.</p></div><span><Sparkles size={15} /> Detección automática</span></header><div className="scholarship-toolbar"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar alumno, matrícula o programa" /></label><select value={candidateStatus} onChange={(event) => setCandidateStatus(event.target.value)}><option>Todos</option><option>Elegible</option><option>Asignada</option><option>Por mejorar</option></select></div><div className="scholarship-table-wrap"><table><thead><tr><th>Alumno</th><th>Programa académico</th><th>Promedio</th><th>Asistencia</th><th>Necesidad</th><th>Recomendación</th><th>Estatus</th><th /></tr></thead><tbody>{filteredCandidates.map((candidate) => { const recommendation = finance.scholarshipPrograms.find((item) => item.id === candidate.recommendedProgramId); return <tr key={candidate.id}><td><strong>{candidate.studentName}</strong><small>{candidate.studentId}</small></td><td>{candidate.program}</td><td><b className={candidate.average >= 90 ? 'high-score' : ''}>{candidate.average.toFixed(1)}</b></td><td>{candidate.attendance}%</td><td>{candidate.financialNeed}</td><td>{recommendation?.name ?? 'Sin coincidencia'}</td><td><span className={`scholarship-status ${candidate.status.toLowerCase().replace(' ', '-')}`}>{candidate.status}</span></td><td><button type="button" disabled={candidate.status === 'Asignada'} onClick={() => openAssignment(candidate)}>{candidate.status === 'Asignada' ? 'Asignada' : 'Asignar'}</button></td></tr> })}</tbody></table></div></article>}

    {tab === 'programs' && <><div className="scholarship-section-heading"><div><h2>Programas de beca</h2><p>Crea apoyos y define las condiciones que activan la detección de candidatos.</p></div><button type="button" onClick={newProgram}><Plus size={16} /> Crear beca</button></div><div className="scholarship-programs">{finance.scholarshipPrograms.map((program) => { const matches = finance.scholarshipCandidates.filter((candidate) => candidate.average >= program.minimumAverage && candidate.attendance >= program.minimumAttendance).length; return <article key={program.id}><header><span><BadgePercent size={19} /></span><i>{program.status}</i></header><h2>{program.name}</h2><p>{program.description}</p><div className="rule-fields"><label>Descuento<input type="number" min="0" max="100" value={program.discount} onChange={(event) => updateProgram(program.id, { discount: Number(event.target.value) })} /><span>%</span></label><label>Promedio mínimo<input type="number" min="0" max="100" value={program.minimumAverage} onChange={(event) => updateProgram(program.id, { minimumAverage: Number(event.target.value) })} /></label><label>Asistencia mínima<input type="number" min="0" max="100" value={program.minimumAttendance} onChange={(event) => updateProgram(program.id, { minimumAttendance: Number(event.target.value) })} /><span>%</span></label><label>Lugares<input type="number" min="0" value={program.slots} onChange={(event) => updateProgram(program.id, { slots: Number(event.target.value) })} /></label></div><footer><span><Users size={15} /> {matches} alumnos cumplen las reglas</span><button type="button" onClick={() => { setTab('candidates'); setCandidateStatus('Elegible') }}>Ver candidatos</button></footer></article>})}</div></>}

    {tab === 'assigned' && <article className="scholarship-panel"><header><div><h2>Becas asignadas</h2><p>Beneficios vigentes sincronizados con la cuenta financiera del alumno.</p></div><span><CheckCircle2 size={15} /> Integración financiera</span></header><div className="scholarship-table-wrap"><table><thead><tr><th>Alumno</th><th>Beca o convenio</th><th>Descuento</th><th>Vigencia</th><th>Estatus</th><th>Aplicación</th></tr></thead><tbody>{finance.scholarships.map((item) => <tr key={item.id}><td><strong>{item.studentName}</strong><small>{item.studentId}</small></td><td>{item.name}</td><td><b>{item.discount}%</b></td><td>{item.validUntil}</td><td><span className={`scholarship-status ${item.status === 'Activa' ? 'activa' : 'por-renovar'}`}>{item.status}</span></td><td><span className="finance-link"><CheckCircle2 size={14} /> Finanzas</span></td></tr>)}</tbody></table></div></article>}

    {tab === 'communications' && <div className="communications-layout"><article className="scholarship-panel"><header><div><h2>Noticias y convocatorias</h2><p>Mensajes para candidatos, becarios y comunidad estudiantil.</p></div><button type="button" onClick={() => setComposing(true)}><Plus size={15} /> Nueva comunicación</button></header><div className="news-list">{finance.scholarshipNews.map((item) => <article key={item.id}><span><BellRing size={18} /></span><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.audience} · {item.channel} · {item.date}</small></div><i className={item.status === 'Enviada' ? 'sent' : ''}>{item.status}</i></article>)}</div></article><aside className="scholarship-insight"><Filter size={22} /><h2>Segmentación disponible</h2><p>Las comunicaciones pueden dirigirse usando la información académica y financiera del demo.</p><ul><li>Alumnos elegibles por promedio</li><li>Becarios con renovación pendiente</li><li>Programa académico o campus</li><li>Necesidad económica declarada</li></ul></aside></div>}

    <footer className="scholarship-savebar"><span role="status">{notice || 'Las asignaciones realizadas también aparecerán en Finanzas.'}</span><button type="button" onClick={save}><Save size={16} /> Guardar cambios</button></footer>

    {selectedCandidate && <div className="scholarship-modal-layer" role="dialog" aria-modal="true"><button className="scholarship-backdrop" aria-label="Cerrar asignación" onClick={() => setSelectedCandidate(null)} /><form className="scholarship-modal" onSubmit={(event) => { event.preventDefault(); assignScholarship() }}><header><div><span>ASIGNAR BENEFICIO</span><h2>{selectedCandidate.studentName}</h2><p>{selectedCandidate.studentId} · promedio {selectedCandidate.average.toFixed(1)}</p></div><button type="button" aria-label="Cerrar" onClick={() => setSelectedCandidate(null)}><X size={20} /></button></header><div className="candidate-proof"><div><small>Promedio</small><strong>{selectedCandidate.average.toFixed(1)}</strong></div><div><small>Asistencia</small><strong>{selectedCandidate.attendance}%</strong></div><div><small>Necesidad</small><strong>{selectedCandidate.financialNeed}</strong></div></div><label>Programa de beca<select value={selectedProgramId} onChange={(event) => setSelectedProgramId(event.target.value)}>{finance.scholarshipPrograms.map((program) => <option value={program.id} key={program.id}>{program.name} · {program.discount}%</option>)}</select></label>{(() => { const program = finance.scholarshipPrograms.find((item) => item.id === selectedProgramId); return program && <div className="assignment-impact"><SlidersHorizontal size={17} /><p><strong>{program.discount}% de descuento</strong><span>Se aplicará en Finanzas hasta {program.validUntil}.</span></p></div> })()}<footer><button type="button" onClick={() => setSelectedCandidate(null)}>Cancelar</button><button type="submit">Confirmar asignación</button></footer></form></div>}

    {creatingProgram && <div className="scholarship-modal-layer" role="dialog" aria-modal="true"><button className="scholarship-backdrop" aria-label="Cerrar creación" onClick={() => setCreatingProgram(null)} /><form className="scholarship-modal scholarship-program-form" onSubmit={(event) => { event.preventDefault(); createProgram() }}><header><div><span>NUEVO PROGRAMA</span><h2>Crear beca</h2><p>Configura el beneficio y las reglas de elegibilidad.</p></div><button type="button" aria-label="Cerrar" onClick={() => setCreatingProgram(null)}><X size={20} /></button></header><label>Nombre de la beca<input required value={creatingProgram.name} onChange={(event) => setCreatingProgram({ ...creatingProgram, name: event.target.value })} /></label><label>Descripción<textarea rows={3} value={creatingProgram.description} onChange={(event) => setCreatingProgram({ ...creatingProgram, description: event.target.value })} /></label><div className="message-fields"><label>Descuento (%)<input type="number" min="0" max="100" value={creatingProgram.discount} onChange={(event) => setCreatingProgram({ ...creatingProgram, discount: Number(event.target.value) })} /></label><label>Lugares disponibles<input type="number" min="1" value={creatingProgram.slots} onChange={(event) => setCreatingProgram({ ...creatingProgram, slots: Number(event.target.value) })} /></label><label>Promedio mínimo<input type="number" min="0" max="100" step="0.1" value={creatingProgram.minimumAverage} onChange={(event) => setCreatingProgram({ ...creatingProgram, minimumAverage: Number(event.target.value) })} /></label><label>Asistencia mínima (%)<input type="number" min="0" max="100" value={creatingProgram.minimumAttendance} onChange={(event) => setCreatingProgram({ ...creatingProgram, minimumAttendance: Number(event.target.value) })} /></label><label>Vigencia<input type="date" value={creatingProgram.validUntil} onChange={(event) => setCreatingProgram({ ...creatingProgram, validUntil: event.target.value })} /></label><label>Estatus<select value={creatingProgram.status} onChange={(event) => setCreatingProgram({ ...creatingProgram, status: event.target.value })}><option>Borrador</option><option>Convocatoria</option><option>Activa</option><option>Inactiva</option></select></label></div><div className="assignment-impact"><Sparkles size={17} /><p><strong>Detección automática</strong><span>Al crearla, el radar evaluará inmediatamente quién cumple estas reglas.</span></p></div><footer><button type="button" onClick={() => setCreatingProgram(null)}>Cancelar</button><button type="submit"><Plus size={15} /> Crear programa</button></footer></form></div>}

    {composing && <div className="scholarship-modal-layer" role="dialog" aria-modal="true"><button className="scholarship-backdrop" aria-label="Cerrar comunicación" onClick={() => setComposing(false)} /><form className="scholarship-modal" onSubmit={(event) => { event.preventDefault(); sendNews() }}><header><div><span>COMUNICACIÓN</span><h2>Nueva noticia</h2><p>El envío queda registrado en el historial del demo.</p></div><button type="button" aria-label="Cerrar" onClick={() => setComposing(false)}><X size={20} /></button></header><label>Título<input value={message.title} onChange={(event) => setMessage({ ...message, title: event.target.value })} /></label><div className="message-fields"><label>Audiencia<select value={message.audience} onChange={(event) => setMessage({ ...message, audience: event.target.value })}><option>Alumnos elegibles</option><option>Becarios activos</option><option>Renovación pendiente</option><option>Todos los alumnos</option></select></label><label>Canal<select value={message.channel} onChange={(event) => setMessage({ ...message, channel: event.target.value })}><option>Portal y correo</option><option>Correo</option><option>Portal</option><option>Notificación móvil</option></select></label></div><label>Mensaje<textarea rows={5} value={message.body} onChange={(event) => setMessage({ ...message, body: event.target.value })} /></label><footer><button type="button" onClick={() => setComposing(false)}>Cancelar</button><button type="submit"><Send size={15} /> Enviar noticia</button></footer></form></div>}
  </section>
}
