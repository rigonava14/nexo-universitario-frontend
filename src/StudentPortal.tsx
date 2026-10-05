import { FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentEmail, getRole, signOut } from './auth'
import { loadDirectory } from './directory'
import DocumentFiles from './DocumentFiles'
import { loadInstitutionSettings } from './institution'
import FadeContent from './components/FadeContent'
import {
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Download,
  FileBadge,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Newspaper,
  Pencil,
  ScrollText,
  ShieldCheck,
  Upload,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'

const studentNavigation = [
  { label: 'Inicio', slug: 'inicio', icon: Home },
  { label: 'Mis clases', slug: 'clases', icon: BookOpen },
  { label: 'Horario', slug: 'horario', icon: CalendarDays },
  { label: 'Calificaciones', slug: 'calificaciones', icon: Award },
  { label: 'Kardex', slug: 'kardex', icon: ScrollText },
  { label: 'Pagos', slug: 'pagos', icon: WalletCards },
  { label: 'Becas y trámites', slug: 'tramites', icon: FileBadge },
  { label: 'Mis procesos', slug: 'procesos', icon: BriefcaseBusiness },
  { label: 'Noticias', slug: 'noticias', icon: Newspaper },
  { label: 'Mi perfil', slug: 'perfil', icon: UserRound },
]

const subjects = [
  { code: 'SCD-1021', name: 'Redes de Computadoras', teacher: 'Mtro. Ricardo Salas', room: 'Lab. Cómputo 3', schedule: 'Lun y mié · 09:00–11:00', grade: 91, color: 'blue' },
  { code: 'SCC-1014', name: 'Programación Web', teacher: 'Dra. Elena Márquez', room: 'Aula B-12', schedule: 'Mar y jue · 11:00–13:00', grade: 96, color: 'violet' },
  { code: 'ACF-0905', name: 'Ecuaciones Diferenciales', teacher: 'Mtro. Hugo Peña', room: 'Aula A-07', schedule: 'Lun, mié y vie · 13:00–14:00', grade: 84, color: 'amber' },
  { code: 'SCD-1015', name: 'Lenguajes y Autómatas II', teacher: 'Dra. Patricia Vela', room: 'Aula C-04', schedule: 'Mar y jue · 08:00–10:00', grade: 88, color: 'green' },
]

const weekSchedule = [
  { day: 'Lunes', classes: [{ time: '09:00', subject: 'Redes de Computadoras', room: 'LC-3' }, { time: '13:00', subject: 'Ecuaciones Diferenciales', room: 'A-07' }] },
  { day: 'Martes', classes: [{ time: '08:00', subject: 'Lenguajes y Autómatas II', room: 'C-04' }, { time: '11:00', subject: 'Programación Web', room: 'B-12' }] },
  { day: 'Miércoles', classes: [{ time: '09:00', subject: 'Redes de Computadoras', room: 'LC-3' }, { time: '13:00', subject: 'Ecuaciones Diferenciales', room: 'A-07' }] },
  { day: 'Jueves', classes: [{ time: '08:00', subject: 'Lenguajes y Autómatas II', room: 'C-04' }, { time: '11:00', subject: 'Programación Web', room: 'B-12' }] },
  { day: 'Viernes', classes: [{ time: '13:00', subject: 'Ecuaciones Diferenciales', room: 'A-07' }] },
]

const history = [
  { period: '2026-1', semester: '6°', credits: 28, average: 89.8, status: 'Acreditado' },
  { period: '2025-2', semester: '5°', credits: 30, average: 91.2, status: 'Acreditado' },
  { period: '2025-1', semester: '4°', credits: 29, average: 87.6, status: 'Acreditado' },
  { period: '2024-2', semester: '3°', credits: 27, average: 90.4, status: 'Acreditado' },
  { period: '2024-1', semester: '2°', credits: 28, average: 88.9, status: 'Acreditado' },
]

const news = [
  { category: 'Académico', date: '14 SEP', title: 'Convocatoria de movilidad estudiantil 2027', copy: 'Conoce las universidades participantes y requisitos para cursar un semestre fuera.', tone: 'blue' },
  { category: 'Becas', date: '12 SEP', title: 'Beca de excelencia académica', copy: 'La convocatoria para estudiantes con promedio mayor a 90 ya está disponible.', tone: 'green' },
  { category: 'Campus', date: '10 SEP', title: 'Semana de innovación y tecnología', copy: 'Talleres, conferencias y actividades para toda la comunidad universitaria.', tone: 'violet' },
]

type NoticeSetter = (message: string) => void

function StudentSidebar({ active, open, onClose, onNavigate, onLogout }: { active: string; open: boolean; onClose: () => void; onNavigate: (slug: string) => void; onLogout: () => void }) {
  return <aside className={`student-sidebar ${open ? 'open' : ''}`}><div className="student-side-brand"><span><GraduationCap size={23} /></span><div><strong>CampusOne</strong><small>Portal de estudiantes</small></div><button onClick={onClose}><X size={19} /></button></div><div className="student-mini-profile"><div>AM</div><strong>Ana Martínez López</strong><span>Ing. en Sistemas · 6° semestre</span></div><nav>{studentNavigation.map((item) => { const Icon = item.icon; return <button className={active === item.slug ? 'active' : ''} key={item.slug} onClick={() => { onNavigate(item.slug); onClose() }}><Icon size={18} /><span>{item.label}</span></button> })}</nav><button className="student-logout" onClick={onLogout}><LogOut size={17} /> Cerrar sesión</button></aside>
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="student-page-heading"><div><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></div>{action}</div>
}

function StudentHome({ go, notify }: { go: (slug: string) => void; notify: NoticeSetter }) {
  return <><PageHeading eyebrow="LUNES, 14 DE SEPTIEMBRE" title="Buenos días, Ana" description="Aquí tienes un resumen de tu vida universitaria." /><section className="student-summary-grid"><article><span className="student-metric blue"><BookOpen size={19} /></span><div><small>Materias inscritas</small><strong>6</strong><p>Periodo 2026-2</p></div></article><article><span className="student-metric green"><Award size={19} /></span><div><small>Promedio general</small><strong>89.6</strong><p>+1.2 vs. semestre anterior</p></div></article><article><span className="student-metric amber"><CircleDollarSign size={19} /></span><div><small>Saldo pendiente</small><strong>$2,850</strong><button onClick={() => go('pagos')}>Realizar pago</button></div></article><article><span className="student-metric violet"><GraduationCap size={19} /></span><div><small>Avance académico</small><strong>76%</strong><p>198 de 260 créditos</p></div></article></section><section className="student-home-grid"><article className="student-panel next-class"><div className="student-panel-title"><div><h2>Tu siguiente clase</h2><p>Hoy · 09:00–11:00</p></div><Clock3 size={20} /></div><span className="class-code">SCD-1021</span><h3>Redes de Computadoras</h3><p><UserRound size={15} /> Mtro. Ricardo Salas</p><p><Home size={15} /> Laboratorio de Cómputo 3</p><button onClick={() => go('clases')}>Ver información de la clase <ChevronRight size={15} /></button></article><article className="student-panel today-schedule"><div className="student-panel-title"><div><h2>Horario de hoy</h2><p>2 clases programadas</p></div><button onClick={() => go('horario')}>Ver semana</button></div><div className="today-item"><time>09:00</time><i className="blue" /><div><strong>Redes de Computadoras</strong><small>LC-3 · 2 horas</small></div></div><div className="today-item"><time>13:00</time><i className="amber" /><div><strong>Ecuaciones Diferenciales</strong><small>A-07 · 1 hora</small></div></div></article><article className="student-panel grade-preview"><div className="student-panel-title"><div><h2>Últimas calificaciones</h2><p>Segundo parcial</p></div><button onClick={() => go('calificaciones')}>Ver todas</button></div>{subjects.slice(0,3).map((subject) => <div key={subject.code}><span className={subject.color}>{subject.name.slice(0,2).toUpperCase()}</span><div><strong>{subject.name}</strong><small>{subject.code}</small></div><b>{subject.grade}</b></div>)}</article><article className="student-panel quick-actions"><div className="student-panel-title"><div><h2>Acciones rápidas</h2><p>Trámites frecuentes</p></div></div><div><button onClick={() => { go('tramites'); notify('Selecciona el documento que deseas solicitar.') }}><FileText size={19} /><span>Solicitar constancia</span></button><button onClick={() => go('pagos')}><CreditCard size={19} /><span>Consultar pagos</span></button><button onClick={() => go('kardex')}><ScrollText size={19} /><span>Descargar kardex</span></button><button onClick={() => go('procesos')}><BriefcaseBusiness size={19} /><span>Mis procesos</span></button></div></article></section><section className="student-panel news-strip"><div className="student-panel-title"><div><h2>Noticias para ti</h2><p>Información de tu comunidad</p></div><button onClick={() => go('noticias')}>Ver todas</button></div><div>{news.map((item) => <article key={item.title}><span className={item.tone}>{item.category}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section></>
}

function ClassesPage({ scheduleOnly = false }: { scheduleOnly?: boolean }) {
  if (scheduleOnly) return <><PageHeading eyebrow="PERIODO 2026-2" title="Mi horario" description="Consulta tus clases y espacios asignados durante la semana." action={<button className="student-outline-button" onClick={() => window.print()}><Download size={16} /> Descargar horario</button>} /><section className="weekly-schedule">{weekSchedule.map((day) => <article key={day.day}><h3>{day.day}</h3>{day.classes.map((item) => <div key={item.time + item.subject}><time>{item.time}</time><strong>{item.subject}</strong><small>{item.room}</small></div>)}</article>)}</section><div className="schedule-legend"><span><i className="blue" /> Clases regulares</span><p>Los cambios de aula se reflejan automáticamente.</p></div></>
  return <><PageHeading eyebrow="PERIODO 2026-2" title="Mis clases" description="Consulta docentes, horarios, aulas y recursos de tus materias." /><section className="subject-grid">{subjects.map((subject) => <article key={subject.code}><div className={`subject-accent ${subject.color}`} /><div className="subject-card-top"><span>{subject.code}</span><b>{subject.grade}</b></div><h2>{subject.name}</h2><p><UserRound size={14} /> {subject.teacher}</p><p><CalendarDays size={14} /> {subject.schedule}</p><p><Home size={14} /> {subject.room}</p><div><button>Ver clase <ChevronRight size={15} /></button><button><MessageSquareText size={16} /></button></div></article>)}</section></>
}

function GradesPage({ kardex = false, notify }: { kardex?: boolean; notify: NoticeSetter }) {
  if (kardex) return <><PageHeading eyebrow="HISTORIAL ACADÉMICO" title="Mi kardex" description="Consulta tu trayectoria, créditos y promedios por periodo." action={<button className="student-primary-button" onClick={() => notify('Kardex preparado para descarga.') }><Download size={16} /> Descargar kardex</button>} /><section className="kardex-overview"><div><small>Promedio general</small><strong>89.6</strong></div><div><small>Créditos aprobados</small><strong>198 / 260</strong></div><div><small>Materias acreditadas</small><strong>36</strong></div><div><small>Avance de carrera</small><strong>76%</strong></div></section><article className="student-table-panel"><table><thead><tr><th>Periodo</th><th>Semestre</th><th>Créditos</th><th>Promedio</th><th>Estatus</th></tr></thead><tbody>{history.map((item) => <tr key={item.period}><td><strong>{item.period}</strong></td><td>{item.semester}</td><td>{item.credits}</td><td><b>{item.average}</b></td><td><span>Acreditado</span></td></tr>)}</tbody></table></article></>
  return <><PageHeading eyebrow="EVALUACIÓN ACADÉMICA" title="Calificaciones" description="Consulta los resultados parciales y finales del periodo actual." /><section className="grade-overview"><div><small>Promedio del periodo</small><strong>89.8</strong><span>Buen desempeño</span></div><div className="grade-progress"><p><span>Avance del periodo</span><b>68%</b></p><i><em /></i><small>Segundo parcial concluido</small></div></section><article className="student-table-panel"><table><thead><tr><th>Materia</th><th>Primer parcial</th><th>Segundo parcial</th><th>Promedio</th><th>Estatus</th></tr></thead><tbody>{subjects.map((subject, index) => <tr key={subject.code}><td><div className="grade-subject"><span className={subject.color}>{subject.name.slice(0,2).toUpperCase()}</span><div><strong>{subject.name}</strong><small>{subject.teacher}</small></div></div></td><td>{subject.grade - 2}</td><td>{subject.grade}</td><td><b>{subject.grade - 1}</b></td><td><span>{index === 2 ? 'En riesgo' : 'Regular'}</span></td></tr>)}</tbody></table></article></>
}

function PaymentsPage({ notify }: { notify: NoticeSetter }) {
  const [open, setOpen] = useState(false)
  const [paid, setPaid] = useState(false)
  function confirmPayment() { setPaid(true); setOpen(false); notify('Pago de demostración aplicado correctamente.') }
  return <><PageHeading eyebrow="ESTADO DE CUENTA" title="Pagos" description="Consulta adeudos, referencias y movimientos de tu cuenta." /><section className="payment-layout"><article className="balance-card"><p>SALDO ACTUAL</p><strong>{paid ? '$0.00' : '$2,850.00'}</strong><span>{paid ? 'Tu cuenta está al corriente' : 'Fecha límite: 30 de septiembre de 2026'}</span><button disabled={paid} onClick={() => setOpen(true)}><CreditCard size={17} /> {paid ? 'Pago realizado' : 'Pagar ahora'}</button></article><article className="payment-concepts"><h2>Conceptos pendientes</h2>{paid ? <div className="all-paid"><CheckCircle2 size={25} /><strong>Sin adeudos pendientes</strong></div> : <div><span><FileText size={18} /></span><div><strong>Reinscripción 2026-2</strong><small>Referencia: REI-2026-0184</small></div><b>$2,850.00</b></div>}</article></section><article className="student-table-panel payment-history"><div className="student-panel-title"><div><h2>Historial de movimientos</h2><p>Últimos pagos registrados</p></div></div><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Referencia</th><th>Monto</th><th>Comprobante</th></tr></thead><tbody><tr><td>18 feb 2026</td><td>Reinscripción 2026-1</td><td>REI-2026-0184</td><td><b>$2,750.00</b></td><td><button onClick={() => notify('Comprobante preparado para descarga.')}><Download size={15} /> Descargar</button></td></tr><tr><td>04 nov 2025</td><td>Constancia de estudios</td><td>TRA-2025-1042</td><td><b>$180.00</b></td><td><button onClick={() => notify('Comprobante preparado para descarga.')}><Download size={15} /> Descargar</button></td></tr></tbody></table></article>{open && <div className="student-modal-layer"><button className="student-modal-backdrop" onClick={() => setOpen(false)} /><section className="student-modal"><button className="modal-close" onClick={() => setOpen(false)}><X size={19} /></button><span className="modal-icon"><CreditCard size={25} /></span><h2>Realizar pago</h2><p>Reinscripción 2026-2</p><strong>$2,850.00 MXN</strong><label>Método de pago<select><option>Tarjeta de crédito o débito</option><option>Transferencia bancaria</option><option>Referencia para ventanilla</option></select></label><div className="secure-note"><ShieldCheck size={16} /> Pago de demostración. No se realizará ningún cargo real.</div><button className="student-primary-button full" onClick={confirmPayment}>Confirmar pago de demostración</button></section></div>}</>
}

function ProceduresPage({ notify }: { notify: NoticeSetter }) {
  const [scholarship, setScholarship] = useState(false)
  const documents = ['Constancia de estudios', 'Constancia de calificaciones', 'Carta de buena conducta', 'Historial académico']
  return <><PageHeading eyebrow="SERVICIOS ESCOLARES" title="Becas y trámites" description="Solicita apoyos y documentos sin acudir a ventanilla." /><section className="scholarship-banner"><div><span><Award size={23} /></span><div><p>CONVOCATORIA ABIERTA</p><h2>Beca de excelencia académica</h2><small>Apoyo de hasta 50% para estudiantes con promedio mínimo de 90.</small></div></div><button disabled={scholarship} onClick={() => { setScholarship(true); notify('Solicitud de beca iniciada. Revisa los requisitos pendientes.') }}>{scholarship ? <><Check size={16} /> Solicitud iniciada</> : <>Solicitar beca <ChevronRight size={16} /></>}</button></section><div className="procedure-grid"><section className="student-panel"><div className="student-panel-title"><div><h2>Solicitar documento</h2><p>Documentos digitales con validación institucional</p></div></div>{documents.map((document) => <div className="document-request" key={document}><span><FileText size={18} /></span><div><strong>{document}</strong><small>Entrega estimada: 1–2 días hábiles</small></div><button onClick={() => notify(`Solicitud de “${document}” registrada.`)}>Solicitar</button></div>)}</section><section className="student-panel request-status"><div className="student-panel-title"><div><h2>Mis solicitudes</h2><p>Seguimiento de trámites recientes</p></div></div><div><span className="done"><Check size={15} /></span><section><strong>Constancia de estudios</strong><small>Folio TRA-2026-0087 · Lista para descargar</small></section><button onClick={() => notify('Constancia preparada para descarga.')}><Download size={15} /></button></div><div><span><Clock3 size={15} /></span><section><strong>Beca alimenticia</strong><small>Folio BEC-2026-0032 · En revisión</small></section></div>{scholarship && <div><span><Clock3 size={15} /></span><section><strong>Beca de excelencia</strong><small>Nueva solicitud · Requisitos pendientes</small></section></div>}</section></div></>
}

const processes = [
  { key: 'social', title: 'Servicio social', icon: UserRound, progress: 100, status: 'Liberado', detail: '480 horas acreditadas', color: 'green' },
  { key: 'residency', title: 'Residencia profesional', icon: BriefcaseBusiness, progress: 55, status: 'En proceso', detail: 'Reporte parcial pendiente', color: 'blue' },
  { key: 'degree', title: 'Titulación', icon: GraduationCap, progress: 20, status: 'Expediente abierto', detail: '3 de 8 documentos', color: 'violet' },
]

function ProcessesPage({ notify }: { notify: NoticeSetter }) {
  const [uploads, setUploads] = useState<Record<string,string>>({})
  return <><PageHeading eyebrow="FORMACIÓN PROFESIONAL" title="Mis procesos" description="Da seguimiento a servicio social, residencias profesionales y titulación." /><section className="process-overview-grid">{processes.map((process) => { const Icon = process.icon; return <article key={process.key}><div className={`process-icon ${process.color}`}><Icon size={21} /></div><span className={`process-pill ${process.color}`}>{process.status}</span><h2>{process.title}</h2><p>{process.detail}</p><div className="process-progress"><i><em style={{ width: `${process.progress}%` }} /></i><span>{process.progress}%</span></div><button>Ver expediente <ChevronRight size={15} /></button></article> })}</section><article className="student-panel upload-center"><div className="student-panel-title"><div><h2>Centro de documentos</h2><p>Adjunta evidencias a tus expedientes activos</p></div></div>{processes.map((process) => <div className="upload-row" key={process.key}><span className={`process-icon ${process.color}`}>{process.key === 'degree' ? <GraduationCap size={18} /> : process.key === 'residency' ? <BriefcaseBusiness size={18} /> : <UserRound size={18} />}</span><div><strong>{process.title}</strong><small>{uploads[process.key] ?? (process.progress === 100 ? 'Proceso concluido' : 'PDF o imagen · Máximo 10 MB')}</small></div>{process.progress === 100 ? <span className="uploaded"><CheckCircle2 size={15} /> Completo</span> : <label className={uploads[process.key] ? 'uploaded' : ''}>{uploads[process.key] ? <CheckCircle2 size={15} /> : <Upload size={15} />}{uploads[process.key] ? 'Adjuntado' : 'Subir archivo'}<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setUploads((current) => ({ ...current, [process.key]: file.name })); notify(`${file.name} fue adjuntado a ${process.title}.`) } }} /></label>}</div>)}</article></>
}

function NewsPage() {
  return <><PageHeading eyebrow="COMUNIDAD UNIVERSITARIA" title="Noticias y avisos" description="Mantente al día con convocatorias, eventos e información importante." /><section className="student-news-grid">{[...news, { category: 'Deportes', date: '08 SEP', title: 'Inscripciones para equipos representativos', copy: 'Consulta las disciplinas y horarios disponibles para este semestre.', tone: 'amber' }, { category: 'Biblioteca', date: '05 SEP', title: 'Nuevas bases de datos académicas', copy: 'Ya puedes consultar nuevos recursos digitales desde tu cuenta institucional.', tone: 'blue' }, { category: 'Cultura', date: '02 SEP', title: 'Talleres culturales 2026-2', copy: 'Música, fotografía, teatro y más actividades con valor complementario.', tone: 'violet' }].map((item) => <article key={item.title}><div className={`news-visual ${item.tone}`}><time>{item.date}</time><Newspaper size={25} /></div><div><span>{item.category}</span><h2>{item.title}</h2><p>{item.copy}</p><button>Leer aviso <ChevronRight size={14} /></button></div></article>)}</section></>
}

function ProfilePage({ notify }: { notify: NoticeSetter }) {
  function save(event: FormEvent) { event.preventDefault(); notify('Perfil actualizado correctamente.') }
  return <><PageHeading eyebrow="CUENTA PERSONAL" title="Mi perfil" description="Mantén actualizados tus datos personales y de contacto." /><div className="profile-layout"><aside className="student-panel profile-card"><div className="profile-avatar">AM</div><h2>Ana Martínez López</h2><p>20230184</p><span>Estudiante activo</span><dl><div><dt>Carrera</dt><dd>Ing. en Sistemas Computacionales</dd></div><div><dt>Semestre</dt><dd>6° semestre</dd></div><div><dt>Correo institucional</dt><dd>ana.martinez@alumnos.edu.mx</dd></div></dl></aside><form className="student-panel profile-form" onSubmit={save}><div className="student-panel-title"><div><h2>Información de contacto</h2><p>Estos datos se usarán para notificaciones institucionales</p></div><Pencil size={17} /></div><div className="two-fields"><label>Nombre(s)<input defaultValue="Ana" /></label><label>Apellidos<input defaultValue="Martínez López" /></label></div><div className="two-fields"><label>Teléfono<input defaultValue="636 123 4567" /></label><label>Correo personal<input type="email" defaultValue="ana.martinez@email.com" /></label></div><label>Domicilio<input defaultValue="Av. Universidad 125, Col. Centro" /></label><div className="two-fields"><label>Contacto de emergencia<input defaultValue="María López" /></label><label>Teléfono de emergencia<input defaultValue="636 765 4321" /></label></div><button className="student-primary-button">Guardar cambios</button></form></div></>
}

export default function StudentPortal() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const active = location.pathname.split('/')[2] || 'inicio'
  const [linkedStudent] = useState(() => loadDirectory('students').records.find((item) => item.email.toLowerCase() === getCurrentEmail()?.toLowerCase()))

  function notify(message: string) { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }
  function logout() { signOut(); navigate('/') }
  function go(slug: string) { navigate(`/alumnos/${slug}`) }

  if (getRole() !== 'student') return <Navigate to="/" replace />

  let content: React.ReactNode
  if (active === 'clases') content = <ClassesPage />
  else if (active === 'horario') content = <ClassesPage scheduleOnly />
  else if (active === 'calificaciones') content = <GradesPage notify={notify} />
  else if (active === 'kardex') content = <GradesPage kardex notify={notify} />
  else if (active === 'pagos') content = <PaymentsPage notify={notify} />
  else if (active === 'tramites') content = <ProceduresPage notify={notify} />
  else if (active === 'procesos') content = <ProcessesPage notify={notify} />
  else if (active === 'noticias') content = <NewsPage />
  else if (active === 'perfil') content = <><ProfilePage notify={notify} />{linkedStudent ? <DocumentFiles key={linkedStudent.id} ownerType="student" ownerId={linkedStudent.id} administrative={false} /> : <p className="directory-local">Para subir documentos, Control escolar debe vincular un alumno con el correo de esta sesión. Los datos del perfil superior son de demostración.</p>}</>
  else content = <StudentHome go={go} notify={notify} />

  return <div className="student-shell"><StudentSidebar active={active} open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={go} onLogout={logout} /><div className="student-main"><header className="student-topbar"><button className="student-menu-button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div><strong>{loadInstitutionSettings().name}</strong><span>Periodo 2026-2</span></div><div><button className="student-notification"><Bell size={19} /><i /></button><div className="student-top-avatar">AM</div></div></header><main className="student-content"><FadeContent key={active} blur>{content}</FadeContent></main></div>{menuOpen && <button className="student-menu-overlay" onClick={() => setMenuOpen(false)} />}{notice && <div className="toast"><CheckCircle2 size={17} /> {notice}</div>}</div>
}
