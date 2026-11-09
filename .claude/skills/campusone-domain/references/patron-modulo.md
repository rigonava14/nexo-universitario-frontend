# Patrón de módulo

Todo módulo sigue el mismo molde para que el código sea predecible y Claude pueda generarlo con poco contexto.

## Fase 0 (frontend con adaptador local)

```
src/<dominio>.ts                 # tipos + reglas puras + validaciones (sin React, sin almacenamiento)
src/services/index.ts            # interfaz <Dominio>Service (métodos async) y registro `services`
src/services/local/<dominio>.ts  # adaptador del navegador; único lugar con localStorage/IndexedDB
src/hooks/data.ts                # hooks del dominio sobre TanStack Query (useXStore, useXData)
src/<Pantalla>.tsx               # pantalla: solo hooks + UI
scripts/<dominio>.test.mjs|cjs   # pruebas de reglas y del adaptador (scripts/ts-module.cjs)
e2e/<flujo>.spec.ts              # flujo principal en navegador
```

Reglas:

- La interfaz de servicio devuelve `Promise` aunque el adaptador local sea síncrono; así la API entra sin cambiar pantallas.
- Las lecturas devuelven `Loaded<T>` (`data`, `error`, `version`) y las escrituras `Saved` (`error`, `version`). La versión detecta cambios de otra pestaña (en la API será el ETag). Ver ADR 0002.
- Para datos editables usa `useVersionedStore`: `commit(next)` valida, aplica el cambio al momento, guarda en segundo plano y revierte con mensaje si falla. Las validaciones de regla van antes de `commit` en el hook del dominio.
- Los hooks usan `useSuspenseQuery`: la ruta ya tiene `Suspense`, la pantalla recibe datos listos.
- Los errores de regla se devuelven como texto en español listo para mostrar.
- Ninguna pantalla importa `services/local`, `localStorage` ni las funciones de un adaptador; ESLint lo impide.

## Fase 1 en adelante (API)

```
packages/domain/<dominio>/        # reglas y pruebas (movidas desde src/)
packages/schemas/<dominio>.ts     # esquemas Zod compartidos web/API
apps/api/src/<dominio>/
  <dominio>.module.ts
  <dominio>.controller.ts         # rutas REST, guardas de permiso
  <dominio>.service.ts            # orquesta reglas + repositorio + auditoría
  <dominio>.repository.ts         # Drizzle; siempre dentro de la transacción con institution_id
  <dominio>.e2e-spec.ts           # caso permitido, caso negado, acceso cruzado
apps/api/drizzle/<n>_<dominio>.sql
apps/web/src/services/api/<dominio>.ts   # adaptador API (cliente generado de OpenAPI)
```

## Tabla de negocio estándar

| Columna                    | Tipo                 | Nota                                         |
| -------------------------- | -------------------- | -------------------------------------------- |
| `id`                       | uuid                 | Clave primaria                               |
| `institution_id`           | uuid                 | Obligatoria; política RLS                    |
| `campus_id`                | uuid nullable        | Si aplica                                    |
| `created_at`, `updated_at` | timestamptz          |                                              |
| `created_by`, `updated_by` | uuid                 | Usuario que hizo el cambio                   |
| `deleted_at`               | timestamptz nullable | Borrado lógico cuando el dato tiene historia |

## Endpoints estándar

`GET /<recurso>` (paginado, búsqueda, filtros) · `GET /<recurso>/:id` · `POST /<recurso>` · `PATCH /<recurso>/:id` · acciones de negocio como `POST /<recurso>/:id/<accion>` (p. ej. `/enrollments/:id/drop`), nunca un `PATCH` genérico que salte reglas.

## Pantalla estándar

Encabezado del módulo (kicker, título, descripción, una acción primaria) → barra de búsqueda y filtros → tabla paginada → panel lateral (drawer) para ver y editar → estados vacío, cargando y error con texto útil.
