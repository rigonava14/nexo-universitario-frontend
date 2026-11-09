# Patrón de módulo

Todo módulo sigue el mismo molde para que el código sea predecible y Claude pueda generarlo con poco contexto.

## Fase 0 (frontend con adaptador local)

```
src/<dominio>.ts                 # tipos + reglas puras + validaciones (sin React, sin almacenamiento)
src/services/<dominio>.ts        # interfaz del servicio (métodos async)
src/services/local/<dominio>.ts  # adaptador que hoy usa localStorage/IndexedDB
src/hooks/use<Dominio>.ts        # hooks de lectura y mutación sobre el servicio
src/<Pantalla>.tsx               # pantalla: solo hooks + UI
scripts/<dominio>.test.mjs       # pruebas de reglas
e2e/<flujo>.spec.ts              # flujo principal en navegador
```

Reglas:

- La interfaz de servicio devuelve `Promise` aunque el adaptador local sea síncrono; así la API entra sin cambiar pantallas.
- Los errores de regla se devuelven como texto en español listo para mostrar.
- Ninguna pantalla importa `load*`, `save*`, `localStorage` ni `document-store` directamente.

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
