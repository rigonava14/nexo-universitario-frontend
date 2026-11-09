/**
 * Resultado de una lectura. `version` identifica lo que se leyó para detectar cambios de otra pestaña
 * (en la API será el ETag). `error` no vacío significa que la escritura debe quedar bloqueada.
 */
export type Loaded<T> = { data: T; error: string; version: string | null }

/** Resultado de una escritura: `error` vacío si se guardó; `version` es la nueva versión guardada. */
export type Saved = { error: string; version: string | null }
