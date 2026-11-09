const fs = require('node:fs')
const vm = require('node:vm')
const { stripTypeScriptTypes } = require('node:module')

/**
 * Carga uno o más archivos TypeScript en un contexto aislado, como si fueran un solo módulo.
 * Quita imports y `export` para que las reglas de dominio y su adaptador local se prueben juntos,
 * con un `localStorage` simulado que pasa la prueba en `context`.
 */
function loadTsModule(files, names, context) {
  const code =
    files
      .map((file) =>
        stripTypeScriptTypes(fs.readFileSync(file, 'utf8'))
          .replace(/^import[\s\S]*?from\s+'[^']+'\s*$/gm, '')
          .replace(/^export /gm, ''),
      )
      .join('\n') + `\nexports = { ${names.join(', ')} };`
  const sandbox = { exports: {}, ...context }
  vm.runInNewContext(code, sandbox)
  return sandbox.exports
}

module.exports = { loadTsModule }
