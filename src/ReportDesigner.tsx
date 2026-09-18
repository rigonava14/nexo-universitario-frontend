import { ChangeEvent, CSSProperties, useEffect, useRef, useState } from 'react'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Braces, Copy, Eye, FilePlus2, FileSpreadsheet, Heading1, ImagePlus, Italic, List, Minus, Printer, Redo2, RemoveFormatting, Table2, Trash2, Type, Underline, Undo2 } from 'lucide-react'
import { InstitutionSettings } from './institution'

type Reports = InstitutionSettings['reports']
type Template = Reports['templates'][number]
type Props = { reports: Reports; institutionName: string; onChange: (reports: Reports) => void }

const tokenGroups = {
  Aspirante: ['{{aspirante.nombre}}', '{{aspirante.folio}}', '{{aspirante.programa}}', '{{aspirante.curp}}', '{{aspirante.resultado}}'],
  Alumno: ['{{alumno.nombre}}', '{{alumno.matricula}}', '{{alumno.programa}}', '{{alumno.semestre}}'],
  Institución: ['{{institucion.nombre}}', '{{periodo.nombre}}', '{{fecha.actual}}', '{{usuario.nombre}}'],
}

const defaultTemplate = (institutionName: string, id = `format-${Date.now()}`): Template => ({
  id, name: 'Nuevo formato', documentType: 'General', pageSize: 'Carta', orientation: 'Vertical', fontFamily: 'Arial', fontSize: 11,
  textColor: '#211A27', accentColor: '#4C1D95', paperColor: '#FFFFFF', marginMm: 18, watermark: '', showPageBorder: false,
  header: institutionName, body: '<h1>Nuevo documento</h1><p>Comienza a escribir aquí.</p>', footer: 'Documento institucional',
})

export default function ReportDesigner({ reports, institutionName, onChange }: Props) {
  const [selectedId, setSelectedId] = useState(reports.templates[0]?.id ?? '')
  const [imageWidth, setImageWidth] = useState('50')
  const [notice, setNotice] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const dataInputRef = useRef<HTMLInputElement>(null)
  const selectedIndex = Math.max(0, reports.templates.findIndex((template) => template.id === selectedId))
  const template = reports.templates[selectedIndex]

  useEffect(() => {
    if (editorRef.current && template && editorRef.current.innerHTML !== template.body) editorRef.current.innerHTML = template.body
  }, [selectedId, template])

  if (!template) return null

  function update(patch: Partial<Template>) {
    onChange({ ...reports, templates: reports.templates.map((item, index) => index === selectedIndex ? { ...item, ...patch } : item) })
  }

  function syncBody() { update({ body: editorRef.current?.innerHTML ?? template.body }) }
  function command(name: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(name, false, value)
    syncBody()
  }
  function keepSelection(event: React.MouseEvent<HTMLButtonElement>) { event.preventDefault() }
  function insertHtml(html: string) { command('insertHTML', html) }
  function insertToken(token: string) { command('insertText', token) }

  function addTemplate() {
    const next = defaultTemplate(institutionName)
    onChange({ ...reports, templates: [...reports.templates, next] })
    setSelectedId(next.id)
  }
  function duplicateTemplate() {
    const copy = { ...template, id: `format-${Date.now()}`, name: `${template.name} (copia)` }
    onChange({ ...reports, templates: [...reports.templates, copy] })
    setSelectedId(copy.id)
  }
  function deleteTemplate() {
    if (reports.templates.length === 1) return
    const remaining = reports.templates.filter((item) => item.id !== template.id)
    onChange({ ...reports, templates: remaining })
    setSelectedId(remaining[0].id)
  }

  function importImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 1_500_000) { setNotice('Usa una imagen menor a 1.5 MB para no superar el almacenamiento local.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const source = String(reader.result)
      insertHtml(`<div class="report-image-block"><img src="${source}" alt="Imagen del documento" style="width:${imageWidth}%;max-width:100%;height:auto" /></div><p><br></p>`)
      setNotice('Imagen insertada y guardada dentro de la plantilla.')
    }
    reader.readAsDataURL(file)
  }

  function safe(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character) }
  function parseDelimitedLine(line: string, delimiter: string) {
    const values: string[] = []; let value = ''; let quoted = false
    for (let index = 0; index < line.length; index += 1) { const character = line[index]; if (character === '"') { if (quoted && line[index + 1] === '"') { value += '"'; index += 1 } else quoted = !quoted } else if (character === delimiter && !quoted) { values.push(value); value = '' } else value += character }
    values.push(value); return values
  }
  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (file.size > 500_000) { setNotice('Usa un archivo de datos menor a 500 KB.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let rows: unknown[][]
        if (file.name.toLowerCase().endsWith('.json')) {
          const parsed: unknown = JSON.parse(String(reader.result))
          const records = Array.isArray(parsed) ? parsed : [parsed]
          const objects = records.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
          const headers = Array.from(new Set(objects.flatMap((item) => Object.keys(item))))
          rows = [headers, ...objects.map((item) => headers.map((header) => item[header]))]
        } else {
          const text = String(reader.result).trim(); const delimiter = text.includes('\t') ? '\t' : ','
          rows = text.split(/\r?\n/).filter(Boolean).map((line) => parseDelimitedLine(line, delimiter))
        }
        if (!rows.length || !rows[0].length) throw new Error('empty')
        const [headers, ...body] = rows.slice(0, 51)
        const html = `<table class="report-content-table"><thead><tr>${headers.map((cell) => `<th>${safe(cell)}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${safe(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table><p><br></p>`
        insertHtml(html); setNotice(`${body.length} filas importadas desde ${file.name}.`)
      } catch { setNotice('No fue posible leer el archivo. Usa CSV, TSV o un JSON con objetos.') }
    }
    reader.readAsText(file)
  }

  const simpleTable = '<table class="report-content-table"><thead><tr><th>Encabezado 1</th><th>Encabezado 2</th><th>Encabezado 3</th></tr></thead><tbody><tr><td>Dato</td><td>Dato</td><td>Dato</td></tr><tr><td>Dato</td><td>Dato</td><td>Dato</td></tr></tbody></table><p><br></p>'
  const gradesTable = '<table class="report-content-table"><thead><tr><th>Asignatura</th><th>Calificación</th><th>Resultado</th></tr></thead><tbody><tr><td>{{materia.nombre}}</td><td>{{materia.calificacion}}</td><td>{{materia.resultado}}</td></tr></tbody></table><p><small>Esta fila se repetirá con los datos de la API.</small></p>'
  const canvasStyle = { '--report-accent': template.accentColor, backgroundColor: template.paperColor, color: template.textColor, fontFamily: template.fontFamily, fontSize: `${template.fontSize}px`, padding: `${template.marginMm}mm`, border: template.showPageBorder ? `1px solid ${template.accentColor}` : undefined } as CSSProperties

  return <div className="report-designer report-designer--advanced">
    <aside className="report-template-list"><div><strong>Formatos institucionales</strong><small>Plantillas guardadas localmente</small></div>{reports.templates.map((item) => <button type="button" className={item.id === selectedId ? 'active' : ''} key={item.id} onClick={() => setSelectedId(item.id)}><span><Type size={16} /></span><div><strong>{item.name}</strong><small>{item.documentType}</small></div></button>)}<button type="button" className="new-template" onClick={addTemplate}><FilePlus2 size={17} /> Crear formato</button><div className="template-actions"><button type="button" onClick={duplicateTemplate}><Copy size={14} /> Duplicar</button><button type="button" disabled={reports.templates.length === 1} onClick={deleteTemplate}><Trash2 size={14} /> Eliminar</button></div></aside>

    <section className="report-workspace">
      <div className="report-properties"><label>Nombre<input value={template.name} onChange={(event) => update({ name: event.target.value })} /></label><label>Uso<select value={template.documentType} onChange={(event) => update({ documentType: event.target.value })}><option>Admisiones</option><option>Control escolar</option><option>Alumnos</option><option>Docentes</option><option>Finanzas</option><option>General</option></select></label><label>Tamaño<select value={template.pageSize} onChange={(event) => update({ pageSize: event.target.value })}><option>Carta</option><option>A4</option><option>Oficio</option></select></label><label>Orientación<select value={template.orientation} onChange={(event) => update({ orientation: event.target.value })}><option>Vertical</option><option>Horizontal</option></select></label></div>

      <div className="report-style-settings">
        <label>Fuente<select value={template.fontFamily} onChange={(event) => update({ fontFamily: event.target.value })}><option>Arial</option><option>Georgia</option><option>Manrope</option><option>Times New Roman</option><option>Verdana</option></select></label>
        <label>Tamaño base<input type="number" min="8" max="24" value={template.fontSize} onChange={(event) => update({ fontSize: Number(event.target.value) })} /></label>
        <label>Texto<input type="color" value={template.textColor} onChange={(event) => update({ textColor: event.target.value })} /></label>
        <label>Acento<input type="color" value={template.accentColor} onChange={(event) => update({ accentColor: event.target.value })} /></label>
        <label>Papel<input type="color" value={template.paperColor} onChange={(event) => update({ paperColor: event.target.value })} /></label>
        <label>Margen<input type="number" min="8" max="35" value={template.marginMm} onChange={(event) => update({ marginMm: Number(event.target.value) })} /><small>mm</small></label>
        <label className="watermark-field">Marca de agua<input value={template.watermark} onChange={(event) => update({ watermark: event.target.value })} placeholder="Ej. BORRADOR" /></label>
        <label className="report-check"><input type="checkbox" checked={template.showPageBorder} onChange={(event) => update({ showPageBorder: event.target.checked })} /> Borde</label>
      </div>

      <div className="document-toolbar">
        <button type="button" title="Deshacer" onMouseDown={keepSelection} onClick={() => command('undo')}><Undo2 size={16} /></button><button type="button" title="Rehacer" onMouseDown={keepSelection} onClick={() => command('redo')}><Redo2 size={16} /></button>
        <i />
        <button type="button" title="Título" onMouseDown={keepSelection} onClick={() => command('formatBlock', 'h1')}><Heading1 size={17} /></button><button type="button" title="Negritas" onMouseDown={keepSelection} onClick={() => command('bold')}><Bold size={17} /></button><button type="button" title="Cursiva" onMouseDown={keepSelection} onClick={() => command('italic')}><Italic size={17} /></button><button type="button" title="Subrayar" onMouseDown={keepSelection} onClick={() => command('underline')}><Underline size={17} /></button><button type="button" title="Limpiar formato" onMouseDown={keepSelection} onClick={() => command('removeFormat')}><RemoveFormatting size={17} /></button>
        <i />
        <button type="button" title="Alinear a la izquierda" onMouseDown={keepSelection} onClick={() => command('justifyLeft')}><AlignLeft size={17} /></button><button type="button" title="Centrar" onMouseDown={keepSelection} onClick={() => command('justifyCenter')}><AlignCenter size={17} /></button><button type="button" title="Alinear a la derecha" onMouseDown={keepSelection} onClick={() => command('justifyRight')}><AlignRight size={17} /></button><button type="button" title="Justificar" onMouseDown={keepSelection} onClick={() => command('justifyFull')}><AlignJustify size={17} /></button><button type="button" title="Lista" onMouseDown={keepSelection} onClick={() => command('insertUnorderedList')}><List size={17} /></button>
        <span /><button type="button" className="print-report" onClick={() => window.print()}><Printer size={16} /> Generar PDF</button>
      </div>

      <div className="report-blocks"><span>INSERTAR</span><button type="button" onMouseDown={keepSelection} onClick={() => imageInputRef.current?.click()}><ImagePlus size={15} /> Imagen</button><label>Ancho<select value={imageWidth} onChange={(event) => setImageWidth(event.target.value)}><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="100">100%</option></select></label><button type="button" onMouseDown={keepSelection} onClick={() => insertHtml(simpleTable)}><Table2 size={15} /> Tabla</button><button type="button" onMouseDown={keepSelection} onClick={() => insertHtml(gradesTable)}><Table2 size={15} /> Tabla de API</button><button type="button" onMouseDown={keepSelection} onClick={() => dataInputRef.current?.click()}><FileSpreadsheet size={15} /> Importar datos</button><button type="button" onMouseDown={keepSelection} onClick={() => insertHtml('<div class="report-signatures"><span>Nombre y firma</span><span>Sello institucional</span></div><p><br></p>')}><Type size={15} /> Firmas</button><button type="button" onMouseDown={keepSelection} onClick={() => insertHtml('<hr><p><br></p>')}><Minus size={15} /> Separador</button><input ref={imageInputRef} className="report-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={importImage} /><input ref={dataInputRef} className="report-image-input" type="file" accept=".csv,.tsv,.json,text/csv,text/tab-separated-values,application/json" onChange={importData} /></div>

      <div className="token-strip"><span><Braces size={15} /> CAMPOS DINÁMICOS</span>{Object.entries(tokenGroups).map(([group, tokens]) => <div className="token-group" key={group}><small>{group}</small>{tokens.map((token) => <button type="button" key={token} onMouseDown={keepSelection} onClick={() => insertToken(token)}>{token.replaceAll('{', '').replaceAll('}', '')}</button>)}</div>)}</div>
      {notice && <div className="report-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>×</button></div>}

      <div className="document-canvas-wrap"><article className={`document-canvas page-${template.pageSize.toLowerCase()} ${template.orientation === 'Horizontal' ? 'landscape' : ''}`} id="report-print-area" style={canvasStyle}>{template.watermark && <div className="document-watermark">{template.watermark}</div>}<input className="document-header" value={template.header} onChange={(event) => update({ header: event.target.value })} /><div ref={editorRef} className="document-editor" contentEditable suppressContentEditableWarning onBlur={syncBody} /><input className="document-footer" value={template.footer} onChange={(event) => update({ footer: event.target.value })} /></article></div>
    </section>

    <aside className="report-help"><div><Eye size={18} /><strong>Editor visual</strong><p>Haz clic en la hoja, selecciona texto y aplica formato. Las imágenes se guardan dentro de la plantilla.</p></div><div><Table2 size={18} /><strong>Tablas conectables</strong><p>Usa Tabla de datos para preparar filas que después repetirá una API.</p></div><div><Braces size={18} /><strong>Datos dinámicos</strong><p>Los campos entre llaves serán sustituidos con información real.</p></div><div className="api-ready"><span>ALMACENAMIENTO LOCAL</span><p>Las imágenes grandes pueden superar el límite del navegador. En producción deben almacenarse en archivos o una API.</p></div></aside>
  </div>
}
