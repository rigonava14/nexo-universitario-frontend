import { ChangeEvent, FormEvent, useState } from 'react'
import { CheckCircle2, Download, GraduationCap, Palette, RotateCcw, Save, Upload } from 'lucide-react'
import {
  defaultSettings,
  InstitutionSettings as Settings,
  loadInstitutionSettings,
  normalizeInstitutionSettings,
  validInstitutionSettings,
} from './institution'

type Props = { settings: Settings; onSave: (settings: Settings) => void; onReset: () => void }
type ColorKey = keyof Settings['colors']

const colorGroups: { title: string; description: string; fields: { key: ColorKey; label: string; help: string }[] }[] = [
  {
    title: 'Identidad de marca',
    description: 'Los colores que dan personalidad a botones, enlaces y elementos destacados.',
    fields: [
      { key: 'primary', label: 'Principal', help: 'Navegación y acciones principales' },
      { key: 'secondary', label: 'Secundario', help: 'Acciones complementarias' },
      { key: 'accent', label: 'Acento', help: 'Indicadores y detalles' },
    ],
  },
  {
    title: 'Contenido y superficies',
    description: 'Controla el aspecto general de páginas, tarjetas, textos y separadores.',
    fields: [
      { key: 'background', label: 'Fondo del sitio', help: 'Lienzo general de los portales' },
      { key: 'surface', label: 'Tarjetas', help: 'Paneles, formularios y menús' },
      { key: 'text', label: 'Texto principal', help: 'Títulos y contenido importante' },
      { key: 'muted', label: 'Texto secundario', help: 'Ayudas y descripciones' },
      { key: 'border', label: 'Bordes', help: 'Separadores y contornos' },
    ],
  },
  {
    title: 'Menú lateral',
    description: 'Personaliza la barra de navegación que aparece en todos los portales.',
    fields: [
      { key: 'sidebar', label: 'Fondo del menú', help: 'Color base de la barra lateral' },
      { key: 'sidebarText', label: 'Texto del menú', help: 'Iconos, enlaces y nombre' },
    ],
  },
]

const presets: { name: string; description: string; colors: Settings['colors'] }[] = [
  { name: 'Metropolitana', description: 'Violeta cálido y enérgico', colors: defaultSettings.colors },
  { name: 'Océano', description: 'Azul confiable y contemporáneo', colors: { primary: '#0057A8', secondary: '#00A7A5', accent: '#FFB703', background: '#F2F7FB', surface: '#FFFFFF', text: '#102A43', muted: '#627D98', border: '#D9E4EC', sidebar: '#0B2742', sidebarText: '#FFFFFF' } },
  { name: 'Terracota', description: 'Cálido, humano y editorial', colors: { primary: '#8C3D2F', secondary: '#D97745', accent: '#E7B857', background: '#F8F1EA', surface: '#FFFDF8', text: '#35231F', muted: '#7C6860', border: '#E8D7CC', sidebar: '#3B241F', sidebarText: '#FFF8F0' } },
  { name: 'Bosque', description: 'Natural, sobrio y cercano', colors: { primary: '#1F6B4F', secondary: '#D45D4C', accent: '#D9A441', background: '#F1F7F3', surface: '#FCFFFD', text: '#173229', muted: '#5E776E', border: '#D7E5DC', sidebar: '#173B30', sidebarText: '#FFFFFF' } },
]

export default function InstitutionSettings({ settings, onSave, onReset }: Props) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function clearFeedback() {
    setMessage('')
    setError('')
  }

  function updateText(key: 'name' | 'shortName' | 'tagline' | 'contactEmail', value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
    clearFeedback()
  }

  function updateColor(key: ColorKey, value: string) {
    setDraft((current) => ({ ...current, colors: { ...current.colors, [key]: value } }))
    clearFeedback()
  }

  function choosePreset(preset: typeof presets[number]) {
    setDraft((current) => ({ ...current, colors: { ...preset.colors } }))
    setError('')
    setMessage(`Paleta ${preset.name} aplicada a la vista previa.`)
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validInstitutionSettings(draft)) {
      setError('Revisa los datos institucionales y los colores seleccionados.')
      return
    }
    const normalized: Settings = {
      ...draft,
      version: defaultSettings.version,
      name: draft.name.trim(),
      shortName: draft.shortName.trim(),
      tagline: draft.tagline.trim(),
      contactEmail: draft.contactEmail.trim(),
    }
    onSave(normalized)
    setDraft(normalized)
    setError('')
    setMessage('La apariencia quedó guardada en este navegador.')
  }

  function download() {
    const backup = { ...draft, version: defaultSettings.version }
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${draft.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'instituto'}-apariencia.json`
    link.click()
    URL.revokeObjectURL(url)
    setError('')
    setMessage('Respaldo descargado.')
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const imported = normalizeInstitutionSettings(JSON.parse(await file.text()))
      if (!imported) throw new Error('Invalid institution backup')
      setDraft(imported)
      setError('')
      setMessage('Respaldo cargado en la vista previa. Pulsa Guardar para aplicarlo.')
    } catch {
      setMessage('')
      setError('No pudimos leer ese respaldo. Selecciona un archivo generado desde esta pantalla.')
    }
  }

  function reset() {
    if (!window.confirm('¿Restaurar la apariencia predeterminada en este navegador?')) return
    onReset()
    setDraft(loadInstitutionSettings())
    setError('')
    setMessage('Apariencia predeterminada restaurada.')
  }

  return <section className="institution-settings">
    <div className="module-heading">
      <div><p className="date-label">ADMINISTRACIÓN DEL INSTITUTO</p><h1>Personalización visual</h1><p>Elige colores y datos con controles visuales. No necesitas editar código.</p></div>
    </div>
    <div className="institution-settings-layout">
      <form className="panel institution-form" onSubmit={save}>
        <div className="institution-form-section">
          <div className="institution-section-title"><div><h2>Datos del instituto</h2><p>Se muestran en el acceso y en las cabeceras de los portales.</p></div><GraduationCap size={22} /></div>
          <div className="institution-fields">
            <label className="institution-field institution-field-wide">Nombre del instituto<input value={draft.name} onChange={(event) => updateText('name', event.target.value)} required maxLength={90} /></label>
            <label className="institution-field">Nombre corto o siglas<input value={draft.shortName} onChange={(event) => updateText('shortName', event.target.value)} required maxLength={12} /></label>
            <label className="institution-field">Correo de contacto<input type="email" value={draft.contactEmail} onChange={(event) => updateText('contactEmail', event.target.value)} required /></label>
            <label className="institution-field institution-field-wide">Lema institucional<input value={draft.tagline} onChange={(event) => updateText('tagline', event.target.value)} required maxLength={140} /></label>
          </div>
        </div>

        <div className="institution-form-section">
          <div className="institution-section-title"><div><h2>Estilos listos para usar</h2><p>Empieza con una combinación profesional y personaliza cualquier color después.</p></div><Palette size={22} /></div>
          <div className="institution-presets">{presets.map((preset) => <button type="button" className="institution-preset" key={preset.name} onClick={() => choosePreset(preset)}><span>{(['primary', 'secondary', 'accent', 'sidebar'] as ColorKey[]).map((key) => <i key={key} style={{ background: preset.colors[key] }} />)}</span><strong>{preset.name}</strong><small>{preset.description}</small></button>)}</div>
        </div>

        {colorGroups.map((group) => <div className="institution-form-section" key={group.title}>
          <h2>{group.title}</h2><p>{group.description}</p>
          <div className="institution-colors">{group.fields.map((field) => <label className="institution-color" key={field.key}><span className="institution-color-text"><strong>{field.label}</strong><small>{field.help}</small></span><input type="color" aria-label={field.label} value={draft.colors[field.key]} onChange={(event) => updateColor(field.key, event.target.value)} /></label>)}</div>
        </div>)}

        <div className="institution-form-footer">
          <span role="status" className={error ? 'institution-error' : 'institution-message'}>{error || (message ? <><CheckCircle2 size={15} /> {message}</> : 'Los cambios se aplican al pulsar Guardar.')}</span>
          <div>
            <label className="institution-quiet-button institution-upload"><Upload size={15} /> Cargar respaldo<input type="file" accept="application/json,.json" onChange={upload} /></label>
            <button className="institution-quiet-button" type="button" onClick={download}><Download size={15} /> Descargar respaldo</button>
            <button className="institution-quiet-button" type="button" onClick={reset}><RotateCcw size={15} /> Restaurar</button>
            <button className="institution-save-button" type="submit"><Save size={16} /> Guardar cambios</button>
          </div>
        </div>
      </form>

      <aside className="institution-preview-column">
        <div className="panel institution-preview">
          <div className="institution-preview-heading"><strong>Vista previa en vivo</strong><span>Así se verán los portales</span></div>
          <div className="visual-preview" style={{ background: draft.colors.background, color: draft.colors.text }}>
            <div className="visual-preview-sidebar" style={{ background: draft.colors.sidebar, color: draft.colors.sidebarText }}><div style={{ background: draft.colors.primary }}><GraduationCap size={18} /></div><strong>{draft.shortName || defaultSettings.shortName}</strong><span /><span /><span /><small>Portal</small></div>
            <div className="visual-preview-main"><header style={{ background: draft.colors.surface, borderColor: draft.colors.border }}><span /><i style={{ background: draft.colors.accent }} /></header><main><small style={{ color: draft.colors.muted }}>BIENVENIDO A TU CAMPUS</small><h3>{draft.name || 'Nombre del instituto'}</h3><p style={{ color: draft.colors.muted }}>{draft.tagline || 'Tu lema institucional'}</p><div className="visual-preview-cards"><i style={{ background: draft.colors.surface, borderColor: draft.colors.border }} /><i style={{ background: draft.colors.surface, borderColor: draft.colors.border }} /></div><button type="button" style={{ background: draft.colors.primary, color: draft.colors.sidebarText }}>Acción principal</button></main></div>
          </div>
          <div className="institution-preview-swatches">{Object.entries(draft.colors).map(([key, color]) => <span key={key} title={key} style={{ background: color }} />)}</div>
        </div>
        <div className="institution-local-note"><strong>Demo sin servidor</strong><p>Todo se guarda únicamente en este navegador. Usa Descargar respaldo para llevar la misma apariencia a otra demostración.</p></div>
      </aside>
    </div>
  </section>
}
