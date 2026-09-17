import { FormEvent, useState } from 'react'
import { CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, Plus, Save, Settings2, Trash2 } from 'lucide-react'
import { InstitutionSettings as Settings, validInstitutionSettings } from './institution'

type Props = { settings: Settings; onSave: (settings: Settings) => void }
type GradingNumberKey = 'minimumGrade' | 'maximumGrade' | 'passingGrade' | 'decimals'
type GradingTextKey = 'currentPeriod' | 'currentEvaluation' | 'captureDeadline'
type SpecialCodeKey = keyof Settings['grading']['specialCodes'][number]

const sections = [
  { id: 'periodos', label: 'Periodo y captura', description: 'Fechas y evaluación activa', icon: CalendarDays },
  { id: 'escala', label: 'Escala de calificación', description: 'Rangos y aprobación', icon: Settings2 },
  { id: 'claves', label: 'Claves especiales', description: 'NP, NA, NAD y otras', icon: ClipboardCheck },
  { id: 'actas', label: 'Actas y cierres', description: 'Preparado para la siguiente fase', icon: FileCheck2 },
]

export default function SchoolControl({ settings, onSave }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function clearFeedback() { setMessage(''); setError('') }

  function updateNumber(key: GradingNumberKey, value: string) {
    setDraft((current) => ({ ...current, grading: { ...current.grading, [key]: Number(value) } }))
    clearFeedback()
  }

  function updateText(key: GradingTextKey, value: string) {
    setDraft((current) => ({ ...current, grading: { ...current.grading, [key]: value } }))
    clearFeedback()
  }

  function updateSpecialCode(index: number, key: SpecialCodeKey, value: string) {
    setDraft((current) => ({
      ...current,
      grading: {
        ...current.grading,
        specialCodes: current.grading.specialCodes.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: key === 'code' ? value.toUpperCase() : value } : item),
      },
    }))
    clearFeedback()
  }

  function addSpecialCode() {
    setDraft((current) => ({ ...current, grading: { ...current.grading, specialCodes: [...current.grading.specialCodes, { code: '', label: '', description: '' }] } }))
    clearFeedback()
  }

  function removeSpecialCode(index: number) {
    setDraft((current) => ({ ...current, grading: { ...current.grading, specialCodes: current.grading.specialCodes.filter((_, itemIndex) => itemIndex !== index) } }))
    clearFeedback()
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized: Settings = {
      ...draft,
      grading: {
        ...draft.grading,
        currentPeriod: draft.grading.currentPeriod.trim(),
        currentEvaluation: draft.grading.currentEvaluation.trim(),
        captureDeadline: draft.grading.captureDeadline.trim(),
        specialCodes: draft.grading.specialCodes.map((item) => ({ code: item.code.trim().toUpperCase(), label: item.label.trim(), description: item.description.trim() })),
      },
    }
    if (!validInstitutionSettings(normalized)) {
      setMessage('')
      setError('Revisa la escala, el periodo y las claves antes de guardar.')
      return
    }
    onSave(normalized)
    setDraft(normalized)
    setError('')
    setMessage('Configuración de control escolar guardada en este navegador.')
  }

  function goTo(sectionId: string) {
    document.getElementById(`school-${sectionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <section className="school-control">
    <div className="module-heading"><div><p className="date-label">GESTIÓN ACADÉMICA</p><h1>Control escolar</h1><p>Administra periodos, criterios de evaluación y claves que utilizarán los docentes.</p></div></div>

    <div className="school-control-summary">
      <article><span><CalendarDays size={20} /></span><div><small>Periodo vigente</small><strong>{draft.grading.currentPeriod}</strong></div></article>
      <article><span><ClipboardCheck size={20} /></span><div><small>Evaluación activa</small><strong>{draft.grading.currentEvaluation}</strong></div></article>
      <article><span><Settings2 size={20} /></span><div><small>Escala</small><strong>{draft.grading.minimumGrade}–{draft.grading.maximumGrade}</strong></div></article>
      <article><span><FileCheck2 size={20} /></span><div><small>Claves disponibles</small><strong>{draft.grading.specialCodes.length}</strong></div></article>
    </div>

    <div className="school-control-layout">
      <aside className="school-control-nav"><div><strong>Secciones</strong><small>Configuración académica</small></div>{sections.map((section) => { const Icon = section.icon; return <button type="button" key={section.id} onClick={() => goTo(section.id)}><Icon size={19} /><span><strong>{section.label}</strong><small>{section.description}</small></span></button> })}</aside>

      <form className="school-control-form" onSubmit={save}>
        <section className="school-control-card" id="school-periodos">
          <header><span><CalendarDays size={21} /></span><div><h2>Periodo y captura vigente</h2><p>Estos datos aparecen en el portal docente y en las pantallas de evaluación.</p></div></header>
          <div className="school-fields three">
            <label>Periodo académico<input value={draft.grading.currentPeriod} onChange={(event) => updateText('currentPeriod', event.target.value)} placeholder="2026-2" required /></label>
            <label>Evaluación vigente<input value={draft.grading.currentEvaluation} onChange={(event) => updateText('currentEvaluation', event.target.value)} placeholder="Segundo parcial" required /></label>
            <label>Fecha límite de captura<input type="date" value={draft.grading.captureDeadline} onChange={(event) => updateText('captureDeadline', event.target.value)} required /></label>
          </div>
        </section>

        <section className="school-control-card" id="school-escala">
          <header><span><Settings2 size={21} /></span><div><h2>Escala de calificación</h2><p>Define el rango numérico y el criterio mínimo de acreditación.</p></div></header>
          <div className="school-fields four">
            <label>Calificación mínima<input type="number" value={draft.grading.minimumGrade} onChange={(event) => updateNumber('minimumGrade', event.target.value)} /></label>
            <label>Calificación máxima<input type="number" value={draft.grading.maximumGrade} onChange={(event) => updateNumber('maximumGrade', event.target.value)} /></label>
            <label>Mínima aprobatoria<input type="number" value={draft.grading.passingGrade} onChange={(event) => updateNumber('passingGrade', event.target.value)} /></label>
            <label>Decimales<select value={draft.grading.decimals} onChange={(event) => updateNumber('decimals', event.target.value)}><option value={0}>Sin decimales</option><option value={1}>1 decimal</option><option value={2}>2 decimales</option></select></label>
          </div>
        </section>

        <section className="school-control-card" id="school-claves">
          <header className="with-action"><span><ClipboardCheck size={21} /></span><div><h2>Claves especiales de evaluación</h2><p>Los combos de captura docente se generan automáticamente con estas opciones.</p></div><button type="button" onClick={addSpecialCode}><Plus size={17} /> Agregar clave</button></header>
          <div className="school-codes">{draft.grading.specialCodes.map((item, index) => <div className="school-code-row" key={index}>
            <label>Clave<input value={item.code} onChange={(event) => updateSpecialCode(index, 'code', event.target.value)} placeholder="NP" maxLength={8} required /></label>
            <label>Significado<input value={item.label} onChange={(event) => updateSpecialCode(index, 'label', event.target.value)} placeholder="No presentó" maxLength={60} required /></label>
            <label>Uso o descripción<input value={item.description} onChange={(event) => updateSpecialCode(index, 'description', event.target.value)} placeholder="Cuándo debe usarla el docente" maxLength={140} /></label>
            <button type="button" aria-label={`Eliminar clave ${item.code || index + 1}`} onClick={() => removeSpecialCode(index)}><Trash2 size={17} /></button>
          </div>)}</div>
        </section>

        <section className="school-control-card school-coming-soon" id="school-actas">
          <header><span><FileCheck2 size={21} /></span><div><h2>Actas y cierres de periodo</h2><p>Sección preparada para reglas de cierre, firmas y generación de actas en la siguiente fase.</p></div></header>
          <div><span>Próxima configuración</span><p>Las reglas de evaluación ya quedan centralizadas aquí para conectar este flujo posteriormente.</p></div>
        </section>

        <footer className="school-control-footer"><span role="status" className={error ? 'school-error' : 'school-message'}>{error || (message ? <><CheckCircle2 size={16} /> {message}</> : 'Los docentes verán los cambios después de guardar.')}</span><button type="submit"><Save size={17} /> Guardar control escolar</button></footer>
      </form>
    </div>
  </section>
}
