/**
 * Copia un valor guardado con una clave anterior a su clave actual y borra la anterior.
 * Si ya existe la clave actual, no la toca. Si algo falla, no borra nada: la siguiente lectura reintenta.
 */
export function migrateLegacyKey(storage: Storage, legacyKey: string, key: string) {
  try {
    const legacy = storage.getItem(legacyKey)
    if (legacy === null) return
    if (storage.getItem(key) === null) storage.setItem(key, legacy)
    storage.removeItem(legacyKey)
  } catch {
    /* Almacenamiento bloqueado: se conserva la clave anterior. */
  }
}
