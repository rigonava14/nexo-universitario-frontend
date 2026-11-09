const assert = require('node:assert/strict')
const { loadTsModule } = require('./ts-module.cjs')

const { migrateLegacyKey } = loadTsModule(['src/services/local/migrate.ts'], ['migrateLegacyKey'], {})

function memoryStorage(initial = {}, { failWrites = false } = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      if (failWrites) throw new Error('blocked')
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

// Copia el valor anterior a la clave nueva y borra la anterior.
let storage = memoryStorage({ 'nexo-applicants': '[1]' })
migrateLegacyKey(storage, 'nexo-applicants', 'campusone-applicants-v1')
assert.deepEqual(storage.data, { 'campusone-applicants-v1': '[1]' })

// Si ya existe la clave nueva, se conserva y solo se limpia la anterior.
storage = memoryStorage({ 'nexo-applicants': '[1]', 'campusone-applicants-v1': '[2]' })
migrateLegacyKey(storage, 'nexo-applicants', 'campusone-applicants-v1')
assert.deepEqual(storage.data, { 'campusone-applicants-v1': '[2]' })

// Sin clave anterior no hace nada.
storage = memoryStorage({ otra: 'x' })
migrateLegacyKey(storage, 'nexo-applicants', 'campusone-applicants-v1')
assert.deepEqual(storage.data, { otra: 'x' })

// Si no puede escribir, no borra la clave anterior.
storage = memoryStorage({ 'nexo-applicants': '[1]' }, { failWrites: true })
migrateLegacyKey(storage, 'nexo-applicants', 'campusone-applicants-v1')
assert.deepEqual(storage.data, { 'nexo-applicants': '[1]' })

console.log('Migration checks passed: copy, keep existing, no-op and blocked storage.')
