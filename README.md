# Nexo Universitario — Frontend

Primera base visual para una plataforma integral de gestión universitaria.

## Ejecutar

```bash
npm install
npm run dev
```

## Incluido en esta iteración

- Acceso de demostración.
- Panel administrativo adaptable a móvil.
- Navegación de módulos universitarios.
- Indicadores, matrícula, actividad reciente y tabla de alumnos.
- Estado inicial para módulos aún no implementados.
- Administración de aspirantes con búsqueda, filtros, validación, generación de ficha y cambio de estatus.
- Portal público de admisiones con registro y consulta de seguimiento.
- Fichas imprimibles de aspirante, pago de examen y admisión.

## Rutas del módulo de aspirantes

- `/admin/aspirantes` — gestión institucional.
- `/aspirantes` — página pública de admisiones.
- `/aspirantes/registro` — registro del aspirante.
- `/aspirantes/seguimiento` — consulta del proceso por folio.

Folio de demostración con proceso aceptado: `ASP-2026-0148`.

## Portal de estudiantes

- `/alumnos` — acceso del estudiante.
- `/alumnos/inicio` — resumen académico y próximas clases.
- `/alumnos/clases` y `/alumnos/horario` — materias, docentes, aulas y agenda semanal.
- `/alumnos/calificaciones` y `/alumnos/kardex` — evaluación e historial académico.
- `/alumnos/pagos` — estado de cuenta, pago de demostración y comprobantes.
- `/alumnos/tramites` — becas, constancias y seguimiento de solicitudes.
- `/alumnos/procesos` — servicio social, residencias, titulación y carga de evidencias.
- `/alumnos/noticias` y `/alumnos/perfil` — avisos y datos personales.

Matrícula de demostración: `20230184`.

## Portal docente

- `/docentes` — acceso exclusivo para profesores.
- `/docentes/inicio` — clases del día, grupos y evaluaciones pendientes.
- `/docentes/grupos` — clases, grupos y datos académicos detallados.
- `/docentes/evaluaciones` — captura editable de calificaciones por grupo.
- `/docentes/asistencia` — listas de asistencia por fecha.
- `/docentes/actas` — actas preliminares y cerradas.
- `/docentes/historial` — grupos y expedientes de ciclos anteriores.
- `/docentes/reportes` — estadísticas, aprobación, promedios y asistencia.
- `/docentes/perfil` — información profesional y de contacto.

Número de empleado de demostración: `DOC-0048`.

## Pendiente

- Integración con una API real.
- Autenticación y permisos persistentes.
- Formularios y operaciones completas de cada módulo.
