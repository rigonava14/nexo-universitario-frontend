import { useMemo, useState } from 'react'
import { BadgePercent, Banknote, CheckCircle2, CircleDollarSign, Download, FileText, Landmark, Plus, ReceiptText, Save, Search, Settings2, Users, WalletCards, X } from 'lucide-react'
import { InstitutionSettings } from './institution'

type Props = { settings: InstitutionSettings; onSave: (settings: InstitutionSettings) => void }
type FinanceTab = 'summary' | 'collections' | 'concepts' | 'receipts' | 'scholarships' | 'payroll'
type Charge = InstitutionSettings['finance']['charges'][number]
type Concept = InstitutionSettings['finance']['concepts'][number]

const money = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)
const tabs: Array<{ id: FinanceTab; label: string }> = [
  { id: 'summary', label: 'Resumen' }, { id: 'collections', label: 'Cobranza' }, { id: 'concepts', label: 'Conceptos' },
  { id: 'receipts', label: 'Recibos y facturas' }, { id: 'scholarships', label: 'Becas aplicadas' }, { id: 'payroll', label: 'Nómina' },
]

export default function Finance({ settings, onSave }: Props) {
  const [draft, setDraft] = useState(settings)
  const [tab, setTab] = useState<FinanceTab>('summary')
  const [query, setQuery] = useState('')
  const [chargeStatus, setChargeStatus] = useState('Todos')
  const [paymentCharge, setPaymentCharge] = useState<Charge | null>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState(draft.finance.paymentMethods[0] ?? 'Efectivo')
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null)
  const [notice, setNotice] = useState('')

  const finance = draft.finance
  const totalBilled = finance.charges.reduce((sum, item) => sum + item.amount, 0)
  const totalCollected = finance.charges.reduce((sum, item) => sum + item.paid, 0)
  const outstanding = totalBilled - totalCollected
  const payrollNet = finance.payroll.reduce((sum, item) => sum + item.gross - item.deductions, 0)
  const filteredCharges = useMemo(() => finance.charges.filter((charge) => {
    const matches = `${charge.studentName} ${charge.studentId} ${charge.concept}`.toLowerCase().includes(query.toLowerCase())
    return matches && (chargeStatus === 'Todos' || charge.status === chargeStatus)
  }), [finance.charges, query, chargeStatus])

  function updateFinance(patch: Partial<InstitutionSettings['finance']>) {
    setDraft((current) => ({ ...current, finance: { ...current.finance, ...patch } }))
    setNotice('')
  }

  function save() { onSave(draft); setNotice('Configuración financiera guardada en este navegador.') }

  function openPayment(charge: Charge) {
    setPaymentCharge(charge)
    setPaymentAmount(Math.max(0, charge.amount - charge.paid))
  }

  function registerPayment() {
    if (!paymentCharge || paymentAmount <= 0) return
    const newPaid = Math.min(paymentCharge.amount, paymentCharge.paid + paymentAmount)
    const newStatus = newPaid >= paymentCharge.amount ? 'Pagado' : 'Parcial'
    const receipt = { id: `REC-${String(1850 + finance.receipts.length).padStart(6, '0')}`, date: new Date().toISOString().slice(0, 10), studentName: paymentCharge.studentName, concept: paymentCharge.concept, method: paymentMethod, amount: paymentAmount, status: 'Emitido' }
    updateFinance({
      charges: finance.charges.map((item) => item.id === paymentCharge.id ? { ...item, paid: newPaid, status: newStatus } : item),
      receipts: [receipt, ...finance.receipts],
    })
    setPaymentCharge(null)
    setNotice(`Pago aplicado y recibo ${receipt.id} generado.`)
  }

  function newConcept() {
    setEditingConcept({ id: `concept-${Date.now()}`, code: 'NUEVO', name: 'Nuevo concepto', category: 'Servicios', amount: 0, taxable: false, active: true })
  }

  function persistConcept() {
    if (!editingConcept) return
    const exists = finance.concepts.some((item) => item.id === editingConcept.id)
    updateFinance({ concepts: exists ? finance.concepts.map((item) => item.id === editingConcept.id ? editingConcept : item) : [editingConcept, ...finance.concepts] })
    setEditingConcept(null)
    setNotice('Concepto actualizado. Guarda los cambios para conservarlo.')
  }

  function processPayroll() {
    updateFinance({ payroll: finance.payroll.map((item) => ({ ...item, status: 'Timbrado' })) })
    setNotice('Nómina calculada y marcada como timbrada para la demostración.')
  }

  return <section className="finance-module">
    <div className="module-heading finance-heading"><div><p className="date-label">ADMINISTRACIÓN FINANCIERA</p><h1>Finanzas</h1><p>Controla ingresos, cobranza, comprobantes, apoyos y nómina desde un solo lugar.</p></div><button className="primary-button compact" type="button" onClick={() => { setTab('collections'); const pending = finance.charges.find((item) => item.status !== 'Pagado'); if (pending) openPayment(pending) }}><Plus size={17} /> Registrar pago</button></div>

    <nav className="finance-tabs" aria-label="Secciones de finanzas">{tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => { setTab(item.id); setQuery('') }}>{item.label}</button>)}</nav>

    {tab === 'summary' && <>
      <div className="finance-kpis">
        <article><span className="violet"><CircleDollarSign size={20} /></span><div><small>Cobrado en el periodo</small><strong>{money(totalCollected)}</strong><em>{Math.round(totalCollected / totalBilled * 100)}% de recuperación</em></div></article>
        <article><span className="coral"><WalletCards size={20} /></span><div><small>Cartera pendiente</small><strong>{money(outstanding)}</strong><em>{finance.charges.filter((item) => item.status !== 'Pagado').length} cuentas abiertas</em></div></article>
        <article><span className="green"><ReceiptText size={20} /></span><div><small>Recibos emitidos</small><strong>{finance.receipts.length}</strong><em>{finance.receipts.filter((item) => item.status === 'Facturado').length} con factura</em></div></article>
        <article><span className="amber"><Users size={20} /></span><div><small>Nómina neta</small><strong>{money(payrollNet)}</strong><em>{finance.payroll.length} colaboradores</em></div></article>
      </div>
      <div className="finance-dashboard-grid">
        <article className="finance-panel collection-health"><div className="finance-panel-head"><div><h2>Salud de la cobranza</h2><p>Distribución de la cartera del periodo actual</p></div><button type="button" onClick={() => setTab('collections')}>Ver cobranza</button></div>
          <div className="collection-ring" style={{ '--progress': `${Math.round(totalCollected / totalBilled * 100)}%` } as React.CSSProperties}><div><strong>{Math.round(totalCollected / totalBilled * 100)}%</strong><span>recuperado</span></div></div>
          <div className="collection-legend"><div><i className="paid" /><span>Pagado</span><strong>{money(totalCollected)}</strong></div><div><i className="partial" /><span>Por cobrar</span><strong>{money(outstanding)}</strong></div><div><i className="overdue" /><span>Vencido</span><strong>{money(finance.charges.filter((item) => item.status === 'Vencido').reduce((sum, item) => sum + item.amount - item.paid, 0))}</strong></div></div>
        </article>
        <article className="finance-panel"><div className="finance-panel-head"><div><h2>Últimos movimientos</h2><p>Pagos y comprobantes recientes</p></div><button type="button" onClick={() => setTab('receipts')}>Ver todos</button></div><div className="finance-activity">{finance.receipts.slice(0, 4).map((receipt) => <div key={receipt.id}><span><ReceiptText size={17} /></span><p><strong>{receipt.studentName}</strong><small>{receipt.concept} · {receipt.method}</small></p><b>{money(receipt.amount)}</b></div>)}</div></article>
        <article className="finance-panel finance-alerts"><div className="finance-panel-head"><div><h2>Atención requerida</h2><p>Operaciones que necesitan seguimiento</p></div></div><button type="button" onClick={() => { setTab('collections'); setChargeStatus('Vencido') }}><span className="danger"><Banknote size={18} /></span><div><strong>Cargos vencidos</strong><small>Contactar y generar acuerdos de pago</small></div><b>{finance.charges.filter((item) => item.status === 'Vencido').length}</b></button><button type="button" onClick={() => setTab('scholarships')}><span className="warning"><BadgePercent size={18} /></span><div><strong>Becas por renovar</strong><small>Validar vigencia y documentación</small></div><b>{finance.scholarships.filter((item) => item.status === 'Por renovar').length}</b></button></article>
      </div>
    </>}

    {tab === 'collections' && <article className="finance-panel finance-table-panel"><div className="finance-panel-head"><div><h2>Cuentas por cobrar</h2><p>Cargos, vencimientos, abonos y saldos del alumnado.</p></div><button className="finance-secondary" type="button"><Download size={15} /> Exportar</button></div><div className="finance-toolbar"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar alumno, matrícula o concepto" /></label><select value={chargeStatus} onChange={(event) => setChargeStatus(event.target.value)}><option>Todos</option><option>Pagado</option><option>Parcial</option><option>Vencido</option><option>Pendiente</option></select></div><div className="finance-table-wrap"><table><thead><tr><th>Alumno</th><th>Concepto</th><th>Vencimiento</th><th>Cargo</th><th>Pagado</th><th>Saldo</th><th>Estatus</th><th /></tr></thead><tbody>{filteredCharges.map((charge) => <tr key={charge.id}><td><strong>{charge.studentName}</strong><small>{charge.studentId}</small></td><td>{charge.concept}</td><td>{charge.dueDate}</td><td>{money(charge.amount)}</td><td>{money(charge.paid)}</td><td><b>{money(charge.amount - charge.paid)}</b></td><td><span className={`finance-status ${charge.status.toLowerCase()}`}>{charge.status}</span></td><td><button type="button" disabled={charge.status === 'Pagado'} onClick={() => openPayment(charge)}>Cobrar</button></td></tr>)}</tbody></table></div></article>}

    {tab === 'concepts' && <div className="finance-config-grid"><article className="finance-panel finance-table-panel"><div className="finance-panel-head"><div><h2>Catálogo de conceptos</h2><p>Define los cargos disponibles para alumnos y aspirantes.</p></div><button className="finance-secondary" type="button" onClick={newConcept}><Plus size={15} /> Nuevo concepto</button></div><div className="concept-list">{finance.concepts.map((concept) => <button type="button" key={concept.id} onClick={() => setEditingConcept({ ...concept })}><span><strong>{concept.name}</strong><small>{concept.code} · {concept.category}</small></span><b>{money(concept.amount)}</b><i className={concept.active ? 'on' : ''}>{concept.active ? 'Activo' : 'Inactivo'}</i></button>)}</div></article><article className="finance-panel fiscal-settings"><div className="finance-panel-head"><div><h2>Datos fiscales y cobro</h2><p>Información usada en recibos y comprobantes.</p></div><Settings2 size={19} /></div><label>Razón social<input value={finance.fiscalName} onChange={(event) => updateFinance({ fiscalName: event.target.value })} /></label><div><label>RFC<input value={finance.rfc} onChange={(event) => updateFinance({ rfc: event.target.value.toUpperCase() })} /></label><label>Moneda<select value={finance.currency} onChange={(event) => updateFinance({ currency: event.target.value })}><option>MXN</option><option>USD</option></select></label></div><h3>Métodos de pago aceptados</h3><div className="payment-methods">{finance.paymentMethods.map((method) => <span key={method}><CheckCircle2 size={14} /> {method}</span>)}</div></article></div>}

    {tab === 'receipts' && <article className="finance-panel finance-table-panel"><div className="finance-panel-head"><div><h2>Recibos y facturación</h2><p>Historial de comprobantes; listo para conectar timbrado fiscal.</p></div><button className="finance-secondary" type="button"><Plus size={15} /> Solicitud de factura</button></div><div className="receipt-cards">{finance.receipts.map((receipt) => <article key={receipt.id}><header><span><FileText size={18} /></span><i className={receipt.status === 'Facturado' ? 'invoiced' : ''}>{receipt.status}</i></header><strong>{receipt.id}</strong><p>{receipt.studentName}</p><small>{receipt.concept}</small><footer><div><b>{money(receipt.amount)}</b><span>{receipt.date} · {receipt.method}</span></div><button type="button" title="Descargar comprobante"><Download size={16} /></button></footer></article>)}</div></article>}

    {tab === 'scholarships' && <article className="finance-panel finance-table-panel"><div className="finance-panel-head"><div><h2>Becas aplicadas</h2><p>Beneficios asignados desde el módulo de Becas y reflejados en la cuenta del alumno.</p></div></div><div className="finance-table-wrap"><table><thead><tr><th>Alumno</th><th>Apoyo</th><th>Descuento</th><th>Vigencia</th><th>Estatus</th></tr></thead><tbody>{finance.scholarships.map((item) => <tr key={item.id}><td><strong>{item.studentName}</strong><small>{item.studentId}</small></td><td>{item.name}</td><td><b>{item.discount}%</b></td><td>{item.validUntil}</td><td><span className={`finance-status ${item.status === 'Activa' ? 'pagado' : 'parcial'}`}>{item.status}</span></td></tr>)}</tbody></table></div></article>}

    {tab === 'payroll' && <><div className="payroll-strip"><div><span><Landmark size={20} /></span><p><small>Periodo de nómina</small><strong>1–15 septiembre 2026</strong></p></div><div><small>Percepciones</small><strong>{money(finance.payroll.reduce((sum, item) => sum + item.gross, 0))}</strong></div><div><small>Deducciones</small><strong>{money(finance.payroll.reduce((sum, item) => sum + item.deductions, 0))}</strong></div><div><small>Neto a dispersar</small><strong>{money(payrollNet)}</strong></div><button type="button" onClick={processPayroll}>Procesar nómina</button></div><article className="finance-panel finance-table-panel"><div className="finance-panel-head"><div><h2>Personal y percepciones</h2><p>Vista previa del cálculo antes de timbrar y dispersar.</p></div><button className="finance-secondary" type="button"><Download size={15} /> Dispersión bancaria</button></div><div className="finance-table-wrap"><table><thead><tr><th>Colaborador</th><th>Área / puesto</th><th>Percepciones</th><th>Deducciones</th><th>Neto</th><th>Estatus</th></tr></thead><tbody>{finance.payroll.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.employeeId}</small></td><td>{item.area}<small>{item.position}</small></td><td>{money(item.gross)}</td><td>{money(item.deductions)}</td><td><b>{money(item.gross - item.deductions)}</b></td><td><span className={`finance-status ${item.status === 'Timbrado' ? 'pagado' : 'parcial'}`}>{item.status}</span></td></tr>)}</tbody></table></div></article></>}

    <footer className="finance-savebar"><span role="status">{notice || 'Los cambios se guardan como configuración local de esta institución.'}</span><button type="button" onClick={save}><Save size={17} /> Guardar finanzas</button></footer>

    {paymentCharge && <div className="finance-modal-layer" role="dialog" aria-modal="true"><button className="finance-modal-backdrop" aria-label="Cerrar cobro" onClick={() => setPaymentCharge(null)} /><form className="finance-modal" onSubmit={(event) => { event.preventDefault(); registerPayment() }}><header><div><span>REGISTRAR PAGO</span><h2>{paymentCharge.studentName}</h2><p>{paymentCharge.studentId} · {paymentCharge.concept}</p></div><button type="button" aria-label="Cerrar" onClick={() => setPaymentCharge(null)}><X size={20} /></button></header><div className="payment-balance"><span>Saldo pendiente</span><strong>{money(paymentCharge.amount - paymentCharge.paid)}</strong></div><label>Importe a aplicar<input type="number" min="1" max={paymentCharge.amount - paymentCharge.paid} value={paymentAmount} onChange={(event) => setPaymentAmount(Number(event.target.value))} /></label><label>Método de pago<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>{finance.paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label><label>Referencia<input placeholder="Folio bancario o nota de caja" /></label><div className="modal-note"><ReceiptText size={17} /><span>Al confirmar se generará un recibo institucional.</span></div><footer><button type="button" onClick={() => setPaymentCharge(null)}>Cancelar</button><button type="submit">Aplicar pago</button></footer></form></div>}

    {editingConcept && <div className="finance-modal-layer" role="dialog" aria-modal="true"><button className="finance-modal-backdrop" aria-label="Cerrar concepto" onClick={() => setEditingConcept(null)} /><form className="finance-modal" onSubmit={(event) => { event.preventDefault(); persistConcept() }}><header><div><span>CATÁLOGO FINANCIERO</span><h2>Configurar concepto</h2><p>Define cómo aparecerá en cargos y recibos.</p></div><button type="button" aria-label="Cerrar" onClick={() => setEditingConcept(null)}><X size={20} /></button></header><label>Nombre<input value={editingConcept.name} onChange={(event) => setEditingConcept({ ...editingConcept, name: event.target.value })} /></label><div className="modal-fields"><label>Clave<input value={editingConcept.code} onChange={(event) => setEditingConcept({ ...editingConcept, code: event.target.value.toUpperCase() })} /></label><label>Categoría<select value={editingConcept.category} onChange={(event) => setEditingConcept({ ...editingConcept, category: event.target.value })}><option>Colegiatura</option><option>Inscripción</option><option>Servicios</option><option>Recargos</option><option>Titulación</option></select></label></div><label>Importe base<input type="number" min="0" value={editingConcept.amount} onChange={(event) => setEditingConcept({ ...editingConcept, amount: Number(event.target.value) })} /></label><div className="concept-checks"><label><input type="checkbox" checked={editingConcept.taxable} onChange={(event) => setEditingConcept({ ...editingConcept, taxable: event.target.checked })} /> Causa impuesto</label><label><input type="checkbox" checked={editingConcept.active} onChange={(event) => setEditingConcept({ ...editingConcept, active: event.target.checked })} /> Disponible para cobro</label></div><footer><button type="button" onClick={() => setEditingConcept(null)}>Cancelar</button><button type="submit">Guardar concepto</button></footer></form></div>}
  </section>
}
