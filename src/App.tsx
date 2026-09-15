import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import AdminApplicants from './AdminApplicants'
import { AdmissionsHome, ApplicantRegistration, ApplicantTracking } from './PublicAdmissions'
import { Applicant, loadApplicants, saveApplicants } from './admissions'
import StudentPortal from './StudentPortal'
import TeacherPortal from './TeacherPortal'
import InstitutionSettings from './InstitutionSettings'
import { InstitutionSettings as InstitutionConfig, applyInstitutionSettings, loadInstitutionSettings, resetInstitutionSettings, saveInstitutionSettings } from './institution'
import { demoAccounts, getRole, Role, routeForRole, signIn, signOut } from './auth'

type IconType = typeof LayoutDashboard

type NavItem = {
  label: string
  icon: IconType
}

const navigation: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'General',
    items: [
      { label: 'Resumen', icon: LayoutDashboard },
      { label: 'Aspirantes', icon: UserPlus },
      { label: 'Alumnos', icon: Users },
      { label: 'Docentes', icon: BookOpen },
    ],
  },
  {
    title: 'Gestión universitaria',
    items: [
      { label: 'Control escolar', icon: ClipboardCheck },
      { label: 'Oferta académica', icon: CalendarDays },
      { label: 'Finanzas', icon: CircleDollarSign },
      { label: 'Residencias', icon: BriefcaseBusiness },
      { label: 'Titulación', icon: GraduationCap },
      { label: 'Academias', icon: Building2 },
      { label: 'Inglés', icon: MessageSquareText },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Reportes', icon: TrendingUp },
      { label: 'Usuarios y permisos', icon: ShieldCheck },
      { label: 'Personalización institucional', icon: Settings },
      { label: 'Configuración', icon: Settings },
    ],
  },
]

const stats = [
  { label: 'Alumnos activos', value: '4,826', change: '+4.8%', note: 'vs. periodo anterior', tone: 'blue' },
  { label: 'Docentes', value: '312', change: '+12', note: 'nuevas incorporaciones', tone: 'violet' },
  { label: 'Recaudación del mes', value: '$2.4 M', change: '87%', note: 'de la meta mensual', tone: 'green' },
  { label: 'Trámites pendientes', value: '148', change: '23', note: 'requieren atención', tone: 'amber' },
]

const recentStudents = [
  { initials: 'AM', name: 'Ana Martínez López', id: '20260184', career: 'Ingeniería en Sistemas', semester: '4°', status: 'Activo' },
  { initials: 'CR', name: 'Carlos Ramírez Soto', id: '20260421', career: 'Ingeniería Industrial', semester: '2°', status: 'Activo' },
  { initials: 'DV', name: 'Daniela Vega Ruiz', id: '20251106', career: 'Gestión Empresarial', semester: '6°', status: 'Pendiente' },
  { initials: 'JL', name: 'Jorge Luna Pérez', id: '20260097', career: 'Ingeniería Mecatrónica', semester: '4°', status: 'Activo' },
]

function Login({ onLogin, institution }: { onLogin: (role: Role) => void; institution: InstitutionConfig }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(demoAccounts[1].email)
  const [password, setPassword] = useState('universidad')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const role = signIn(email, password)
    if (role) { setError(''); onLogin(role) }
    else setError('Datos incorrectos. Usa una cuenta de demostración y la contraseña universidad.')
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">
          <div className="brand-mark brand-mark--light"><GraduationCap size={27} /></div>
          <p className="eyebrow">GESTIÓN UNIVERSITARIA</p>
          <h1>{institution.name}<br />en un solo lugar.</h1>
          <p className="login-intro">{institution.tagline}. Un acceso para administración, docentes y alumnos.</p>
          <div className="login-proof">
            <div className="proof-avatars"><span>AM</span><span>CR</span><span>DV</span></div>
            <div><strong>Una experiencia más simple</strong><small>para toda la comunidad universitaria</small></div>
          </div>
        </div>
        <div className="brand-orbit brand-orbit-one" />
        <div className="brand-orbit brand-orbit-two" />
      </section>

      <section className="login-form-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="mobile-logo"><div className="brand-mark"><GraduationCap size={24} /></div><span>{institution.shortName} · Nexo</span></div>
          <p className="eyebrow eyebrow--dark">BIENVENIDO DE NUEVO</p>
          <h2>Inicia sesión</h2>
          <p className="form-subtitle">Ingresa con tu cuenta. Te llevaremos al portal que corresponde a tu rol.</p>

          <label>
            Correo institucional
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Contraseña
            <div className="password-field">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </label>
          <button className="primary-button" type="submit">Entrar a la plataforma</button>
          {error && <p className="login-error" role="alert">{error}</p>}
          <p className="demo-note">Demostración: elige una cuenta. Contraseña: universidad.</p>
          <div className="demo-accounts">{demoAccounts.map((account) => <button type="button" key={account.role} onClick={() => { setEmail(account.email); setError('') }}>{account.label}</button>)}</div>
          <Link className="student-access-link" to="/aspirantes">¿Eres aspirante? Consulta admisiones</Link>
          <a className="institution-contact" href={`mailto:${institution.contactEmail}`}>Contacto institucional: {institution.contactEmail}</a>
        </form>
      </section>
    </main>
  )
}

function Sidebar({ active, onSelect, open, onClose, role }: { active: string; onSelect: (label: string) => void; open: boolean; onClose: () => void; role: Role }) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark"><GraduationCap size={24} /></div>
        <div><strong>Nexo</strong><span>Universitario</span></div>
        <button className="icon-button sidebar-close" onClick={onClose}><X size={20} /></button>
      </div>
      <nav>
        {navigation.map((section) => (
          <div className="nav-section" key={section.title}>
            <p>{section.title}</p>
            {section.items.filter((item) => role === 'institution' || item.label !== 'Personalización institucional').map((item) => {
              const Icon = item.icon
              return (
                <button key={item.label} className={active === item.label ? 'active' : ''} onClick={() => { onSelect(item.label); onClose() }}>
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">LA</div>
        <div><strong>{role === 'institution' ? 'Instituto' : 'Laura Andrade'}</strong><span>{role === 'institution' ? 'Administrador institucional' : 'Administradora'}</span></div>
        <MoreHorizontal size={18} />
      </div>
    </aside>
  )
}

function StatCard({ item }: { item: typeof stats[number] }) {
  return (
    <article className="stat-card">
      <div className={`stat-dot stat-dot--${item.tone}`} />
      <p>{item.label}</p>
      <strong>{item.value}</strong>
      <div><span className={`change change--${item.tone}`}>{item.change}</span><small>{item.note}</small></div>
    </article>
  )
}

function Dashboard({ active }: { active: string }) {
  const date = useMemo(() => new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()), [])

  if (active !== 'Resumen' && active !== 'Alumnos') {
    return (
      <section className="empty-state">
        <div className="empty-icon"><FileBadge size={34} /></div>
        <p className="eyebrow eyebrow--dark">MÓDULO EN PREPARACIÓN</p>
        <h2>{active}</h2>
        <p>La navegación ya está lista. En la siguiente iteración construiremos aquí el flujo operativo de este módulo.</p>
      </section>
    )
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="date-label">{date}</p>
          <h1>{active === 'Alumnos' ? 'Gestión de alumnos' : 'Buenos días, Laura'}</h1>
          <p>{active === 'Alumnos' ? 'Consulta y administra los expedientes de la comunidad estudiantil.' : 'Esto es lo que está pasando hoy en tu institución.'}</p>
        </div>
        <button className="primary-button compact"><UserPlus size={18} /> Nuevo alumno</button>
      </section>

      <section className="stats-grid">{stats.map((item) => <StatCard item={item} key={item.label} />)}</section>

      <section className="dashboard-grid">
        <article className="panel enrollment-panel">
          <div className="panel-heading">
            <div><h3>Matrícula por periodo</h3><p>Alumnos activos durante los últimos ciclos</p></div>
            <button className="period-button">Últimos 5 periodos <ChevronDown size={15} /></button>
          </div>
          <div className="chart">
            <div className="y-labels"><span>5,000</span><span>4,000</span><span>3,000</span><span>2,000</span><span>1,000</span><span>0</span></div>
            <div className="chart-body">
              <div className="grid-lines"><i /><i /><i /><i /><i /><i /></div>
              <svg viewBox="0 0 700 230" preserveAspectRatio="none" aria-label="Gráfica ascendente de matrícula">
                <defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4C1D95" stopOpacity=".25" /><stop offset="100%" stopColor="#4C1D95" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-area" d="M0,188 C70,178 90,161 145,165 C205,169 220,139 290,142 C345,145 375,109 435,118 C500,126 525,82 580,90 C635,98 660,55 700,48 L700,230 L0,230 Z" />
                <path className="chart-line" d="M0,188 C70,178 90,161 145,165 C205,169 220,139 290,142 C345,145 375,109 435,118 C500,126 525,82 580,90 C635,98 660,55 700,48" />
              </svg>
              <div className="x-labels"><span>2024-1</span><span>2024-2</span><span>2025-1</span><span>2025-2</span><span>2026-1</span></div>
            </div>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading"><div><h3>Actividad reciente</h3><p>Últimos movimientos</p></div><button className="link-button">Ver todo</button></div>
          <div className="activity-list">
            <div><span className="activity-icon blue"><UserPlus size={17} /></span><p><strong>Nuevo aspirante registrado</strong><small>Mariana Torres · Hace 8 min</small></p></div>
            <div><span className="activity-icon green"><CircleDollarSign size={17} /></span><p><strong>Pago de reinscripción</strong><small>Folio 18492 · Hace 21 min</small></p></div>
            <div><span className="activity-icon violet"><ClipboardCheck size={17} /></span><p><strong>Calificaciones capturadas</strong><small>Sistemas 6A · Hace 47 min</small></p></div>
            <div><span className="activity-icon amber"><FileBadge size={17} /></span><p><strong>Solicitud de titulación</strong><small>Expediente 2021048 · Hace 1 h</small></p></div>
          </div>
        </article>
      </section>

      <section className="panel students-panel">
        <div className="panel-heading">
          <div><h3>Alumnos recientes</h3><p>Últimos registros y actualizaciones</p></div>
          <button className="secondary-button">Ver todos los alumnos</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Alumno</th><th>Matrícula</th><th>Carrera</th><th>Semestre</th><th>Estatus</th><th /></tr></thead>
            <tbody>{recentStudents.map((student) => (
              <tr key={student.id}>
                <td><div className="student"><span>{student.initials}</span><strong>{student.name}</strong></div></td>
                <td>{student.id}</td><td>{student.career}</td><td>{student.semester}</td>
                <td><span className={`status ${student.status === 'Activo' ? 'status--active' : 'status--pending'}`}>{student.status}</span></td>
                <td><button className="icon-button"><MoreHorizontal size={18} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function App() {
  const [, setRole] = useState<Role | null>(getRole)
  const [active, setActive] = useState('Resumen')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [applicants, setApplicants] = useState<Applicant[]>(loadApplicants)
  const [institution, setInstitution] = useState<InstitutionConfig>(loadInstitutionSettings)
  useEffect(() => applyInstitutionSettings(institution), [institution])
  const location = useLocation()
  const navigate = useNavigate()
  const signedRole = getRole()

  function updateApplicant(updated: Applicant) {
    setApplicants((current) => {
      const next = current.map((item) => item.id === updated.id ? updated : item)
      saveApplicants(next)
      return next
    })
  }

  function createNewApplicant(applicant: Applicant) {
    setApplicants((current) => {
      const next = [applicant, ...current]
      saveApplicants(next)
      return next
    })
  }

  function updateInstitution(settings: InstitutionConfig) {
    saveInstitutionSettings(settings)
    setInstitution(settings)
  }

  function restoreInstitution() {
    setInstitution(resetInstitutionSettings())
  }

  if (location.pathname === '/') return <Login institution={institution} onLogin={(nextRole) => { setRole(nextRole); navigate(routeForRole(nextRole)) }} />
  if (location.pathname === '/aspirantes/registro') return <ApplicantRegistration onCreate={createNewApplicant} />
  if (location.pathname === '/aspirantes/seguimiento') return <ApplicantTracking applicants={applicants} />
  if (location.pathname.startsWith('/aspirantes')) return <AdmissionsHome />
  if (location.pathname.startsWith('/alumnos')) return <StudentPortal />
  if (location.pathname.startsWith('/docentes')) return <TeacherPortal />

  if (!signedRole) return <Navigate to="/" replace />
  if (signedRole !== 'admin' && signedRole !== 'institution') return <Navigate to={routeForRole(signedRole)} replace />
  if (location.pathname === '/admin/landing') return <Navigate to={signedRole === 'institution' ? '/admin/institucion' : '/admin'} replace />
  if (location.pathname === '/admin/institucion' && signedRole !== 'institution') return <Navigate to="/admin" replace />

  const isApplicantsModule = location.pathname === '/admin/aspirantes'
  const isSettingsModule = location.pathname === '/admin/institucion'

  function selectModule(label: string) {
    setActive(label)
    navigate(label === 'Aspirantes' ? '/admin/aspirantes' : label === 'Personalización institucional' ? '/admin/institucion' : '/admin')
  }

  return (
    <div className="app-shell">
      <Sidebar active={isApplicantsModule ? 'Aspirantes' : isSettingsModule ? 'Personalización institucional' : active} onSelect={selectModule} open={sidebarOpen} onClose={() => setSidebarOpen(false)} role={signedRole} />
      <div className="app-content">
        <header>
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)}><Menu size={21} /></button>
          <div className="institution-selector"><Building2 size={18} /><span>{institution.name}</span><ChevronDown size={15} /></div>
          <div className="header-actions">
            <label className="search-box"><Search size={18} /><input placeholder="Buscar alumno, trámite..." /></label>
            <button className="icon-button notification"><Bell size={20} /><i /></button>
            <button className="header-signout" onClick={() => { signOut(); setRole(null); navigate('/') }}>Cerrar sesión</button><div className="header-avatar">{signedRole === 'institution' ? institution.shortName.slice(0, 2).toUpperCase() : 'LA'}</div>
          </div>
        </header>
        <main className="page-content">{isApplicantsModule ? <AdminApplicants applicants={applicants} onUpdate={updateApplicant} /> : isSettingsModule ? <InstitutionSettings settings={institution} onSave={updateInstitution} onReset={restoreInstitution} /> : <Dashboard active={active} />}</main>
      </div>
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default App
