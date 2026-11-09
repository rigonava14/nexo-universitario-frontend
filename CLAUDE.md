# CampusOne — guía para Claude Code

CampusOne es una plataforma SaaS de gestión escolar para instituciones de educación media superior y superior en México. Hoy es un frontend React (prototipo) que se está convirtiendo en producto multi-institución, siguiendo `docs/PLAN.md`.

Antes de cualquier tarea no trivial, carga la skill del proyecto **`campusone-domain`** (`.claude/skills/campusone-domain/SKILL.md`). Contiene el glosario escolar y fiscal mexicano, el patrón de módulo y las listas de verificación.

## Documentos que mandan

| Documento                          | Para qué                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| `docs/PLAN.md`                     | Plan de implementación: fases, sprints, tareas numeradas (0.1, 0.2…), puertas de salida |
| `docs/PROPUESTA.md`                | Visión de producto, módulos, arquitectura objetivo, modelo comercial                    |
| `docs/TRABAJO.md`                  | Cómo trabajamos: flujo de cada historia, ramas, commits, PR, definición de terminado    |
| `docs/BACKLOG.md`                  | Historias pendientes en orden de prioridad                                              |
| `docs/adr/`                        | Decisiones de arquitectura registradas (una por archivo)                                |
| `DESIGN.md`                        | Estándar visual obligatorio (colores, tipografía, radio de 4px, componentes)            |
| `MODULOS.md`, `CONTROL_ESCOLAR.md` | Estado funcional de cada módulo y reglas de control escolar                             |

Si el código y un documento no coinciden, señálalo y propone actualizar el documento en el mismo PR.

## Comandos

```bash
npm ci                    # instalar exactamente lo del lockfile
npm run dev               # Vite en http://localhost:5173
npm run build             # tsc -b + vite build (debe pasar siempre)
npm run lint              # ESLint
npm run format            # Prettier (escribe)
npm run format:check      # Prettier (solo verifica, lo usa CI)
npm run test              # pruebas de reglas: school, directory, operations
npm run test:e2e          # Playwright (levanta Vite solo)
npm run check             # lint + format:check + build + test (lo mismo que CI)
npm run api               # backend local de horarios con IA (requiere .env)
```

Node 24 (`.nvmrc`). Antes de abrir un PR corre `npm run check` y, si tocaste pantallas, `npm run test:e2e`.

## Estructura actual

```
src/
  main.tsx, App.tsx       # arranque: QueryClientProvider, Suspense, estado compartido y rutas
  routes/                 # rutas declaradas con carga diferida y guardas de permisos
  admin/                  # login, layout, menú y resumen del panel de administración
  services/index.ts       # interfaces por dominio y registro `services` (único punto para cambiar adaptador)
  services/local/         # adaptadores del navegador: el ÚNICO lugar con localStorage, sessionStorage e IndexedDB
  hooks/                  # TanStack Query: data.ts (hooks por dominio), useVersionedStore (guardado optimista)
  app-state.tsx           # institución y aspirantes compartidos entre portales
  school.ts, operations.ts, directory.ts, admissions.ts, scheduling.ts   # reglas de negocio puras
  institution.ts, access-control.ts, auth.ts                             # configuración, permisos, sesión demo
  *.tsx                   # pantallas por módulo
  *.css                   # estilos; paper-theme.css se carga al final y define el acabado
server/index.mjs          # API local de horarios (OpenAI), solo desarrollo
scripts/*.test.mjs|cjs    # pruebas de reglas sin framework
e2e/                      # pruebas Playwright
```

Estructura objetivo (fase 1): monorepo `apps/web`, `apps/api` (NestJS), `apps/site` (Astro), `packages/domain`, `packages/schemas`. No la adelantes sin que la tarea lo pida.

## Reglas no negociables

1. **Las pantallas no tocan almacenamiento.** Nada de `localStorage`, `sessionStorage` ni IndexedDB en componentes: todo pasa por `src/services/`. Cuando exista la API, solo cambia el adaptador.
2. **Las reglas de negocio son funciones puras** en los módulos de dominio (`school.ts`, `operations.ts`…), con pruebas. Nunca dentro de un componente.
3. **Multi-institución desde ya.** Todo dato de negocio pertenece a una institución. En el backend: `institution_id` en cada tabla, Row Level Security y prueba de acceso cruzado. Ninguna consulta sin filtro de institución.
4. **Permisos en servidor.** El frontend oculta lo que no se puede usar, pero la autorización real vive en la API. Las guardas del frontend no son seguridad.
5. **Auditoría** de todo cambio en calificaciones, pagos, movimientos escolares y documentos (quién, cuándo, valor anterior).
6. **Datos personales** (CURP, salud, discapacidad, datos bancarios): nunca en logs, nunca a proveedores de IA, cifrados en reposo en el backend.
7. **Secretos** solo en variables de entorno del servidor. Nunca `VITE_*` para llaves, nunca en el repo.
8. **Diseño**: cumple `DESIGN.md` (tokens en `src/paper-theme.css`, radio `var(--paper-radius)`, sin sombras ni degradados en tarjetas, un solo botón primario por vista). Funciona a 390 px.
9. **Idioma**: textos de interfaz, documentación y mensajes de error en español de México, claro y sin tecnicismos. Identificadores de código en inglés.
10. **Sin dependencias en `latest`.** Versiones exactas; una dependencia nueva se justifica en el PR.

## Cómo trabajar una tarea

1. Lee la tarea en `docs/PLAN.md` o `docs/BACKLOG.md` y sus criterios de aceptación.
2. Si toca más de 3 archivos o cambia datos, propone un plan antes de editar.
3. Escribe primero las pruebas de las reglas de negocio.
4. Implementa en cambios pequeños; un commit por idea.
5. Verifica tú mismo: `npm run check`, `npm run test:e2e` si hay pantallas, y revisa en el navegador con capturas a 1440 y 390 px.
6. Actualiza la documentación afectada (`MODULOS.md`, `docs/PLAN.md` si cambia el plan, un ADR si es una decisión de arquitectura).
7. Commit con el formato de `docs/TRABAJO.md` y PR con la plantilla. El merge lo hace la persona dueña del proyecto, nunca Claude.

## Lo que no se hace

- No cambiar el comportamiento visible en la fase 0: es reorganización, no funciones nuevas.
- No agregar pantallas nuevas sobre `localStorage`.
- No reescribir reglas que ya tienen pruebas: se mueven, no se reinventan.
- No hacer `git push --force` a ramas compartidas ni merge a `main`.
- No inventar requisitos fiscales o de la SEP: si no está en la skill o en una fuente oficial, pregúntalo.
