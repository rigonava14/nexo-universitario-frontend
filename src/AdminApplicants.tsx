import { useMemo, useState } from 'react'
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileCheck2,
  Filter,
  Search,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Applicant, admissionStatuses } from './admissions'

type Props = {
  applicants: Applicant[]
  onUpdate: (applicant: Applicant) => void
}

function statusClass(status: Applicant['status']) {
  if (status === 'Aceptado' || status === 'Inscrito') return 'success'
  if (status === 'No aceptado') return 'danger'
  if (status.includes('pendiente') || status === 'Documentos en revisión') return 'warning'
  return 'info'
}

export default function AdminApplicants({ applicants, onUpdate }: Props) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selected, setSelected] = useState<Applicant | null>(null)
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => applicants.filter((applicant) => {
    const matchesQuery = `${applicant.name} ${applicant.id} ${applicant.curp}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (statusFilter === 'Todos' || applicant.status === statusFilter)
  }), [applicants, query, statusFilter])

  function applyUpdate(next: Applicant, message: string) {
    onUpdate(next)
    setSelected(next)
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  function validateData() {
    if (!selected) return
    applyUpdate({ ...selected, dataValidated: true, status: 'Datos validados' }, 'Datos del aspirante validados correctamente.')
  }

  function generateFile() {
    if (!selected) return
    const suffix = selected.id.split('-').pop()
    applyUpdate({
      ...selected,
      applicationFile: `FIC-2026-${suffix}`,
      paymentReference: selected.paymentReference ?? `EXA-26${suffix}-4821`,
      status: selected.status === 'Datos validados' ? 'Pago de examen pendiente' : selected.status,
    }, 'Ficha y referencia de pago generadas.')
  }

  return (
    <section className="applicants-admin">
      <div className="module-heading">
        <div>
          <p className="date-label">ADMISIONES · PERIODO 2027-1</p>
          <h1>Administración de aspirantes</h1>
          <p>Valida expedientes, genera fichas y controla el avance de cada solicitud.</p>
        </div>
        <button className="primary-button compact"><UserPlus size={17} /> Registrar aspirante</button>
      </div>

      <div className="admission-stats">
        <article><span className="metric-icon blue"><Users size={19} /></span><div><small>Solicitudes</small><strong>{applicants.length}</strong></div></article>
        <article><span className="metric-icon amber"><ClipboardList size={19} /></span><div><small>Por revisar</small><strong>{applicants.filter((item) => !item.dataValidated).length}</strong></div></article>
        <article><span className="metric-icon violet"><FileCheck2 size={19} /></span><div><small>Examen programado</small><strong>{applicants.filter((item) => item.status === 'Examen programado').length}</strong></div></article>
        <article><span className="metric-icon green"><BadgeCheck size={19} /></span><div><small>Aceptados</small><strong>{applicants.filter((item) => item.status === 'Aceptado').length}</strong></div></article>
      </div>

      <article className="panel applicant-list-panel">
        <div className="list-toolbar">
          <label className="module-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, folio o CURP" /></label>
          <label className="filter-select"><Filter size={15} /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Todos</option>{admissionStatuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} /></label>
        </div>
        <div className="table-wrap">
          <table className="applicants-table">
            <thead><tr><th>Aspirante</th><th>Folio</th><th>Carrera solicitada</th><th>Registro</th><th>Estatus</th><th /></tr></thead>
            <tbody>{filtered.map((applicant) => (
              <tr key={applicant.id} onClick={() => setSelected(applicant)}>
                <td><div className="applicant-person"><span>{applicant.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span><div><strong>{applicant.name}</strong><small>{applicant.email}</small></div></div></td>
                <td><strong className="folio-text">{applicant.id}</strong></td>
                <td>{applicant.career}</td><td>{applicant.registeredAt}</td>
                <td><span className={`admission-status ${statusClass(applicant.status)}`}>{applicant.status}</span></td>
                <td><button className="secondary-button" onClick={(event) => { event.stopPropagation(); setSelected(applicant) }}>Revisar</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="no-results">No hay aspirantes que coincidan con los filtros.</div>}
      </article>

      {selected && (
        <div className="drawer-layer" role="dialog" aria-modal="true">
          <button className="drawer-backdrop" aria-label="Cerrar detalle" onClick={() => setSelected(null)} />
          <aside className="applicant-drawer">
            <div className="drawer-header"><div><p>EXPEDIENTE DE ASPIRANTE</p><h2>{selected.name}</h2><span>{selected.id}</span></div><button className="icon-button" onClick={() => setSelected(null)}><X size={20} /></button></div>
            <div className="validation-banner">
              {selected.dataValidated ? <CheckCircle2 size={20} /> : <ClipboardList size={20} />}
              <div><strong>{selected.dataValidated ? 'Información validada' : 'Validación pendiente'}</strong><small>{selected.dataValidated ? 'El expediente fue revisado por admisiones.' : 'Confirma la identidad y los documentos capturados.'}</small></div>
            </div>
            <div className="drawer-section"><h3>Datos personales</h3><dl><div><dt>CURP</dt><dd>{selected.curp}</dd></div><div><dt>Correo</dt><dd>{selected.email}</dd></div><div><dt>Teléfono</dt><dd>{selected.phone}</dd></div><div><dt>Campus</dt><dd>{selected.campus}</dd></div></dl></div>
            <div className="drawer-section"><h3>Programa solicitado</h3><p className="career-card">{selected.career}</p></div>
            <div className="drawer-section">
              <h3>Control del proceso</h3>
              <label className="drawer-label">Estatus actual<select value={selected.status} onChange={(event) => applyUpdate({ ...selected, status: event.target.value as Applicant['status'] }, 'Estatus actualizado.')} >{admissionStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
              {selected.examDate && <p className="detail-note"><strong>Examen:</strong> {selected.examDate}</p>}
              {selected.score !== undefined && <p className="detail-note"><strong>Resultado:</strong> {selected.score}/100</p>}
            </div>
            <div className="drawer-section"><h3>Documentos generados</h3>{selected.applicationFile ? <div className="generated-file"><FileCheck2 size={18} /><div><strong>{selected.applicationFile}</strong><small>Ficha del aspirante</small></div><Download size={16} /></div> : <p className="muted-copy">Aún no se ha generado una ficha.</p>}</div>
            <div className="drawer-actions">
              <button className="secondary-action" onClick={validateData} disabled={selected.dataValidated}><CheckCircle2 size={17} /> {selected.dataValidated ? 'Datos validados' : 'Validar datos'}</button>
              <button className="primary-button compact" onClick={generateFile}><FileCheck2 size={17} /> Generar ficha</button>
            </div>
          </aside>
        </div>
      )}
      {notice && <div className="toast"><CheckCircle2 size={17} /> {notice}</div>}
    </section>
  )
}
