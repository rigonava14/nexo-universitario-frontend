import { FormEvent, useState } from 'react'
import { CheckCircle2, Download, GraduationCap, RotateCcw, Save } from 'lucide-react'
import { defaultSettings, InstitutionSettings as Settings, loadInstitutionSettings, validInstitutionSettings } from './institution'

type Props = { settings: Settings; onSave: (settings: Settings) => void; onReset: () => void }
type ColorKey = keyof Settings['colors']

const colorFields: { key: ColorKey; label: string; help: string }[] = [
  { key: 'primary', label: 'Color principal', help: 'Marca, navegación y botones' },
  { key: 'secondary', label: 'Color secundario', help: 'Acciones y detalles destacados' },
  { key: 'accent', label: 'Acento', help: 'Indicadores y pequeños detalles' },
  { key: 'background', label: 'Fondo', help: 'Superficies de los portales' },
  { key: 'text', label: 'Texto', help: 'Títulos y contenido principal' },
]

export default function InstitutionSettings({ settings, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function updateText(key: 'name' | 'shortName' | 'tagline' | 'contactEmail', value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
    setMessage('')
    setError('')
  }

  function updateColor(key: ColorKey, value: string) {
    setDraft((current) => ({ ...current, colors: { ...current.colors, [key]: value } }))
    setMessage('')
    setError('')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validInstitutionSettings(draft)) {
      setError('Completa todos los datos del instituto y selecciona colores válidos.')
      return
    }
    const normalized = {
      ...draft,
      name: draft.name.trim(),
      shortName: draft.shortName.trim(),
      tagline: draft.tagline.trim(),
      contactEmail: draft.contactEmail.trim(),
    }
    onSave(normalized)
    setDraft(normalized)
    setError('')
    setMessage('Personalización guardada en este navegador.')
  }

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'institution.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    if (!window.confirm('¿Restaurar la configuración institucional predeterminada en este navegador?')) return
    onReset()
    setDraft(loadInstitutionSettings())
    setError('')
    setMessage('Configuración restaurada.')
  }

  return <section className="institution-settings">
    <div className="module-heading"><div><p className="date-label">ADMINISTRACIÓN DEL INSTITUTO</p><h1>Personalización institucional</h1><p>Adapta la identidad y los colores de la plataforma sin editar código ni JSON.</p></div></div>
    <div className="institution-settings-layout">
      <form className="panel institution-form" onSubmit={save}>
        <div className="institution-form-section"><h2>Datos del instituto</h2><p>Estos datos aparecen en el acceso y las cabeceras de los portales.</p>
          <div className="institution-fields">
            <label className="institution-field institution-field-wide">Nombre del instituto<input value={draft.name} onChange={(event) => updateText('name', event.target.value)} required maxLength={90} /></label>
            <label className="institution-field">Nombre corto o siglas<input value={draft.shortName} onChange={(event) => updateText('shortName', event.target.value)} required maxLength={12} /></label>
            <label className="institution-field">Correo de contacto<input type="email" value={draft.contactEmail} onChange={(event) => updateText('contactEmail', event.target.value)} required /></label>
            <label className="institution-field institution-field-wide">Lema institucional<input value={draft.tagline} onChange={(event) => updateText('tagline', event.target.value)} required maxLength={140} /></label>
          </div>
        </div>
        <div className="institution-form-section"><h2>Colores de la plataforma</h2><p>Selecciona cada color. La vista previa cambia al instante; el sitio se actualiza al guardar.</p>
          <div className="institution-colors">{colorFields.map((field) => <label className="institution-color" key={field.key}><span className="institution-color-text"><strong>{field.label}</strong><small>{field.help}</small></span><input type="color" aria-label={field.label} value={draft.colors[field.key]} onChange={(event) => updateColor(field.key, event.target.value)} /><code>{draft.colors[field.key].toUpperCase()}</code></label>)}</div>
        </div>
        <div className="institution-form-footer"><span role="status" className={error ? 'institution-error' : 'institution-message'}>{error || (message ? <><CheckCircle2 size={15} /> {message}</> : 'Los cambios se aplican al pulsar Guardar.')}</span><div><button className="institution-quiet-button" type="button" onClick={download}><Download size={15} /> Exportar JSON</button><button className="institution-quiet-button" type="button" onClick={reset}><RotateCcw size={15} /> Restaurar</button><button className="institution-save-button" type="submit"><Save size={16} /> Guardar cambios</button></div></div>
      </form>
      <aside className="institution-preview-column"><div className="panel institution-preview"><div className="institution-preview-heading"><strong>Vista previa</strong><span>Antes de guardar</span></div><div className="institution-preview-page" style={{ background: draft.colors.background, color: draft.colors.text }}><div className="institution-preview-header"><div className="institution-preview-logo" style={{ background: draft.colors.primary }}><GraduationCap size={20} /></div><div><strong>{draft.shortName || defaultSettings.shortName}</strong><small>{draft.name || 'Nombre del instituto'}</small></div></div><div className="institution-preview-hero"><i style={{ background: draft.colors.accent }} /><span>BIENVENIDO A TU CAMPUS</span><h3>{draft.name || 'Nombre del instituto'}</h3><p>{draft.tagline || 'Tu lema institucional'}</p><button type="button" style={{ background: draft.colors.secondary }}>Conoce la institución</button></div></div><div className="institution-preview-swatches">{colorFields.map((field) => <span key={field.key} title={field.label} style={{ background: draft.colors[field.key] }} />)}</div></div><div className="institution-local-note"><strong>Versión frontend</strong><p>La configuración se guarda en este navegador y genera el JSON internamente. Para publicarla a todos los usuarios hará falta conectarla a una API.</p></div></aside>
    </div>
  </section>
}
