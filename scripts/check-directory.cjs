const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const { stripTypeScriptTypes } = require('node:module')

const code = stripTypeScriptTypes(fs.readFileSync('src/directory.ts', 'utf8')).replace(/^export /gm, '') + '\nexports = { loadDirectory, directorySeeds, prepareDirectoryRecord, filterDirectory };'
let saved = null
let blocked = false
const context = { exports: {}, localStorage: { getItem: () => { if (blocked) throw new Error('Storage blocked'); return saved } } }
vm.runInNewContext(code, context)
const { loadDirectory, directorySeeds, prepareDirectoryRecord, filterDirectory } = context.exports
const records = directorySeeds.students
const draft = { ...records[0], id: 'new', number: ' NEW-001 ', email: ' NEW@EXAMPLE.COM ', name: ' Alumno nuevo ' }
assert.equal(loadDirectory('students').records.length, 4)
assert.equal(loadDirectory('teachers').records.length, 2)
assert.equal(prepareDirectoryRecord(draft, records, 'students').record.email, 'new@example.com')
assert.equal(prepareDirectoryRecord(draft, records, 'students').error, '')
assert.ok(prepareDirectoryRecord({ ...draft, number: records[0].number.toLowerCase() }, records, 'students').error)
assert.ok(prepareDirectoryRecord({ ...draft, email: records[0].email.toUpperCase() }, records, 'students').error)
assert.equal(prepareDirectoryRecord(records[0], records, 'students').error, '')
for (const change of [{ semester: 0 }, { semester: 21 }, { semester: 1.5 }, { email: 'invalid' }, { name: ' ' }, { area: '' }]) assert.ok(prepareDirectoryRecord({ ...draft, ...change }, records, 'students').error)
assert.ok(prepareDirectoryRecord(draft, [], 'teachers').error)
assert.equal(filterDirectory(records, 'martinez', '', '').length, 1)
assert.equal(filterDirectory(records, '', records[0].area, 'Activo').length, 1)
assert.equal(filterDirectory(records, '', '', 'Baja').length, 0)
saved = JSON.stringify([{ ...prepareDirectoryRecord(draft, records, 'students').record, name: 'Expediente persistido' }])
assert.equal(loadDirectory('students').records[0].name, 'Expediente persistido')
saved = '[]'
assert.equal(loadDirectory('students').records.length, 0)
for (const corrupt of ['invalid json', '{}', '[{}]', JSON.stringify([records[0], records[0]])]) {
  saved = corrupt
  assert.ok(loadDirectory('students').error)
  assert.equal(loadDirectory('students').records.length, 0)
  assert.equal(saved, corrupt)
}
blocked = true
assert.ok(loadDirectory('students').error)
console.log('Directory checks passed: validation, duplicates, filters, persisted data, empty directory and storage failures.')
