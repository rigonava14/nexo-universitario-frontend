import { useMemo } from 'react'
import { ChevronDown, CircleDollarSign, ClipboardCheck, FileBadge, MoreHorizontal, UserPlus } from 'lucide-react'

const stats = [
  { label: 'Alumnos activos', value: '4,826', change: '+4.8%', note: 'vs. periodo anterior', tone: 'blue' },
  { label: 'Docentes', value: '312', change: '+12', note: 'nuevas incorporaciones', tone: 'violet' },
  { label: 'Recaudación del mes', value: '$2.4 M', change: '87%', note: 'de la meta mensual', tone: 'green' },
  { label: 'Trámites pendientes', value: '148', change: '23', note: 'requieren atención', tone: 'amber' },
]

const recentStudents = [
  {
    initials: 'AM',
    name: 'Ana Martínez López',
    id: '20260184',
    career: 'Ingeniería en Sistemas',
    semester: '4°',
    status: 'Activo',
  },
  {
    initials: 'CR',
    name: 'Carlos Ramírez Soto',
    id: '20260421',
    career: 'Ingeniería Industrial',
    semester: '2°',
    status: 'Activo',
  },
  {
    initials: 'DV',
    name: 'Daniela Vega Ruiz',
    id: '20251106',
    career: 'Gestión Empresarial',
    semester: '6°',
    status: 'Pendiente',
  },
  {
    initials: 'JL',
    name: 'Jorge Luna Pérez',
    id: '20260097',
    career: 'Ingeniería Mecatrónica',
    semester: '4°',
    status: 'Activo',
  },
]

function StatCard({ item }: { item: (typeof stats)[number] }) {
  return (
    <article className="stat-card">
      <div className={`stat-dot stat-dot--${item.tone}`} />
      <p>{item.label}</p>
      <strong>{item.value}</strong>
      <div>
        <span className={`change change--${item.tone}`}>{item.change}</span>
        <small>{item.note}</small>
      </div>
    </article>
  )
}

export default function Dashboard({ active = 'Resumen' }: { active?: string }) {
  const date = useMemo(
    () => new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()),
    [],
  )

  if (active !== 'Resumen' && active !== 'Alumnos') {
    return (
      <section className="empty-state">
        <div className="empty-icon">
          <FileBadge size={34} />
        </div>
        <p className="eyebrow eyebrow--dark">MÓDULO EN PREPARACIÓN</p>
        <h2>{active}</h2>
        <p>
          La navegación ya está lista. En la siguiente iteración construiremos aquí el flujo operativo de este módulo.
        </p>
      </section>
    )
  }

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="date-label">{date}</p>
          <h1>{active === 'Alumnos' ? 'Gestión de alumnos' : 'Buenos días, Laura'}</h1>
          <p>
            {active === 'Alumnos'
              ? 'Consulta y administra los expedientes de la comunidad estudiantil.'
              : 'Esto es lo que está pasando hoy en tu institución.'}
          </p>
        </div>
        <button className="primary-button compact">
          <UserPlus size={18} /> Nuevo alumno
        </button>
      </section>

      <section className="stats-grid">
        {stats.map((item) => (
          <StatCard item={item} key={item.label} />
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel enrollment-panel">
          <div className="panel-heading">
            <div>
              <h3>Matrícula por periodo</h3>
              <p>Alumnos activos durante los últimos ciclos</p>
            </div>
            <button className="period-button">
              Últimos 5 periodos <ChevronDown size={15} />
            </button>
          </div>
          <div className="chart">
            <div className="y-labels">
              <span>5,000</span>
              <span>4,000</span>
              <span>3,000</span>
              <span>2,000</span>
              <span>1,000</span>
              <span>0</span>
            </div>
            <div className="chart-body">
              <div className="grid-lines">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <svg viewBox="0 0 700 230" preserveAspectRatio="none" aria-label="Gráfica ascendente de matrícula">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4C1D95" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#4C1D95" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="chart-area"
                  d="M0,188 C70,178 90,161 145,165 C205,169 220,139 290,142 C345,145 375,109 435,118 C500,126 525,82 580,90 C635,98 660,55 700,48 L700,230 L0,230 Z"
                />
                <path
                  className="chart-line"
                  d="M0,188 C70,178 90,161 145,165 C205,169 220,139 290,142 C345,145 375,109 435,118 C500,126 525,82 580,90 C635,98 660,55 700,48"
                />
              </svg>
              <div className="x-labels">
                <span>2024-1</span>
                <span>2024-2</span>
                <span>2025-1</span>
                <span>2025-2</span>
                <span>2026-1</span>
              </div>
            </div>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Actividad reciente</h3>
              <p>Últimos movimientos</p>
            </div>
            <button className="link-button">Ver todo</button>
          </div>
          <div className="activity-list">
            <div>
              <span className="activity-icon blue">
                <UserPlus size={17} />
              </span>
              <p>
                <strong>Nuevo aspirante registrado</strong>
                <small>Mariana Torres · Hace 8 min</small>
              </p>
            </div>
            <div>
              <span className="activity-icon green">
                <CircleDollarSign size={17} />
              </span>
              <p>
                <strong>Pago de reinscripción</strong>
                <small>Folio 18492 · Hace 21 min</small>
              </p>
            </div>
            <div>
              <span className="activity-icon violet">
                <ClipboardCheck size={17} />
              </span>
              <p>
                <strong>Calificaciones capturadas</strong>
                <small>Sistemas 6A · Hace 47 min</small>
              </p>
            </div>
            <div>
              <span className="activity-icon amber">
                <FileBadge size={17} />
              </span>
              <p>
                <strong>Solicitud de titulación</strong>
                <small>Expediente 2021048 · Hace 1 h</small>
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="panel students-panel">
        <div className="panel-heading">
          <div>
            <h3>Alumnos recientes</h3>
            <p>Últimos registros y actualizaciones</p>
          </div>
          <button className="secondary-button">Ver todos los alumnos</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Matrícula</th>
                <th>Carrera</th>
                <th>Semestre</th>
                <th>Estatus</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student">
                      <span>{student.initials}</span>
                      <strong>{student.name}</strong>
                    </div>
                  </td>
                  <td>{student.id}</td>
                  <td>{student.career}</td>
                  <td>{student.semester}</td>
                  <td>
                    <span className={`status ${student.status === 'Activo' ? 'status--active' : 'status--pending'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <button className="icon-button">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
