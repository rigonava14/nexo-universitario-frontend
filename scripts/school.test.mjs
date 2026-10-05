import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptySchool, validSchool, enrollStudent, blockingReasons, applyMovement, effectiveStudentStatus, studentIsWithdrawn, validDate } from '../src/school.ts'
import { generateLocalSchedule, scheduleIssues, validateScheduleInput } from '../src/scheduling.ts'
import { validateAttachment } from '../src/document-store.ts'
import { createScheduleServer, proposeWithOpenAI } from '../server/index.mjs'

const school = () => ({ ...structuredClone(emptySchool), subjects: [{ id: 's1', code: 'MAT-1', name: 'Matemáticas', credits: 6, hours: 2, mandatory: true }], groups: [{ id: 'g1', code: 'ISC-1A', programId: 'p1', semester: 1, period: '2026-2', capacity: 1, studentIds: [] }] })
const input = () => ({ requests: [{ id: 'c1', groupId: 'g1', subjectId: 's1', teacherId: 't1', room: 'A-1', hours: 2 }, { id: 'c2', groupId: 'g2', subjectId: 's2', teacherId: 't1', room: 'A-2', hours: 2 }], availability: [{ id: 'a1', teacherId: 't1', day: 0, start: 8, end: 12 }], limits: [{ teacherId: 't1', maxHours: 4 }] })
test('group enrollment enforces career, capacity, duplicates, withdrawals and active blocks', () => {
  let data = school()
  assert.equal(validSchool(data), true)
  assert.throws(() => enrollStudent(data, 'g1', 'a1', 'wrong'), /carrera/)
  data = enrollStudent(data, 'g1', 'a1', 'p1')
  assert.deepEqual(data.groups[0].studentIds, ['a1'])
  assert.throws(() => enrollStudent(data, 'g1', 'a1', 'p1'), /ya pertenece/)
  assert.throws(() => enrollStudent(data, 'g1', 'a2', 'p1'), /cupo/)
  data = school()
  data.blocks.push({ id: 'b1', studentId: 'a1', area: 'Biblioteca', reason: 'Libro pendiente', scope: 'Inscripción', active: true, createdAt: '2026-10-05', releasedAt: '', releaseReason: '' })
  assert.throws(() => enrollStudent(data, 'g1', 'a1', 'p1'), /Biblioteca/)
  assert.equal(blockingReasons(data, 'a1', 'Documentos').length, 0)
  data.blocks[0].scope = 'Ambos'
  assert.equal(blockingReasons(data, 'a1', 'Documentos').length, 1)
  data.blocks[0].active = false; data.blocks[0].releaseReason = 'Libro devuelto'; data.blocks[0].releasedAt = '2026-10-06'
  assert.equal(enrollStudent(data, 'g1', 'a1', 'p1').groups[0].studentIds.length, 1)
})
test('movements preserve grades and history while updating current enrollment and career', () => {
  let data = enrollStudent(school(), 'g1', 'a1', 'p1')
  data.grades.push({ id: 'n1', studentId: 'a1', subjectId: 's1', period: '2026-1', grade: 85, origin: 'Revalidación', reference: 'Dictamen 001' })
  const movement = { id: 'm1', studentId: 'a1', type: 'Baja temporal', reason: 'Solicitud', date: '2026-10-05', end: '', programId: '', author: 'Control escolar' }
  data = applyMovement(data, movement)
  assert.equal(studentIsWithdrawn(data, 'a1'), true)
  assert.equal(data.groups[0].studentIds.length, 0)
  assert.equal(data.grades.length, 1)
  assert.throws(() => enrollStudent(data, 'g1', 'a1', 'p1'), /baja/)
  data = applyMovement(data, { ...movement, id: 'm2', type: 'Reingreso' })
  assert.equal(studentIsWithdrawn(data, 'a1'), false)
  assert.equal(effectiveStudentStatus(data, 'a1', 'Baja'), 'Activo')
  data = applyMovement(data, { ...movement, id: 'm3', type: 'Cambio de carrera', programId: 'p2' })
  assert.equal(data.careers[0].programId, 'p2')
  assert.equal(data.movements.length, 3)
  assert.equal(validSchool(data), true)
})
test('stored school schema protects relationships, duplicate grades and malformed records', () => {
  const data = school()
  assert.equal(validSchool(null), false)
  assert.equal(validSchool({}), false)
  assert.equal(validSchool({ ...data, subjects: [...data.subjects, { ...data.subjects[0], id: 's2' }] }), false)
  assert.equal(validSchool({ ...data, requests: [{ id: 'c1', groupId: 'missing', subjectId: 's1', teacherId: 't1', room: 'A1', hours: 4 }] }), false)
  const grade = { id: 'n1', studentId: 'a1', subjectId: 's1', period: '2026-1', grade: 90, origin: 'Revalidación', reference: '' }
  assert.equal(validSchool({ ...data, grades: [grade] }), false)
  grade.reference = 'Dictamen 12'
  assert.equal(validSchool({ ...data, grades: [grade, { ...grade, id: 'n2' }] }), false)
  assert.equal(validDate('2026-02-30'), false)
  assert.equal(validDate('2026-10-05'), true)
  assert.equal(validSchool({ ...data, schedules: [{ id: 'h1', period: '2026-2', source: 'Local', createdAt: '2026-10-05', requestSnapshot: [null], slots: [] }] }), false)
  assert.equal(validSchool({ ...data, schedules: [{ id: 'h1', period: '2026-2', source: 'Local', createdAt: '2026-10-05', requestSnapshot: [], slots: [{ requestId: 'missing', day: 0, hour: 8 }] }] }), false)
})
test('local schedule fully honors resources, teacher availability and maximum load', () => {
  const data = input()
  assert.equal(validateScheduleInput(data), true)
  const proposal = generateLocalSchedule(data)
  assert.equal(proposal.slots.length, 4)
  assert.deepEqual(scheduleIssues(data, proposal), [])
  assert.throws(() => generateLocalSchedule({ ...data, limits: [{ teacherId: 't1', maxHours: 3 }] }), /carga/)
  assert.throws(() => generateLocalSchedule({ ...data, availability: [] }), /No se encontró/)
  const collision = { slots: [{ requestId: 'c1', day: 0, hour: 8 }, { requestId: 'c1', day: 0, hour: 9 }, { requestId: 'c2', day: 0, hour: 8 }, { requestId: 'c2', day: 0, hour: 9 }], explanation: '' }
  assert.ok(scheduleIssues(data, collision).some((issue) => issue.includes('Cruce')))
  assert.ok(scheduleIssues(data, { slots: [] }).length)
  assert.ok(scheduleIssues(data, { slots: [{ requestId: 'invented', day: 0, hour: 8 }] }).length)
  assert.ok(scheduleIssues(data, { slots: [{ requestId: 'c1', day: 0, hour: 20 }] }).some((issue) => issue.includes('disponibilidad')))
})
test('uploads inspect file content and size instead of trusting the extension', async () => {
  await validateAttachment(new File(['%PDF-1.7\n'], 'test.pdf', { type: 'application/pdf' }))
  await assert.rejects(() => validateAttachment(new File(['<script>bad</script>'], 'fake.pdf', { type: 'application/pdf' })), /contenido|formato/)
  await assert.rejects(() => validateAttachment(new File([], 'empty.pdf')), /contenido/)
  await assert.rejects(() => validateAttachment(new File([new Uint8Array(11 * 1024 * 1024)], 'large.pdf')), /10 MB/)
})
test('OpenAI request uses server key and structured output, rejects conflicting or incomplete responses', async () => {
  const data = input()
  const expected = generateLocalSchedule(data)
  let payload
  const fakeFetch = async (url, options) => { assert.equal(url, 'https://api.openai.com/v1/responses'); payload = JSON.parse(options.body); assert.equal(options.headers.Authorization, 'Bearer test-only'); return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(expected) }] }] }) }
  assert.deepEqual(await proposeWithOpenAI(data, { key: 'test-only', model: 'test-model', fetchImpl: fakeFetch }), expected)
  assert.equal(payload.store, false)
  assert.equal(payload.text.format.strict, true)
  assert.equal(payload.input.includes('student'), false)
  await assert.rejects(() => proposeWithOpenAI(data, { key: 'test-only', model: 'test-model', fetchImpl: async () => Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: '{"slots":[]}' }] }] }) }), /conflictos/)
  await assert.rejects(() => proposeWithOpenAI(data, { key: 'test-only', model: 'test-model', fetchImpl: async () => Response.json({ status: 'incomplete', output: [] }) }), /completa/)
})
test('local backend denies untrusted origins, missing token and missing key without calling OpenAI', async () => {
  let called = false
  const server = createScheduleServer({ key: '', fetchImpl: async () => { called = true; throw new Error('should not call') } })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  try {
    const base = `http://127.0.0.1:${server.address().port}`
    const status = await fetch(`${base}/api/horarios/status`).then((response) => response.json())
    assert.equal(status.configured, false)
    const post = (origin, token) => fetch(`${base}/api/horarios/generar`, { method: 'POST', headers: { Origin: origin, 'X-CampusOne-Token': token, 'Content-Type': 'application/json' }, body: JSON.stringify(input()) })
    assert.equal((await post('https://untrusted.example', status.token)).status, 403)
    assert.equal((await post('http://127.0.0.1:5173', 'wrong')).status, 403)
    assert.equal((await post('http://127.0.0.1:5173', status.token)).status, 503)
    assert.equal(called, false)
  } finally { await new Promise((resolve) => server.close(resolve)) }
})
