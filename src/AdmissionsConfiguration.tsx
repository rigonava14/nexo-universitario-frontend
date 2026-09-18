import { CalendarDays, Check, FileText, GraduationCap, Plus, Trash2, Users } from 'lucide-react'
import { InstitutionSettings } from './institution'

type Props = {
  admissions: InstitutionSettings['admissions']
  enrollment: InstitutionSettings['enrollment']
  onAdmissionsChange: (value: InstitutionSettings['admissions']) => void
  onEnrollmentChange: (value: InstitutionSettings['enrollment']) => void
}

export default function AdmissionsConfiguration({ admissions, enrollment, onAdmissionsChange, onEnrollmentChange }: Props) {
  function admissionField<K extends keyof typeof admissions>(key: K, value: (typeof admissions)[K]) {
    onAdmissionsChange({ ...admissions, [key]: value })
  }

  function enrollmentField<K extends keyof typeof enrollment>(key: K, value: (typeof enrollment)[K]) {
    onEnrollmentChange({ ...enrollment, [key]: value })
  }

  function updateDocument(index: number, value: string) {
    admissionField('requiredDocuments', admissions.requiredDocuments.map((item, itemIndex) => itemIndex === index ? value : item))
  }

  return <div className="control-stack">
    <section className="school-control-card">
      <header><span><GraduationCap size={21} /></span><div><h2>Convocatoria y portal de aspirantes</h2><p>Define lo que verá el aspirante antes de iniciar su solicitud.</p></div></header>
      <div className="school-fields two">
        <label>Nombre de la convocatoria<input value={admissions.callName} onChange={(event) => admissionField('callName', event.target.value)} /></label>
        <label>Correo de soporte<input type="email" value={admissions.supportEmail} onChange={(event) => admissionField('supportEmail', event.target.value)} /></label>
        <label>Título principal<input value={admissions.portalHeadline} onChange={(event) => admissionField('portalHeadline', event.target.value)} /></label>
        <label>Modalidad del examen<select value={admissions.examMode} onChange={(event) => admissionField('examMode', event.target.value)}><option>Presencial</option><option>En línea</option><option>Híbrido</option></select></label>
        <label className="field-wide">Descripción del portal<textarea value={admissions.portalDescription} onChange={(event) => admissionField('portalDescription', event.target.value)} rows={3} /></label>
      </div>
      <div className="portal-copy-preview"><span>VISTA DEL ASPIRANTE</span><small>{admissions.callName}</small><strong>{admissions.portalHeadline}</strong><p>{admissions.portalDescription}</p></div>
    </section>

    <section className="school-control-card">
      <header><span><CalendarDays size={21} /></span><div><h2>Calendario de admisiones</h2><p>Centraliza las fechas que se mostrarán en avisos y seguimiento.</p></div></header>
      <div className="school-fields four">
        <label>Apertura de solicitudes<input type="date" value={admissions.applicationOpen} onChange={(event) => admissionField('applicationOpen', event.target.value)} /></label>
        <label>Cierre de solicitudes<input type="date" value={admissions.applicationClose} onChange={(event) => admissionField('applicationClose', event.target.value)} /></label>
        <label>Examen de admisión<input type="date" value={admissions.examDate} onChange={(event) => admissionField('examDate', event.target.value)} /></label>
        <label>Publicación de resultados<input type="date" value={admissions.resultsDate} onChange={(event) => admissionField('resultsDate', event.target.value)} /></label>
      </div>
      <div className="school-fields three compact-top">
        <label>Costo de ficha<input type="number" min="0" value={admissions.applicationFee} onChange={(event) => admissionField('applicationFee', Number(event.target.value))} /></label>
        <label>Cupo estimado<input type="number" min="0" value={admissions.capacity} onChange={(event) => admissionField('capacity', Number(event.target.value))} /></label>
        <label className="switch-field"><span><strong>Requerir pago</strong><small>Antes de programar el examen</small></span><input type="checkbox" checked={admissions.requirePayment} onChange={(event) => admissionField('requirePayment', event.target.checked)} /></label>
      </div>
    </section>

    <section className="school-control-card">
      <header className="with-action"><span><FileText size={21} /></span><div><h2>Documentos para nuevo ingreso</h2><p>Lista visible durante el registro y la inscripción.</p></div><button type="button" onClick={() => admissionField('requiredDocuments', [...admissions.requiredDocuments, 'Nuevo documento'])}><Plus size={17} /> Agregar</button></header>
      <div className="document-config-list">{admissions.requiredDocuments.map((document, index) => <div key={`${index}-${document}`}><Check size={16} /><input value={document} onChange={(event) => updateDocument(index, event.target.value)} /><button type="button" aria-label={`Eliminar ${document}`} onClick={() => admissionField('requiredDocuments', admissions.requiredDocuments.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={16} /></button></div>)}</div>
    </section>

    <section className="school-control-card">
      <header><span><Users size={21} /></span><div><h2>Inscripciones y reinscripciones</h2><p>Configura ventanas distintas para nuevo ingreso y alumnos actuales.</p></div></header>
      <div className="enrollment-windows">
        <article><span>NUEVO INGRESO</span><div className="school-fields two"><label>Inicio<input type="date" value={enrollment.newStudentOpen} onChange={(event) => enrollmentField('newStudentOpen', event.target.value)} /></label><label>Cierre<input type="date" value={enrollment.newStudentClose} onChange={(event) => enrollmentField('newStudentClose', event.target.value)} /></label></div></article>
        <article><span>ALUMNOS ACTUALES</span><div className="school-fields two"><label>Inicio<input type="date" value={enrollment.returningOpen} onChange={(event) => enrollmentField('returningOpen', event.target.value)} /></label><label>Cierre<input type="date" value={enrollment.returningClose} onChange={(event) => enrollmentField('returningClose', event.target.value)} /></label></div></article>
      </div>
      <div className="school-fields three compact-top">
        <label>Prefijo de matrícula<input value={enrollment.studentIdPrefix} onChange={(event) => enrollmentField('studentIdPrefix', event.target.value)} /></label>
        <label>Máximo de materias<input type="number" min="1" value={enrollment.maximumSubjects} onChange={(event) => enrollmentField('maximumSubjects', Number(event.target.value))} /></label>
        <label>Recargo extemporáneo<input type="number" min="0" value={enrollment.lateFee} onChange={(event) => enrollmentField('lateFee', Number(event.target.value))} /></label>
        <label className="switch-field"><span><strong>Inscripción extemporánea</strong><small>Permitir después de la fecha límite</small></span><input type="checkbox" checked={enrollment.allowLateEnrollment} onChange={(event) => enrollmentField('allowLateEnrollment', event.target.checked)} /></label>
        <label className="field-wide">Indicaciones para alumnos<textarea rows={3} value={enrollment.instructions} onChange={(event) => enrollmentField('instructions', event.target.value)} /></label>
      </div>
    </section>
  </div>
}
