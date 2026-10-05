const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { stripTypeScriptTypes } = require('node:module')
const source = fs.readFileSync('src/operations.ts', 'utf8')
const code = stripTypeScriptTypes(source).replace(/^export /gm, '') + '\nexports = { validOperations, defaultOperations, loadOperations, saveOperations, residencyError, graduationError, graduationRequirements, englishResult, csvText };'
let saved = null
let readBlocked = false
let writeBlocked = false
const context = { exports: {}, structuredClone, URL, localStorage: { getItem: () => { if (readBlocked) throw new Error('blocked'); return saved }, setItem: (_, value) => { if (writeBlocked) throw new Error('blocked'); saved = value } } }
vm.runInNewContext(code, context)
const api = context.exports
const data = structuredClone(api.defaultOperations)
assert.equal(api.validOperations(data), true)
assert.equal(api.loadOperations().error, '')
const residence = { id: 'r1', studentId: 's1', teacherId: 't1', project: 'Proyecto', company: 'Empresa', start: '2026-10-05', end: '2027-03-05', hours: 499, status: 'En proceso', evidence: '', notes: '' }
assert.equal(api.residencyError(residence, data.settings, []), '')
assert.ok(api.residencyError({ ...residence, status: 'Concluida' }, data.settings, []))
assert.ok(api.residencyError({ ...residence, hours: 500, status: 'Concluida' }, data.settings, []))
assert.equal(api.residencyError({ ...residence, hours: 500, status: 'Concluida', evidence: 'https://example.com/report' }, data.settings, []), '')
assert.ok(api.residencyError({ ...residence, id: 'r2' }, data.settings, [residence]))
assert.equal(api.residencyError(residence, data.settings, [residence]), '')
assert.ok(api.residencyError({ ...residence, end: '2026-01-01' }, data.settings, []))
data.residencies.push(residence)
assert.equal(api.validOperations(data), true)
for (const changes of [{ evidence: 'javascript:alert(1)' }, { evidence: 'file:///tmp/test' }, { start: '2026-02-30' }, { hours: -1 }, { hours: 1.5 }, { status: 'inventado' }]) assert.equal(api.validOperations({ ...data, residencies: [{ ...residence, ...changes }] }), false)
const graduation = { id: 'g1', studentId: 's1', advisorId: 't1', modality: 'Tesis', title: 'Trabajo', date: '', status: 'En revisión', requirements: [], notes: '' }
assert.ok(api.graduationError({ ...graduation, status: 'Lista para examen' }, []))
assert.ok(api.graduationError({ ...graduation, status: 'Titulada', requirements: [...api.graduationRequirements] }, []))
assert.equal(api.graduationError({ ...graduation, status: 'Titulada', requirements: [...api.graduationRequirements], date: '2026-11-05' }, []), '')
assert.ok(api.graduationError({ ...graduation, id: 'g2' }, [graduation]))
data.graduations.push(graduation)
data.academies.push({ id: 'a1', name: 'Sistemas', area: 'Tecnología', coordinatorId: 't1', memberIds: ['t1'], status: 'Activa', agreements: 'Acuerdo' })
assert.equal(api.validOperations(data), true)
assert.equal(api.validOperations({ ...data, academies: [{ ...data.academies[0], memberIds: ['t2'] }] }), false)
const group = { id: 'e1', code: 'A1-A', level: 'A1', teacherId: 't1', period: '2026-2', schedule: 'Lunes 16:00', room: 'A-1', capacity: 1, status: 'Abierto' }
const enrollment = { id: 'i1', groupId: 'e1', studentId: 's1', grade: null, attendance: 80, status: 'Inscrito' }
data.englishGroups.push(group)
data.englishEnrollments.push(enrollment)
assert.equal(api.validOperations(data), true)
assert.equal(api.englishResult(enrollment, data.settings), 'Sin evaluar')
assert.equal(api.englishResult({ ...enrollment, grade: 70 }, data.settings), 'Acreditado')
assert.equal(api.englishResult({ ...enrollment, grade: 69.9 }, data.settings), 'No acreditado')
assert.equal(api.englishResult({ ...enrollment, grade: 90, attendance: 79.9 }, data.settings), 'No acreditado')
assert.equal(api.englishResult({ ...enrollment, grade: 90, status: 'Baja' }, data.settings), 'Baja')
assert.equal(api.englishResult({ ...enrollment, grade: 80 }, { ...data.settings, englishPassingGrade: 90 }), 'No acreditado')
assert.equal(api.validOperations({ ...data, englishEnrollments: [enrollment, { ...enrollment, id: 'i2' }] }), false)
assert.equal(api.validOperations({ ...data, englishEnrollments: [enrollment, { ...enrollment, id: 'i2', studentId: 's2' }] }), false)
assert.equal(api.validOperations({ ...data, englishEnrollments: [enrollment, { ...enrollment, id: 'i2', studentId: 's2', status: 'Baja' }] }), true)
assert.equal(api.validOperations({ ...data, englishEnrollments: [{ ...enrollment, groupId: 'missing' }] }), false)
assert.equal(api.validOperations({ ...data, englishGroups: [group, { ...group, id: 'e2', code: group.code.toLowerCase() }] }), false)
for (const changes of [{ grade: 101 }, { grade: -1 }, { grade: NaN }, { attendance: 101 }]) assert.equal(api.validOperations({ ...data, englishEnrollments: [{ ...enrollment, ...changes }] }), false)
assert.equal(api.validOperations({ ...data, settings: { ...data.settings, englishPassingGrade: 101 } }), false)
assert.equal(api.validOperations({ ...data, settings: { ...data.settings, graduationModalities: [] } }), false)
assert.equal(api.saveOperations(data), '')
assert.equal(api.loadOperations().data.residencies[0].project, 'Proyecto')
const previous = saved
assert.ok(api.saveOperations({ ...data, englishGroups: [] }))
assert.equal(saved, previous)
writeBlocked = true
assert.ok(api.saveOperations(data))
assert.equal(saved, previous)
writeBlocked = false
for (const corrupt of ['invalid', '{}', 'null', JSON.stringify({ ...data, academies: [{}] })]) {
  saved = corrupt
  assert.ok(api.loadOperations().error)
  assert.equal(saved, corrupt)
}
readBlocked = true
assert.ok(api.loadOperations().error)
const csv = api.csvText(['Nombre', 'Notas'], [['Ana, López', 'Texto "citado"\nOtra línea'], ['=SUM(A1)', '@command']])
assert.ok(csv.startsWith('\uFEFF'))
assert.ok(csv.includes('"Ana, López"'))
assert.ok(csv.includes('"Texto ""citado""\nOtra línea"'))
assert.ok(csv.includes('"\'=SUM(A1)"'))
assert.ok(csv.includes('"\'@command"'))
const routes = fs.readFileSync('src/access-control.ts', 'utf8')
for (const route of ['residencias', 'titulacion', 'academias', 'ingles', 'reportes', 'configuracion']) assert.ok(routes.includes(`/admin/${route}`))
console.log('Operations checks passed: process completion, valid dates, academy membership, group capacity, duplicate enrollment, accreditation thresholds, persistence, protected storage failures, CSV escaping and module routes.')
