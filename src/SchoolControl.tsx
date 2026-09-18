import { FormEvent, useState } from 'react'
import { BadgeCheck, CalendarDays, CheckCircle2, ClipboardCheck, FileText, GraduationCap, Plus, Save, Settings2, Trash2 } from 'lucide-react'
import AdmissionExamBuilder from './AdmissionExamBuilder'
import AdmissionsConfiguration from './AdmissionsConfiguration'
import ReportDesigner from './ReportDesigner'
import { InstitutionSettings as Settings, validInstitutionSettings } from './institution'

type Props = { settings: Settings; onSave: (settings: Settings) => void }
type GradingNumberKey = 'minimumGrade' | 'maximumGrade' | 'passingGrade' | 'decimals'
type GradingTextKey = 'currentPeriod' | 'currentEvaluation' | 'captureDeadline'
type SpecialCodeKey = keyof Settings['grading']['specialCodes'][number]
type SectionId = 'calificaciones' | 'admisiones' | 'examen' | 'formatos' | 'actas'

const sections: Array<{ id: SectionId; label: string; description: string; icon: typeof CalendarDays }> = [
  { id: 'calificaciones', label: 'Evaluación y periodos', description: 'Captura, escala y claves', icon: ClipboardCheck },
  { id: 'admisiones', label: 'Admisiones e inscripción', description: 'Convocatorias y fechas', icon: CalendarDays },
  { id: 'examen', label: 'Examen de admisión', description: 'Banco y configuración', icon: GraduationCap },
  { id: 'formatos', label: 'Formatos y PDF', description: 'Diseñador de documentos', icon: FileText },
  { id: 'actas', label: 'Actas y cierres', description: 'Reglas administrativas', icon: BadgeCheck },
]

export default function SchoolControl({ settings, onSave }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [activeSection, setActiveSection] = useState<SectionId>('calificaciones')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function clearFeedback() { setMessage(''); setError('') }
  function updateNumber(key: GradingNumberKey, value: string) { setDraft((current) => ({ ...current, grading: { ...current.grading, [key]: Number(value) } })); clearFeedback() }
  function updateText(key: GradingTextKey, value: string) { setDraft((current) => ({ ...current, grading: { ...current.grading, [key]: value } })); clearFeedback() }
  function updateSpecialCode(index: number, key: SpecialCodeKey, value: string) { setDraft((current) => ({ ...current, grading: { ...current.grading, specialCodes: current.grading.specialCodes.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: key === 'code' ? value.toUpperCase() : value } : item) } })); clearFeedback() }
  function addSpecialCode() { setDraft((current) => ({ ...current, grading: { ...current.grading, specialCodes: [...current.grading.specialCodes, { code: '', label: '', description: '' }] } })); clearFeedback() }
  function removeSpecialCode(index: number) { setDraft((current) => ({ ...current, grading: { ...current.grading, specialCodes: current.grading.specialCodes.filter((_, itemIndex) => itemIndex !== index) } })); clearFeedback() }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized: Settings = {
      ...draft,
      grading: { ...draft.grading, currentPeriod: draft.grading.currentPeriod.trim(), currentEvaluation: draft.grading.currentEvaluation.trim(), captureDeadline: draft.grading.captureDeadline.trim(), specialCodes: draft.grading.specialCodes.map((item) => ({ code: item.code.trim().toUpperCase(), label: item.label.trim(), description: item.description.trim() })) },
    }
    if (!validInstitutionSettings(normalized)) { setMessage(''); setError('Revisa que no existan campos obligatorios o reactivos vacíos.'); return }
    onSave(normalized); setDraft(normalized); setError(''); setMessage('Configuración guardada en este navegador.')
  }

  return <section className="school-control">
    <div className="module-heading"><div><p className="date-label">CENTRO DE CONFIGURACIÓN ACADÉMICA</p><h1>Control escolar</h1><p>Personaliza admisiones, evaluación, inscripciones y documentos sin editar código.</p></div><div className="configuration-health"><CheckCircle2 size={18} /><span><strong>Demo local activa</strong><small>Los cambios se guardan en este navegador</small></span></div></div>

    <div className="school-control-summary">
      <article><span><CalendarDays size={20} /></span><div><small>Periodo vigente</small><strong>{draft.grading.currentPeriod}</strong></div></article>
      <article><span><GraduationCap size={20} /></span><div><small>Convocatoria</small><strong>{draft.admissions.callName}</strong></div></article>
      <article><span><ClipboardCheck size={20} /></span><div><small>Reactivos</small><strong>{draft.admissionExam.questions.length}</strong></div></article>
      <article><span><FileText size={20} /></span><div><small>Formatos PDF</small><strong>{draft.reports.templates.length}</strong></div></article>
    </div>

    <form className="school-control-layout" onSubmit={save}>
      <aside className="school-control-nav"><div><strong>Configuración</strong><small>Selecciona un área</small></div>{sections.map((section) => { const Icon = section.icon; return <button type="button" key={section.id} className={activeSection === section.id ? 'active' : ''} onClick={() => setActiveSection(section.id)}><Icon size={19} /><span><strong>{section.label}</strong><small>{section.description}</small></span></button> })}</aside>

      <div className="school-control-form">
        {activeSection === 'calificaciones' && <div className="control-stack">
          <section className="school-control-card"><header><span><CalendarDays size={21} /></span><div><h2>Periodo y captura vigente</h2><p>Estos datos aparecen en el portal docente y las pantallas de evaluación.</p></div></header><div className="school-fields three"><label>Periodo académico<input value={draft.grading.currentPeriod} onChange={(event) => updateText('currentPeriod', event.target.value)} required /></label><label>Evaluación vigente<input value={draft.grading.currentEvaluation} onChange={(event) => updateText('currentEvaluation', event.target.value)} required /></label><label>Fecha límite de captura<input type="date" value={draft.grading.captureDeadline} onChange={(event) => updateText('captureDeadline', event.target.value)} required /></label></div></section>
          <section className="school-control-card"><header><span><Settings2 size={21} /></span><div><h2>Escala de calificación</h2><p>Define rango numérico y criterio de acreditación.</p></div></header><div className="school-fields four"><label>Calificación mínima<input type="number" value={draft.grading.minimumGrade} onChange={(event) => updateNumber('minimumGrade', event.target.value)} /></label><label>Calificación máxima<input type="number" value={draft.grading.maximumGrade} onChange={(event) => updateNumber('maximumGrade', event.target.value)} /></label><label>Mínima aprobatoria<input type="number" value={draft.grading.passingGrade} onChange={(event) => updateNumber('passingGrade', event.target.value)} /></label><label>Decimales<select value={draft.grading.decimals} onChange={(event) => updateNumber('decimals', event.target.value)}><option value={0}>Sin decimales</option><option value={1}>1 decimal</option><option value={2}>2 decimales</option></select></label></div></section>
          <section className="school-control-card"><header className="with-action"><span><ClipboardCheck size={21} /></span><div><h2>Claves especiales</h2><p>Los combos docentes se generan con estas opciones.</p></div><button type="button" onClick={addSpecialCode}><Plus size={17} /> Agregar</button></header><div className="school-codes">{draft.grading.specialCodes.map((item, index) => <div className="school-code-row" key={index}><label>Clave<input value={item.code} onChange={(event) => updateSpecialCode(index, 'code', event.target.value)} required /></label><label>Significado<input value={item.label} onChange={(event) => updateSpecialCode(index, 'label', event.target.value)} required /></label><label>Uso o descripción<input value={item.description} onChange={(event) => updateSpecialCode(index, 'description', event.target.value)} /></label><button type="button" aria-label={`Eliminar ${item.code}`} onClick={() => removeSpecialCode(index)}><Trash2 size={17} /></button></div>)}</div></section>
        </div>}

        {activeSection === 'admisiones' && <AdmissionsConfiguration admissions={draft.admissions} enrollment={draft.enrollment} onAdmissionsChange={(admissions) => { setDraft((current) => ({ ...current, admissions })); clearFeedback() }} onEnrollmentChange={(enrollment) => { setDraft((current) => ({ ...current, enrollment })); clearFeedback() }} />}
        {activeSection === 'examen' && <AdmissionExamBuilder exam={draft.admissionExam} onChange={(admissionExam) => { setDraft((current) => ({ ...current, admissionExam })); clearFeedback() }} />}
        {activeSection === 'formatos' && <ReportDesigner reports={draft.reports} institutionName={draft.name} onChange={(reports) => { setDraft((current) => ({ ...current, reports })); clearFeedback() }} />}
        {activeSection === 'actas' && <section className="school-control-card"><header><span><BadgeCheck size={21} /></span><div><h2>Actas y cierres de periodo</h2><p>Reglas administrativas para cerrar evaluaciones.</p></div></header><div className="acta-options"><label><input type="checkbox" checked={draft.closingRules.lockAfterDeadline} onChange={(event) => setDraft((current) => ({ ...current, closingRules: { ...current.closingRules, lockAfterDeadline: event.target.checked } }))} /> Bloquear cambios después de la fecha límite</label><label><input type="checkbox" checked={draft.closingRules.requireTeacherConfirmation} onChange={(event) => setDraft((current) => ({ ...current, closingRules: { ...current.closingRules, requireTeacherConfirmation: event.target.checked } }))} /> Solicitar confirmación del docente</label><label><input type="checkbox" checked={draft.closingRules.requireCoordinatorSignature} onChange={(event) => setDraft((current) => ({ ...current, closingRules: { ...current.closingRules, requireCoordinatorSignature: event.target.checked } }))} /> Requerir firma de coordinación académica</label><label><input type="checkbox" checked={draft.closingRules.autoActNumber} onChange={(event) => setDraft((current) => ({ ...current, closingRules: { ...current.closingRules, autoActNumber: event.target.checked } }))} /> Generar folio de acta automáticamente</label></div><div className="integration-note"><strong>Preparado para integración</strong><p>Las reglas quedan guardadas en el demo. La firma, el sellado y los historiales requerirán autenticación y backend.</p></div></section>}

        <footer className="school-control-footer"><span role="status" className={error ? 'school-error' : 'school-message'}>{error || (message ? <><CheckCircle2 size={16} /> {message}</> : 'Guarda para aplicar los cambios en todos los portales.')}</span><button type="submit"><Save size={17} /> Guardar cambios</button></footer>
      </div>
    </form>
  </section>
}
