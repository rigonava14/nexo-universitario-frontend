import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getRole, signOut } from './auth'
import { loadInstitutionSettings } from './institution'
import FadeContent from './components/FadeContent'
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  History,
  Home,
  ListChecks,
  LogOut,
  Menu,
  Pencil,
  Save,
  School,
  Search,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react'

type TeacherNotice = (message: string) => void
type Group = { id: string; subject: string; code: string; students: number; room: string; schedule: string; career: string; semester: string; progress: number; pending: string; color: string }

const groups: Group[] = [
  { id: 'ISC-6A', subject: 'Programación Web', code: 'SCC-1014', students: 31, room: 'B-12', schedule: 'Mar y jue · 11:00–13:00', career: 'Ing. en Sistemas Computacionales', semester: '6°', progress: 68, pending: 'Segundo parcial', color: 'blue' },
  { id: 'ISC-4B', subject: 'Fundamentos de Bases de Datos', code: 'AEF-1031', students: 28, room: 'LC-2', schedule: 'Lun y mié · 08:00–10:00', career: 'Ing. en Sistemas Computacionales', semester: '4°', progress: 100, pending: 'Sin pendientes', color: 'green' },
  { id: 'IGE-5A', subject: 'Tecnologías de la Información', code: 'GEF-0921', students: 34, room: 'C-08', schedule: 'Lun y vie · 12:00–14:00', career: 'Ing. en Gestión Empresarial', semester: '5°', progress: 42, pending: 'Segundo parcial', color: 'violet' },
  { id: 'ISC-8A', subject: 'Taller de Investigación II', code: 'ACA-0910', students: 24, room: 'A-03', schedule: 'Mié · 16:00–19:00', career: 'Ing. en Sistemas Computacionales', semester: '8°', progress: 76, pending: 'Proyecto final', color: 'amber' },
]

const students = [
  { id: '20230184', name: 'Ana Martínez López', grade: 96 },
  { id: '20230201', name: 'Carlos Ramírez Soto', grade: 88 },
  { id: '20230215', name: 'Daniela Vega Ruiz', grade: 91 },
  { id: '20230244', name: 'Emiliano Chávez Ortiz', grade: 76 },
  { id: '20230258', name: 'Fernanda Luna Pérez', grade: 84 },
  { id: '20230273', name: 'Gabriel Ortega Mora', grade: 93 },
]

const teacherNav = [
  { label: 'Inicio', slug: 'inicio', icon: Home },
  { label: 'Mis clases y grupos', slug: 'grupos', icon: BookOpen },
  { label: 'Captura de calificaciones', slug: 'evaluaciones', icon: ClipboardCheck },
  { label: 'Listas de asistencia', slug: 'asistencia', icon: ListChecks },
  { label: 'Actas de calificaciones', slug: 'actas', icon: FileCheck2 },
  { label: 'Ciclos anteriores', slug: 'historial', icon: History },
  { label: 'Reportes y estadísticas', slug: 'reportes', icon: BarChart3 },
  { label: 'Mi perfil', slug: 'perfil', icon: UserRound },
]

function TeacherSidebar({ active, open, go, close, logout }: { active: string; open: boolean; go: (slug: string) => void; close: () => void; logout: () => void }) {
  return <aside className={`teacher-sidebar ${open ? 'open' : ''}`}><div className="teacher-brand"><span><GraduationCap size={22} /></span><div><strong>Nexo</strong><small>Portal docente</small></div><button onClick={close}><X size={19} /></button></div><div className="teacher-card"><div>EM</div><strong>Dra. Elena Márquez</strong><span>Departamento de Sistemas</span><small>DOC-0048</small></div><nav>{teacherNav.map((item) => { const Icon = item.icon; return <button className={active === item.slug ? 'active' : ''} key={item.slug} onClick={() => { go(item.slug); close() }}><Icon size={17} /><span>{item.label}</span>{item.slug === 'evaluaciones' && <i>3</i>}</button> })}</nav><button className="teacher-logout" onClick={logout}><LogOut size={17} /> Cerrar sesión</button></aside>
}

function TeacherHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="teacher-heading"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action}</div>
}

function TeacherHome({ go }: { go: (slug: string) => void }) {
  return <><TeacherHeading eyebrow="LUNES, 14 DE SEPTIEMBRE" title="Buenos días, Elena" description="Tienes tres evaluaciones pendientes por capturar." /><section className="teacher-metrics"><article><span className="blue"><BookOpen size={19} /></span><div><small>Grupos activos</small><strong>4</strong><p>Periodo 2026-2</p></div></article><article><span className="violet"><Users size={19} /></span><div><small>Estudiantes</small><strong>117</strong><p>En todos tus grupos</p></div></article><article><span className="amber"><AlertCircle size={19} /></span><div><small>Evaluaciones pendientes</small><strong>3</strong><button onClick={() => go('evaluaciones')}>Capturar ahora</button></div></article><article><span className="green"><TrendingUp size={19} /></span><div><small>Promedio general</small><strong>87.4</strong><p>+2.1 vs. ciclo anterior</p></div></article></section><section className="teacher-home-grid"><article className="teacher-panel teacher-next-class"><div className="teacher-panel-title"><div><h2>Siguiente clase</h2><p>Hoy · 12:00–14:00</p></div><Clock3 size={20} /></div><span>IGE-5A · GEF-0921</span><h3>Tecnologías de la Información</h3><p><Users size={14} /> 34 estudiantes</p><p><Home size={14} /> Aula C-08</p><button onClick={() => go('grupos')}>Abrir grupo <ChevronRight size={14} /></button></article><article className="teacher-panel pending-list"><div className="teacher-panel-title"><div><h2>Evaluaciones pendientes</h2><p>Fechas próximas de cierre</p></div><button onClick={() => go('evaluaciones')}>Ver todas</button></div>{groups.filter((group) => group.pending !== 'Sin pendientes').map((group, index) => <div key={group.id}><span className={group.color}><ClipboardCheck size={17} /></span><div><strong>{group.subject}</strong><small>{group.id} · {group.pending}</small></div><time>{index === 0 ? '2 días' : index === 1 ? '5 días' : '8 días'}</time></div>)}</article><article className="teacher-panel today-groups"><div className="teacher-panel-title"><div><h2>Clases de hoy</h2><p>Lunes · 3 sesiones</p></div><CalendarDays size={18} /></div><div><time>08:00</time><i className="green"/><section><strong>Fundamentos de Bases de Datos</strong><small>ISC-4B · LC-2</small></section><span>Finalizada</span></div><div><time>12:00</time><i className="blue"/><section><strong>Tecnologías de la Información</strong><small>IGE-5A · C-08</small></section><span>Próxima</span></div><div><time>16:00</time><i className="amber"/><section><strong>Taller de Investigación II</strong><small>ISC-8A · A-03</small></section><span>Más tarde</span></div></article><article className="teacher-panel teacher-actions"><div className="teacher-panel-title"><div><h2>Acciones rápidas</h2><p>Herramientas frecuentes</p></div></div><div><button onClick={() => go('asistencia')}><ListChecks size={20} /><span>Tomar asistencia</span></button><button onClick={() => go('evaluaciones')}><ClipboardCheck size={20} /><span>Capturar notas</span></button><button onClick={() => go('actas')}><FileCheck2 size={20} /><span>Generar acta</span></button><button onClick={() => go('reportes')}><BarChart3 size={20} /><span>Ver reportes</span></button></div></article></section></>
}

function GroupsPage({ notify, openEvaluation }: { notify: TeacherNotice; openEvaluation: (groupId: string) => void }) {
  const [selected, setSelected] = useState<Group | null>(null)
  return <><TeacherHeading eyebrow="PERIODO 2026-2" title="Mis clases y grupos" description="Entra a un grupo para consultar sus datos o capturar calificaciones." /><section className="teacher-group-grid">{groups.map((group) => <article key={group.id}><div className={`teacher-group-accent ${group.color}`} /><div className="teacher-group-top"><span>{group.id}</span><b>{group.students} alumnos</b></div><small>{group.code}</small><h2>{group.subject}</h2><p><GraduationCap size={14} /> {group.career} · {group.semester}</p><p><CalendarDays size={14} /> {group.schedule}</p><p><Home size={14} /> {group.room}</p><div className="teacher-progress"><span>Avance del curso</span><b>{group.progress}%</b><i><em style={{width:`${group.progress}%`}} /></i></div><div className="teacher-group-actions"><button onClick={() => setSelected(group)}>Ver grupo</button><button className="primary" onClick={() => openEvaluation(group.id)}>Capturar <ChevronRight size={16} /></button></div></article>)}</section>{selected && <div className="teacher-drawer-layer"><button className="teacher-drawer-bg" onClick={() => setSelected(null)} /><aside className="teacher-group-drawer"><div className="teacher-drawer-head"><div><p>DATOS GENERALES DEL GRUPO</p><h2>{selected.subject}</h2><span>{selected.id} · {selected.code}</span></div><button onClick={() => setSelected(null)}><X size={19} /></button></div><section><h3>Información académica</h3><dl><div><dt>Programa</dt><dd>{selected.career}</dd></div><div><dt>Semestre</dt><dd>{selected.semester}</dd></div><div><dt>Horario</dt><dd>{selected.schedule}</dd></div><div><dt>Aula</dt><dd>{selected.room}</dd></div><div><dt>Alumnos inscritos</dt><dd>{selected.students}</dd></div><div><dt>Avance</dt><dd>{selected.progress}%</dd></div></dl></section><section><h3>Estado de evaluación</h3><div className="drawer-evaluation"><ClipboardCheck size={20} /><div><strong>{selected.pending}</strong><small>{selected.pending === 'Sin pendientes' ? 'Evaluaciones capturadas correctamente' : 'Captura requerida antes del cierre'}</small></div></div></section><section><h3>Estudiantes recientes</h3>{students.slice(0,4).map((student) => <div className="drawer-student" key={student.id}><span>{student.name.split(' ').slice(0,2).map((part)=>part[0]).join('')}</span><div><strong>{student.name}</strong><small>{student.id}</small></div><b>{student.grade}</b></div>)}</section><div className="teacher-drawer-actions"><button onClick={() => notify('Lista del grupo preparada para descarga.')}><Download size={16}/> Descargar lista</button><button onClick={() => openEvaluation(selected.id)}><ClipboardCheck size={16}/> Capturar calificaciones</button></div></aside></div>}</>
}

function EvaluationsPage({ actsOnly = false, notify }: { actsOnly?: boolean; notify: TeacherNotice }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedGroupId = searchParams.get('grupo')
  const [grades, setGrades] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(groups.map((group) => [group.id, Object.fromEntries(students.map((student) => [student.id, String(student.grade)]))])))
  const [studentSearch, setStudentSearch] = useState('')
  const [saved, setSaved] = useState(false)
  const institution = loadInstitutionSettings()
  const grading = institution.grading
  if (actsOnly) return <><TeacherHeading eyebrow="CONTROL ESCOLAR" title="Actas de calificaciones" description="Genera, consulta y descarga las actas de tus grupos." /><section className="teacher-panel acts-panel"><div className="teacher-act-row heading"><span>Grupo y materia</span><span>Periodo</span><span>Estado</span><span>Acta</span></div>{groups.map((item,index)=><div className="teacher-act-row" key={item.id}><div><strong>{item.subject}</strong><small>{item.id} · {item.code}</small></div><span>2026-2</span><span className={index===1?'closed':'pending'}>{index===1?'Cerrada':'Pendiente de firma'}</span><button onClick={()=>notify(index===1?'Acta preparada para descarga.':'Acta preliminar generada.')}><FileText size={15}/>{index===1?'Descargar':'Generar preliminar'}</button></div>)}</section></>
  if (!selectedGroupId) return <><TeacherHeading eyebrow="EVALUACIÓN ACADÉMICA" title="Elige un grupo" description="Selecciona la materia en la que deseas capturar o revisar calificaciones." /><section className="evaluation-group-picker">{groups.map((group) => <article key={group.id}><div className={`evaluation-group-icon ${group.color}`}><BookOpen size={24} /></div><div className="evaluation-group-copy"><div><span>{group.id}</span><small>{group.code}</small></div><h2>{group.subject}</h2><p>{group.career} · {group.semester} semestre</p><div><span><Users size={16} /> {group.students} estudiantes</span><span><CalendarDays size={16} /> {group.schedule}</span></div></div><footer><span className={group.pending === 'Sin pendientes' ? 'ready' : 'pending'}>{group.pending}</span><button onClick={() => { setSearchParams({ grupo: group.id }); setSaved(false) }}>Abrir grupo <ChevronRight size={17} /></button></footer></article>)}</section></>

  const group = groups.find((item) => item.id === selectedGroupId) ?? groups[0]
  const currentGrades = grades[group.id]
  const visibleStudents = students.filter((student) => `${student.name} ${student.id}`.toLowerCase().includes(studentSearch.toLowerCase()))
  const formatResult = (student: typeof students[number]) => {
    const raw = currentGrades[student.id]?.trim().toUpperCase() ?? ''
    if (grading.specialCodes.some((item) => item.code.toUpperCase() === raw)) return raw
    const numeric = Number(raw)
    if (!raw || Number.isNaN(numeric)) return '—'
    return ((student.grade - 2 + numeric) / 2).toFixed(grading.decimals)
  }
  const isValidGrade = (raw: string) => {
    const value = raw.trim().toUpperCase()
    if (grading.specialCodes.some((item) => item.code.toUpperCase() === value)) return true
    const numeric = Number(value)
    return value !== '' && !Number.isNaN(numeric) && numeric >= grading.minimumGrade && numeric <= grading.maximumGrade
  }

  const updateGrade = (studentId: string, value: string) => {
    setGrades((current) => ({ ...current, [group.id]: { ...current[group.id], [studentId]: value } }))
    setSaved(false)
  }

  return <>
    <TeacherHeading eyebrow="EVALUACIÓN ACADÉMICA" title="Captura de calificaciones" description="Trabaja con un grupo a la vez, con su escala y claves institucionales." action={<button className="evaluation-back" onClick={() => setSearchParams({})}><ArrowLeft size={17} /> Cambiar de grupo</button>} />
    <section className="evaluation-summary"><div><span className={group.color}><BookOpen size={20}/></span><section><small>{group.code} · {group.id}</small><h2>{group.subject}</h2><p>{group.students} estudiantes · {group.career}</p></section></div><div><small>Evaluación actual</small><strong>{group.pending}</strong></div><div><small>Fecha límite</small><strong>20 sep 2026</strong></div></section>
    <section className="grading-rules-banner"><div><strong>Escala institucional</strong><span>{grading.minimumGrade}–{grading.maximumGrade} · Aprobatoria: {grading.passingGrade}</span></div><div className="grading-code-chips">{grading.specialCodes.map((item) => <span key={item.code} title={item.description}><b>{item.code}</b> {item.label}</span>)}</div></section>
    <article className="teacher-grade-table">
      <div className="grade-table-tools"><label><Search size={18}/><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Buscar por nombre o matrícula" /></label><span><AlertCircle size={16}/> Selecciona el tipo de resultado configurado por el instituto.</span></div>
      <div className="grade-table-scroll"><table><thead><tr><th>Estudiante</th><th>Matrícula</th><th>Parcial 1</th><th>Parcial 2 o clave</th><th>Resultado</th></tr></thead><tbody>{visibleStudents.map((student) => {
        const rawGrade = currentGrades[student.id] ?? ''
        const selectedCode = grading.specialCodes.find((item) => item.code.toUpperCase() === rawGrade.trim().toUpperCase())
        return <tr key={student.id}><td><div className="teacher-student"><span>{student.name.split(' ').slice(0,2).map((part)=>part[0]).join('')}</span><strong>{student.name}</strong></div></td><td>{student.id}</td><td>{student.grade-2}</td><td><div className={`grade-entry ${selectedCode ? 'special' : ''}`}>
          <select aria-label={`Tipo de resultado de ${student.name}`} value={selectedCode?.code ?? 'numeric'} onChange={(event) => updateGrade(student.id, event.target.value === 'numeric' ? String(student.grade) : event.target.value)}>
            <option value="numeric">Calificación numérica</option>
            {grading.specialCodes.map((item) => <option key={item.code} value={item.code}>{item.code} — {item.label}</option>)}
          </select>
          {!selectedCode && <input type="number" aria-label={`Calificación de ${student.name}`} className={isValidGrade(rawGrade) ? '' : 'invalid'} min={grading.minimumGrade} max={grading.maximumGrade} step={10 ** -grading.decimals} value={rawGrade} onChange={(event) => updateGrade(student.id, event.target.value)} placeholder={`${grading.minimumGrade}–${grading.maximumGrade}`} />}
        </div></td><td><b className={formatResult(student) === '—' ? 'empty' : ''}>{formatResult(student)}</b></td></tr>
      })}</tbody></table></div>
      <div className="grade-table-actions"><span>{saved?<><CheckCircle2 size={17}/> Borrador guardado</>:<>{visibleStudents.length} alumnos mostrados de {group.students}</>}</span><button onClick={()=>{setSaved(true);notify(`Calificaciones de ${group.id} guardadas como borrador.`)}}><Save size={17}/> Guardar borrador</button></div>
    </article>
  </>
}

function AttendancePage({ notify }: { notify: TeacherNotice }) {
  const [groupId,setGroupId]=useState('ISC-6A')
  const [attendance,setAttendance]=useState<Record<string,boolean>>(()=>Object.fromEntries(students.map((student)=>[student.id,true])))
  const present=Object.values(attendance).filter(Boolean).length
  return <><TeacherHeading eyebrow="SEGUIMIENTO DE CLASE" title="Lista de asistencia" description="Registra y consulta la asistencia de tus estudiantes." /><section className="attendance-controls"><label>Grupo<select value={groupId} onChange={(event)=>setGroupId(event.target.value)}>{groups.map((group)=><option key={group.id} value={group.id}>{group.id} · {group.subject}</option>)}</select></label><label>Fecha<input type="date" defaultValue="2026-09-14" /></label><div><span>Presentes</span><strong>{present} / {students.length}</strong></div></section><article className="teacher-panel attendance-list"><div className="teacher-panel-title"><div><h2>{groups.find((group)=>group.id===groupId)?.subject}</h2><p>Pasa lista marcando el estado de cada estudiante</p></div></div>{students.map((student,index)=><div key={student.id}><span>{index+1}</span><div className="teacher-student"><i>{student.name.split(' ').slice(0,2).map((part)=>part[0]).join('')}</i><section><strong>{student.name}</strong><small>{student.id}</small></section></div><label className={attendance[student.id]?'present':'absent'}><input type="checkbox" checked={attendance[student.id]} onChange={(event)=>setAttendance((current)=>({...current,[student.id]:event.target.checked}))}/>{attendance[student.id]?<><Check size={14}/> Presente</>:<>Ausente</>}</label></div>)}<footer><span>{present} presentes · {students.length-present} ausentes</span><button onClick={()=>notify('Lista de asistencia guardada correctamente.')}><Save size={16}/> Guardar asistencia</button></footer></article></>
}

function HistoryPage({ notify }: { notify: TeacherNotice }) {
  const past=[['2026-1','Programación Web','ISC-6A','29','88.7'],['2026-1','Bases de Datos','ISC-4A','31','86.4'],['2025-2','Programación Web','ISC-6B','27','90.1'],['2025-2','Taller de Investigación II','ISC-8A','22','89.3'],['2025-1','Bases de Datos','ISC-4B','30','85.9']]
  return <><TeacherHeading eyebrow="ARCHIVO ACADÉMICO" title="Grupos de ciclos anteriores" description="Consulta listas, calificaciones y actas de periodos concluidos." /><article className="teacher-panel teacher-history"><div className="history-toolbar"><label><Search size={16}/><input placeholder="Buscar materia o grupo" /></label><select><option>Todos los periodos</option><option>2026-1</option><option>2025-2</option></select></div><table><thead><tr><th>Periodo</th><th>Materia</th><th>Grupo</th><th>Alumnos</th><th>Promedio</th><th>Expediente</th></tr></thead><tbody>{past.map((item)=><tr key={item.join('-')}><td><strong>{item[0]}</strong></td><td>{item[1]}</td><td>{item[2]}</td><td>{item[3]}</td><td><b>{item[4]}</b></td><td><button onClick={()=>notify(`Expediente de ${item[2]} preparado.`)}>Consultar <ChevronRight size={13}/></button></td></tr>)}</tbody></table></article></>
}

function ReportsPage({ notify }: { notify: TeacherNotice }) {
  const bars=[72,84,89,76,92,87,95,81]
  return <><TeacherHeading eyebrow="ANÁLISIS ACADÉMICO" title="Reportes y estadísticas" description="Analiza el desempeño y asistencia de todos tus grupos." action={<button className="teacher-primary" onClick={()=>notify('Reporte general preparado para descarga.')}><Download size={16}/> Descargar reporte</button>} /><section className="report-cards"><article><small>Promedio global</small><strong>87.4</strong><span className="up">↑ 2.1 puntos</span></article><article><small>Aprobación</small><strong>91%</strong><span className="up">↑ 4% vs. anterior</span></article><article><small>Asistencia media</small><strong>93%</strong><span>Últimas 4 semanas</span></article><article><small>Alumnos en riesgo</small><strong>8</strong><span className="warning">Requieren seguimiento</span></article></section><section className="reports-layout"><article className="teacher-panel grades-chart"><div className="teacher-panel-title"><div><h2>Distribución de calificaciones</h2><p>Todos los grupos · Periodo 2026-2</p></div></div><div className="bar-chart">{bars.map((height,index)=><div key={index}><i style={{height:`${height}%`}}/><span>{60+index*5}</span></div>)}</div></article><article className="teacher-panel group-performance"><div className="teacher-panel-title"><div><h2>Desempeño por grupo</h2><p>Promedio y aprobación</p></div></div>{groups.map((group,index)=><div key={group.id}><span className={group.color}>{group.id}</span><section><strong>{group.subject}</strong><i><em style={{width:`${82+index*4}%`}}/></i></section><b>{84+index*2}.5</b></div>)}</article></section><section className="teacher-panel report-downloads"><div className="teacher-panel-title"><div><h2>Reportes disponibles</h2><p>Genera documentos detallados por grupo</p></div></div><div>{['Concentrado de calificaciones','Índice de aprobación y reprobación','Reporte de asistencia','Alumnos en riesgo académico'].map((report)=><button key={report} onClick={()=>notify(`${report} preparado para descarga.`)}><FileText size={18}/><span>{report}</span><Download size={15}/></button>)}</div></section></>
}

function TeacherProfile({ notify }: { notify: TeacherNotice }) {
  function save(event:FormEvent){event.preventDefault();notify('Perfil docente actualizado correctamente.')}
  return <><TeacherHeading eyebrow="CUENTA INSTITUCIONAL" title="Mi perfil" description="Consulta y actualiza tu información de contacto." /><div className="teacher-profile-layout"><aside className="teacher-panel teacher-profile-card"><div>EM</div><h2>Dra. Elena Márquez</h2><p>DOC-0048</p><span>Docente activo</span><dl><div><dt>Departamento</dt><dd>Sistemas y Computación</dd></div><div><dt>Tipo de plaza</dt><dd>Tiempo completo</dd></div><div><dt>Antigüedad</dt><dd>8 años</dd></div><div><dt>Grupos actuales</dt><dd>4 grupos</dd></div></dl></aside><form className="teacher-panel teacher-profile-form" onSubmit={save}><div className="teacher-panel-title"><div><h2>Datos de contacto</h2><p>Información visible para coordinación académica</p></div><Pencil size={17}/></div><div className="two-fields"><label>Nombre(s)<input defaultValue="Elena"/></label><label>Apellidos<input defaultValue="Márquez Soto"/></label></div><div className="two-fields"><label>Teléfono<input defaultValue="636 415 9082"/></label><label>Correo institucional<input defaultValue="elena.marquez@universidad.edu.mx"/></label></div><label>Grado académico<input defaultValue="Doctorado en Ciencias de la Computación"/></label><label>Áreas de especialidad<input defaultValue="Desarrollo web, bases de datos, ingeniería de software"/></label><button className="teacher-primary"><Save size={15}/> Guardar cambios</button></form></div></>
}

export default function TeacherPortal(){
  const location=useLocation();const navigate=useNavigate();const [menuOpen,setMenuOpen]=useState(false);const [notice,setNotice]=useState('');const active=location.pathname.split('/')[2]||'inicio';
  const notify=(message:string)=>{setNotice(message);window.setTimeout(()=>setNotice(''),2800)};const go=(slug:string)=>navigate(`/docentes/${slug}`);const logout=()=>{signOut();navigate('/')};
  if(getRole()!=='teacher')return <Navigate to="/" replace/>;
  let content:React.ReactNode;if(active==='grupos')content=<GroupsPage notify={notify} openEvaluation={(groupId)=>navigate(`/docentes/evaluaciones?grupo=${groupId}`)}/>;else if(active==='evaluaciones')content=<EvaluationsPage notify={notify}/>;else if(active==='asistencia')content=<AttendancePage notify={notify}/>;else if(active==='actas')content=<EvaluationsPage actsOnly notify={notify}/>;else if(active==='historial')content=<HistoryPage notify={notify}/>;else if(active==='reportes')content=<ReportsPage notify={notify}/>;else if(active==='perfil')content=<TeacherProfile notify={notify}/>;else content=<TeacherHome go={go}/>;
  return <div className="teacher-shell"><TeacherSidebar active={active} open={menuOpen} go={go} close={()=>setMenuOpen(false)} logout={logout}/><div className="teacher-main"><header className="teacher-topbar"><button className="teacher-menu" onClick={()=>setMenuOpen(true)}><Menu size={20}/></button><div><strong>{loadInstitutionSettings().name}</strong><span>Periodo académico 2026-2</span></div><div><button className="teacher-notification"><Bell size={19}/><i/></button><div className="teacher-avatar">EM</div></div></header><main className="teacher-content"><FadeContent key={active} blur>{content}</FadeContent></main></div>{menuOpen&&<button className="teacher-overlay" onClick={()=>setMenuOpen(false)}/>} {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}</div>}</div>
}
