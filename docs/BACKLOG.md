# Backlog de CampusOne

Historias en orden de prioridad. Cada una sale de [`PLAN.md`](PLAN.md); los números (`0.11`, `S4-3`) permiten rastrearla. Al crear el issue en GitHub, usa la plantilla **Historia** y copia los criterios. Actualiza este archivo al cerrar cada sprint.

Estados: **Hecho**, **En curso**, **Siguiente**, **Pendiente**.

## Fase 0 — Preparar el repositorio (Sprint 0)

| #    | Historia                                                    | Estado    | Notas                                                                                                         |
| ---- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| 0.1  | Fusionar el PR del tema visual y `DESIGN.md`                | Hecho     | PR #1 y PR #2 fusionados en `main`                                                                            |
| 0.2  | Fijar versiones exactas                                     | Hecho     | TypeScript bajó a 6.0.3: `typescript-eslint` aún no soporta la 7                                              |
| 0.3  | Node 24 en `.nvmrc` y `engines`                             | Hecho     | `engines` acepta desde 22.18 para entornos locales                                                            |
| 0.4  | Prettier y ESLint, formateo completo                        | Hecho     | La regla de acceso a almacenamiento es `error` desde 0.12                                                     |
| 0.5  | CI en GitHub Actions                                        | Hecho     | `.github/workflows/ci.yml`                                                                                    |
| 0.6  | Proteger `main`                                             | Hecho     | Ruleset en GitHub: PR obligatorio, CI en verde (lint/build/reglas y Playwright), sin force push ni borrado    |
| 0.7  | Quitar `gsap`                                               | Hecho     | Paquete principal de 736 kB a 622 kB                                                                          |
| 0.8  | Backlog                                                     | Hecho     | Este archivo                                                                                                  |
| 0.9  | Rutas declaradas con carga diferida                         | Hecho     | Paquete inicial 290 kB (meta del plan: 250 kB; revisar en 0.13)                                               |
| 0.10 | Guardas de permisos por ruta                                | Hecho     | `src/routes/guards.tsx`                                                                                       |
| 0.11 | Interfaces de servicio por dominio                          | Hecho     | `src/services/index.ts`; ADR 0001 y 0002                                                                      |
| 0.12 | Adaptadores locales y pantallas sin acceso directo          | Hecho     | `src/services/local/`; ESLint lo exige como `error`                                                           |
| 0.13 | TanStack Query y hooks                                      | Hecho     | `src/hooks/`; guardado optimista con versión. Paquete inicial 267 kB                                          |
| 0.14 | Unificar nombres (`campusone-*`, `--color-*`) con migración | Pendiente |                                                                                                               |
| 0.15 | Pruebas Playwright                                          | Hecho     | 22 pruebas (escritorio y móvil). La de inscripción a grupo pasa a S4 porque requiere datos de control escolar |

### Detalle de 0.11 y 0.12 (hecho)

**Criterios de aceptación**

- [ ] `src/services/` con una interfaz `async` por dominio: `InstitutionService`, `SessionService`, `DirectoryService`, `SchoolService`, `OperationsService`, `AdmissionsService`, `DocumentService`.
- [ ] `src/services/local/` con un adaptador por servicio que contiene todo el acceso a `localStorage`, `sessionStorage` e IndexedDB, incluida la detección de cambios desde otra pestaña de `school-ui.tsx`.
- [ ] Los módulos de dominio (`school.ts`, `operations.ts`, `directory.ts`, `admissions.ts`, `institution.ts`) quedan con tipos, validaciones y reglas puras.
- [ ] Ninguna pantalla importa `load*`, `save*`, `reset*`, `document-store` ni usa almacenamiento; la regla de ESLint pasa a `error` y `npm run lint` no da advertencias.
- [ ] Las pruebas de `scripts/` siguen pasando (se ajustan para probar los adaptadores locales donde hoy prueban persistencia).
- [ ] Las 22 pruebas Playwright siguen en verde, sin cambios visibles.

**Orden sugerido**: `institution` y `session` (los usan casi todas las pantallas) → `directory` → `operations` → `school` → `admissions` → `documents`.

## Fase 1 — Cimientos (Sprints 1 a 5)

| #    | Historia                                                                                                  | Criterio de aceptación principal                                   |
| ---- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| S1-1 | Monorepo pnpm + Turborepo con `apps/web`, `apps/api`, `packages/domain`, `packages/schemas`               | `pnpm dev` levanta todo; pruebas de dominio pasan desde el paquete |
| S1-2 | `docker-compose` con PostgreSQL 17, Redis y MinIO                                                         | Un comando levanta los servicios locales                           |
| S1-3 | API NestJS mínima con `/health`, configuración y errores en español                                       | Responde en staging                                                |
| S1-4 | Staging en VPS con Coolify y despliegue desde `main`                                                      | Cada merge se publica solo                                         |
| S1-5 | Sentry en web y API                                                                                       | Un error de prueba aparece en Sentry                               |
| S2-1 | Esquema del núcleo en Drizzle (institución, campus, persona, usuario, rol, permiso, membresía, auditoría) | Migraciones versionadas aplican desde cero                         |
| S2-2 | Row Level Security por `institution_id`                                                                   | Prueba de acceso cruzado en CI                                     |
| S2-3 | Semillas: una universidad y un bachillerato ficticios                                                     | Staging con datos de demostración                                  |
| S2-4 | Respaldo diario y restauración de prueba                                                                  | Restauración documentada                                           |
| S3-1 | Autenticación con Better Auth, sesión `httpOnly`                                                          | Ya no se puede cambiar de rol desde la consola                     |
| S3-2 | 2FA obligatorio para administradores y recuperación por correo                                            | Flujo probado en staging                                           |
| S3-3 | Roles y permisos en base de datos con guardas en la API                                                   | Un docente recibe 403 en endpoints de finanzas                     |
| S3-4 | Configuración institucional desde la API                                                                  | Colores y nombre llegan sin `localStorage`                         |
| S3-5 | Usuarios y permisos conectados (invitar, asignar rol, desactivar)                                         | Invitación por correo funciona                                     |
| S4-1 | Tablas y endpoints de programas, planes versionados, materias, periodos                                   | Paginación y búsqueda en servidor                                  |
| S4-2 | Alumnos y docentes en la API; directorio con adaptador API                                                | Dos navegadores ven los mismos datos                               |
| S4-3 | Grupos e inscripción en servidor con reglas de `packages/domain`; prueba e2e de inscripción               | Inscripción duplicada rechazada por la API                         |
| S4-4 | Importador del JSON local a la API                                                                        | Los datos de prueba no se pierden                                  |
| S5-1 | Calificaciones, kárdex, movimientos, bloqueos y revalidaciones en servidor                                | Movimiento auditado con valor anterior                             |
| S5-2 | Residencias, titulación, academias e inglés en servidor                                                   | Reglas de `operations` aplicadas en la API                         |
| S5-3 | Documentos en S3 con URL firmadas                                                                         | IndexedDB ya no se usa                                             |
| S5-4 | Módulo `scheduling` en la API con solucionador local por defecto                                          | `server/index.mjs` se elimina                                      |
| S5-5 | Reportes y CSV en servidor                                                                                | Respetan permisos                                                  |

## Fase 2 — Piloto (Sprints 6 a 12)

| #   | Historia                                                                | Criterio de aceptación principal                    |
| --- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| S6  | Convocatorias y aspirantes en la API, documentos y correo con folio     | Registro desde celular visible al instante          |
| S7  | Conversión a alumno y portal del alumno con datos reales                | El alumno solo ve sus datos                         |
| S8  | Portal docente con captura, asistencia y cierre de actas                | Un acta cerrada no se edita sin movimiento auditado |
| S9  | Documentos oficiales con plantillas, PDF, folio y QR                    | El QR verifica autenticidad                         |
| S10 | Importación desde Excel, indicadores reales y notificaciones por correo | 1,000 alumnos importados sin errores                |
| S11 | Portal de padres, avisos con confirmación de lectura, PWA con push      | Un padre ve a sus hijos y nada más                  |
| S12 | Puesta en producción de la escuela piloto                               | La escuela inscribe su periodo en CampusOne         |

Las fases 3 a 5 se detallan en `PLAN.md` y se bajan a historias al terminar la fase 2.
