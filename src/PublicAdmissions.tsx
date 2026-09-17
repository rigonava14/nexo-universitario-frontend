import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Applicant, careers, createApplicant } from './admissions'
import FadeContent from './components/FadeContent'

export function PublicHeader() {
  return <header className="public-header"><Link to="/aspirantes" className="public-brand"><span><GraduationCap size={23} /></span><div><strong>Nexo</strong><small>Admisiones</small></div></Link><nav><Link to="/aspirantes">Inicio</Link><Link to="/aspirantes/registro">Registrarme</Link><Link to="/aspirantes/seguimiento">Consultar proceso</Link></nav><Link className="outline-link" to="/admin">Acceso institucional</Link></header>
}

export function AdmissionsHome() {
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <FadeContent blur duration={0.65}>
        <section className="admissions-hero">
          <div className="hero-copy"><p className="public-eyebrow">ADMISIONES 2027 · REGISTRO ABIERTO</p><h1>Tu futuro comienza aquí.</h1><p>Realiza tu proceso de admisión en línea, consulta cada etapa y mantén tus documentos siempre disponibles.</p><div className="hero-actions"><Link className="public-primary" to="/aspirantes/registro">Iniciar mi registro <ArrowRight size={18} /></Link><Link className="public-secondary" to="/aspirantes/seguimiento"><Search size={17} /> Consultar mi proceso</Link></div><small className="hero-help"><ShieldCheck size={15} /> Tus datos se mantienen seguros durante todo el proceso.</small></div>
          <div className="process-card"><div className="process-card-top"><span><GraduationCap size={24} /></span><div><small>PROCESO DE ADMISIÓN</small><strong>Periodo 2027-1</strong></div></div><div className="mini-step done"><i><Check size={14} /></i><div><strong>Registro en línea</strong><small>Completa tus datos personales</small></div></div><div className="mini-step active"><i>2</i><div><strong>Pago y ficha de examen</strong><small>Descarga tu referencia</small></div></div><div className="mini-step"><i>3</i><div><strong>Examen de admisión</strong><small>Consulta fecha y sede</small></div></div><div className="mini-step"><i>4</i><div><strong>Resultados e inscripción</strong><small>Obtén tu ficha de admisión</small></div></div></div>
        </section>
        </FadeContent>
        <FadeContent delay={0.08}>
        <section className="public-benefits"><div><UserRound size={21} /><strong>Registro simple</strong><span>Completa tu solicitud desde cualquier dispositivo.</span></div><div><ClipboardCheck size={21} /><strong>Seguimiento claro</strong><span>Consulta en qué etapa se encuentra tu proceso.</span></div><div><FileText size={21} /><strong>Documentos disponibles</strong><span>Descarga tus fichas cuando las necesites.</span></div></section>
        </FadeContent>
        <FadeContent delay={0.12}>
        <section className="public-programs"><p className="public-eyebrow">OFERTA ACADÉMICA</p><h2>Encuentra la carrera para ti</h2><div>{careers.slice(0, 4).map((career, index) => <article key={career}><span>0{index + 1}</span><h3>{career}</h3><Link to="/aspirantes/registro">Elegir programa <ArrowRight size={14} /></Link></article>)}</div></section>
        </FadeContent>
      </main>
    </div>
  )
}

export function ApplicantRegistration({ onCreate }: { onCreate: (applicant: Applicant) => void }) {
  const navigate = useNavigate()
  const [accepted, setAccepted] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const applicant = createApplicant({ name: String(data.get('name')), email: String(data.get('email')), phone: String(data.get('phone')), curp: String(data.get('curp')).toUpperCase(), career: String(data.get('career')), campus: 'Campus Central' })
    onCreate(applicant)
    navigate(`/aspirantes/seguimiento?folio=${applicant.id}&nuevo=1`)
  }

  return <div className="public-page public-page--soft"><PublicHeader /><main className="registration-shell"><Link className="back-link" to="/aspirantes"><ArrowLeft size={15} /> Volver a admisiones</Link><div className="registration-layout"><section><p className="public-eyebrow">SOLICITUD DE ADMISIÓN</p><h1>Crea tu expediente</h1><p>Captura tus datos tal como aparecen en tus documentos oficiales.</p><div className="registration-assurance"><ShieldCheck size={21} /><div><strong>Información protegida</strong><small>Podrás revisar tus datos antes de generar la solicitud.</small></div></div></section><form className="registration-form" onSubmit={submit}><div className="form-section-title"><span>1</span><div><strong>Datos del aspirante</strong><small>Todos los campos son obligatorios</small></div></div><label>Nombre completo<input name="name" placeholder="Nombre(s) y apellidos" required /></label><div className="two-fields"><label>CURP<input name="curp" minLength={18} maxLength={18} placeholder="18 caracteres" required /></label><label>Teléfono<input name="phone" placeholder="10 dígitos" required /></label></div><label>Correo electrónico<input name="email" type="email" placeholder="nombre@correo.com" required /></label><div className="form-section-title second"><span>2</span><div><strong>Programa académico</strong><small>Selecciona tu primera opción</small></div></div><label>Carrera solicitada<select name="career" required defaultValue=""><option value="" disabled>Selecciona una carrera</option>{careers.map((career) => <option key={career}>{career}</option>)}</select></label><label className="terms-check"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /><span>Confirmo que la información es correcta y acepto el aviso de privacidad.</span></label><button className="public-primary submit-application" disabled={!accepted}>Enviar solicitud <ArrowRight size={17} /></button></form></div></main></div>
}

const stages = [
  { title: 'Registro', description: 'Solicitud recibida', icon: UserRound },
  { title: 'Validación', description: 'Revisión de información', icon: ClipboardCheck },
  { title: 'Pago y examen', description: 'Evaluación de admisión', icon: CalendarCheck },
  { title: 'Resultado', description: 'Dictamen e inscripción', icon: BadgeCheck },
]

function progressFor(status: Applicant['status']) {
  if (status === 'Aceptado' || status === 'Inscrito' || status === 'No aceptado') return 4
  if (status === 'Examen programado' || status === 'Evaluación en proceso') return 3
  if (status === 'Datos validados' || status === 'Pago de examen pendiente') return 2
  return 1
}

export function ApplicantTracking({ applicants }: { applicants: Applicant[] }) {
  const params = new URLSearchParams(window.location.search)
  const [folio, setFolio] = useState(params.get('folio') ?? '')
  const [searched, setSearched] = useState(Boolean(params.get('folio')))
  const applicant = applicants.find((item) => item.id.toLowerCase() === folio.trim().toLowerCase())
  const progress = applicant ? progressFor(applicant.status) : 0

  function search(event: FormEvent) { event.preventDefault(); setSearched(true) }

  return <div className="public-page public-page--soft"><PublicHeader /><main className="tracking-shell"><div className="tracking-intro"><p className="public-eyebrow">SEGUIMIENTO DE ADMISIÓN</p><h1>Consulta tu proceso</h1><p>Ingresa el folio que recibiste al terminar tu registro.</p><form onSubmit={search}><Search size={19} /><input value={folio} onChange={(event) => { setFolio(event.target.value); setSearched(false) }} placeholder="Ej. ASP-2026-0148" /><button>Consultar</button></form><small>Para ver un proceso completo de ejemplo usa <button onClick={() => { setFolio('ASP-2026-0148'); setSearched(true) }}>ASP-2026-0148</button></small></div>
        {searched && !applicant && <div className="tracking-empty"><Search size={30} /><h2>No encontramos ese folio</h2><p>Verifica que esté escrito correctamente o comunícate con el área de admisiones.</p></div>}
        {applicant && <section className="tracking-result"><div className="tracking-result-head"><div><span>SOLICITUD {applicant.id}</span><h2>{applicant.name}</h2><p>{applicant.career}</p></div><strong className={`public-status ${applicant.status === 'Aceptado' ? 'accepted' : ''}`}>{applicant.status}</strong></div><div className="public-timeline">{stages.map((stage, index) => { const Icon = stage.icon; const done = index + 1 < progress; const active = index + 1 === progress; return <div className={`${done ? 'done' : ''} ${active ? 'active' : ''}`} key={stage.title}><span>{done ? <Check size={17} /> : <Icon size={18} />}</span><strong>{stage.title}</strong><small>{stage.description}</small></div> })}</div>
          {params.get('nuevo') && <div className="welcome-notice"><CheckCircle2 size={22} /><div><strong>¡Tu solicitud fue enviada!</strong><p>Guarda el folio <b>{applicant.id}</b>. Lo necesitarás para consultar tu proceso.</p></div></div>}
          <div className="tracking-grid"><article className="next-step-card"><p>PRÓXIMO PASO</p>{applicant.status === 'Aceptado' ? <><h3>Completa tu inscripción</h3><p>Fuiste aceptado. Descarga tu ficha de admisión y reúne los documentos indicados.</p><button className="document-button" onClick={() => window.print()}><Download size={17} /> Descargar ficha de admisión</button></> : applicant.paymentReference ? <><h3>Presenta tu examen</h3><p>{applicant.examDate ? `Tu examen está programado para ${applicant.examDate}.` : 'Realiza el pago para habilitar la programación de tu examen.'}</p><button className="document-button" onClick={() => window.print()}><Download size={17} /> Descargar ficha de examen</button></> : <><h3>Espera la validación</h3><p>El área de admisiones está revisando la información que proporcionaste.</p></>}</article><article className="documents-card"><h3>Mis documentos</h3><div className={applicant.applicationFile ? 'available' : ''}><FileText size={19} /><div><strong>Ficha del aspirante</strong><small>{applicant.applicationFile ?? 'Pendiente de generación'}</small></div>{applicant.applicationFile && <button onClick={() => window.print()}><Download size={16} /></button>}</div><div className={applicant.paymentReference ? 'available' : ''}><CreditCard size={19} /><div><strong>Ficha de pago de examen</strong><small>{applicant.paymentReference ?? 'Disponible después de validar datos'}</small></div>{applicant.paymentReference && <button onClick={() => window.print()}><Download size={16} /></button>}</div><div className={applicant.status === 'Aceptado' ? 'available' : ''}><GraduationCap size={19} /><div><strong>Ficha de admisión</strong><small>{applicant.status === 'Aceptado' ? 'ADM-' + applicant.id.slice(4) : 'Disponible si eres aceptado'}</small></div>{applicant.status === 'Aceptado' && <button onClick={() => window.print()}><Download size={16} /></button>}</div></article></div>
          <article className="print-sheet"><div><GraduationCap size={30} /><strong>Nexo Universitario</strong></div><p>COMPROBANTE DEL PROCESO DE ADMISIÓN</p><h2>{applicant.name}</h2><dl><div><dt>Folio</dt><dd>{applicant.id}</dd></div><div><dt>Programa</dt><dd>{applicant.career}</dd></div><div><dt>Estatus</dt><dd>{applicant.status}</dd></div><div><dt>Referencia de pago</dt><dd>{applicant.paymentReference ?? 'Pendiente'}</dd></div><div><dt>Fecha de examen</dt><dd>{applicant.examDate ?? 'Por asignar'}</dd></div></dl><small>Documento generado desde el portal de admisiones.</small></article>
        </section>}
      </main></div>
}
