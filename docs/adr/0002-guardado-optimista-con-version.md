# 0002 — Guardado optimista con versión

- **Estado**: aceptada
- **Fecha**: 2026-11-09

## Contexto

La capa de servicios (ADR 0001) tiene interfaces asíncronas para que la API entre sin cambiar pantallas. Pero unas 20 llamadas en pantallas usan `store.commit(next)` de forma síncrona y deciden con su resultado si cierran un formulario o encadenan otro guardado (por ejemplo, Control escolar guarda materias y después la oferta académica). Convertirlas todas a `async` en la fase 0 mezclaría la reorganización con cambios de flujo en pantallas grandes.

Además, los módulos detectaban cambios hechos en otra pestaña comparando lo guardado con lo leído al abrir el módulo.

## Decisión

- Los datos se leen con TanStack Query (`useSuspenseQuery`) a través de `src/services`.
- `useVersionedStore` ofrece `commit(next)` **síncrono**: valida, aplica el cambio en la caché al momento y lo guarda en segundo plano. Los guardados de una misma clave se encadenan.
- Cada lectura devuelve una `version` y cada escritura envía la versión esperada. Si no coincide, el servicio rechaza el guardado con "Los datos cambiaron en otra pestaña…", la caché vuelve al estado anterior y se muestra el error. En la API, la versión será el ETag (`If-Match`).

## Alternativas consideradas

| Opción                                    | A favor                                                     | En contra                                                                                    |
| ----------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `commit` asíncrono en todas las pantallas | Fallos de guardado antes de cerrar el formulario            | ~20 cambios de flujo en pantallas grandes durante una fase sin cambios visibles              |
| Guardado optimista con versión (elegida)  | Pantallas sin cambios; mismo patrón que se usará con la API | Si el guardado falla, el formulario ya se cerró: el cambio se revierte y se muestra el error |

## Consecuencias

- Un fallo de guardado se ve como "cambio revertido + mensaje", no como formulario abierto con error.
- `onSave` de la configuración institucional ahora devuelve una promesa; quien necesite revertir usa `.catch`.
- El catálogo de Control escolar se vuelve a leer al reabrir el módulo después de cambiar la oferta, no a mitad de una edición.
- La sesión de demostración sigue síncrona (`SessionService`) hasta la autenticación real del sprint 3.
- Prueba e2e `e2e/servicios.spec.ts` cubre el conflicto entre pestañas.
