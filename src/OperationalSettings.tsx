import { FormEvent, useState } from 'react'
import { Save } from 'lucide-react'
import { OperationFeedback, useOperations } from './operation-ui'
import './directory.css'

export default function OperationalSettings() {
  const store = useOperations()
  const [draft, setDraft] = useState(store.data.settings)
  const [modalities, setModalities] = useState(draft.graduationModalities.join('\n'))
  function save(event: FormEvent) {
    event.preventDefault()
    const graduationModalities = modalities.split('\n').map((item) => item.trim()).filter(Boolean)
    if (!graduationModalities.length || new Set(graduationModalities.map((item) => item.toLowerCase())).size !== graduationModalities.length) { store.setError('Agrega al menos una modalidad, sin nombres repetidos.'); return }
    const settings = { ...draft, graduationModalities }
    if (store.commit({ ...store.data, settings })) { setDraft(settings); setModalities(graduationModalities.join('\n')) }
  }
  return <section className="operation-module"><div className="module-heading"><div><p className="date-label">REGLAS OPERATIVAS</p><h1>Configuración</h1><p>Define los criterios usados en residencias, titulación e Inglés.</p></div></div><p className="directory-local">Demostración local · Los cambios se aplican a los módulos de este navegador.</p><OperationFeedback error={store.error} notice={store.notice} />
    <article className="operation-settings"><form className="directory-form" onSubmit={save}>
      <label>Horas mínimas de residencia<input required type="number" min={1} max={10000} step={1} value={draft.residencyHours} onChange={(event) => { setDraft({ ...draft, residencyHours: Number(event.target.value) }); store.setError('') }} /></label>
      <label>Calificación mínima de Inglés<input required type="number" min={0} max={100} step="0.1" value={draft.englishPassingGrade} onChange={(event) => { setDraft({ ...draft, englishPassingGrade: Number(event.target.value) }); store.setError('') }} /></label>
      <label>Asistencia mínima de Inglés (%)<input required type="number" min={0} max={100} step="0.1" value={draft.englishMinimumAttendance} onChange={(event) => { setDraft({ ...draft, englishMinimumAttendance: Number(event.target.value) }); store.setError('') }} /></label>
      <label className="directory-wide">Modalidades de titulación (una por línea)<textarea required rows={6} maxLength={3000} value={modalities} onChange={(event) => { setModalities(event.target.value); store.setError('') }} /></label>
      <p className="directory-wide">Los resultados de Inglés se calculan con las reglas vigentes. Las residencias ya concluidas conservan su estado; al editarlas se revisan los nuevos criterios. Las modalidades retiradas se conservan en expedientes existentes.</p>
      <footer className="directory-wide"><button className="primary-button compact" disabled={store.blocked}><Save size={16} />Guardar configuración</button></footer>
    </form></article>
  </section>
}
