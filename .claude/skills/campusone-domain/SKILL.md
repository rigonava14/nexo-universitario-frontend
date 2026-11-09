---
name: campusone-domain
description: Conocimiento del dominio y estándares de trabajo de CampusOne (gestión escolar SaaS para bachilleratos y universidades de México). Úsala antes de diseñar, implementar, revisar o documentar cualquier módulo de CampusOne; al tocar control escolar, admisiones, finanzas, facturación CFDI, nómina, documentos SEP, permisos o datos de alumnos; y al escribir historias, pruebas o PR de este repositorio.
---

# CampusOne — dominio y estándares

CampusOne es un SaaS multi-institución para escuelas de media superior y superior en México. Una sola base de código sirve a todas las instituciones; lo que cambia entre escuelas es **configuración**, nunca código especial por cliente.

## Antes de empezar

1. Ubica la tarea en `docs/PLAN.md` (tareas numeradas por fase) o `docs/BACKLOG.md`.
2. Lee `CLAUDE.md` (reglas no negociables) y `docs/TRABAJO.md` (flujo, commits, PR).
3. Carga la referencia que aplique:

| Si la tarea toca…                                        | Lee                           |
| -------------------------------------------------------- | ----------------------------- |
| Términos escolares o fiscales (RVOE, kárdex, IEDU, 911…) | `references/glosario.md`      |
| Un módulo nuevo o la migración de uno existente          | `references/patron-modulo.md` |
| SEP, SAT, IMSS o datos personales                        | `references/normativa.md`     |
| Revisar un PR o cerrar una historia                      | `references/verificacion.md`  |

## Modelo mental

- **Institución** → campus → niveles (bachillerato, licenciatura, posgrado) → programas con RVOE → versiones de plan → materias.
- **Persona** única con varios roles (alumno, padre o tutor, docente, empleado, egresado) mediante membresías por institución.
- **Periodo** (semestre, cuatrimestre, trimestre) → grupos → inscripciones → calificaciones → kárdex.
- **Movimientos** (baja temporal o definitiva, reingreso, cambio de carrera, revalidación) conservan historial; nunca se borra la trayectoria.
- **Bloqueos** (finanzas, biblioteca, control escolar) impiden inscripción o emisión de documentos y se liberan con motivo.
- **Finanzas**: concepto → lista de precios → cargo → pago → recibo → CFDI. Becas y descuentos ajustan cargos, no pagos.

## Reglas de diseño de software

- Reglas de negocio = funciones puras en módulos de dominio, con pruebas. Hoy: `src/school.ts`, `src/operations.ts`, `src/admissions.ts`, `src/directory.ts`, `src/scheduling.ts`. Desde la fase 1: `packages/domain`.
- Acceso a datos solo por `src/services/` (interfaz por dominio + adaptador). Las pantallas usan hooks, nunca almacenamiento directo.
- Todo registro de negocio lleva `institutionId`; en la API, Row Level Security en PostgreSQL y prueba de acceso cruzado.
- Permisos por sección (ver `src/access-control.ts`) hoy; por permiso y campus en la API.
- Auditoría en cambios de calificaciones, pagos, movimientos y documentos.
- Reglas configurables por institución (escala, mínimo aprobatorio, parciales, extraordinarios) se leen de configuración, nunca constantes en código.

## Estilo de la interfaz

- Cumple `DESIGN.md`: lienzo `#F6F5F4`, tarjetas blancas con borde de 1px, radio `var(--paper-radius)` (4px), un solo botón azul por vista, texto en tinta, Inter.
- Textos en español de México, cortos, que digan qué pasó y qué hacer. Ejemplo de error: "No se pudo inscribir: el grupo 3A ya está lleno. Elige otro grupo o pide ampliar el cupo."
- Funciona a 390 px de ancho sin desplazamiento horizontal.

## Al terminar

- `npm run check` en verde; `npm run test:e2e` si cambiaron pantallas.
- Documentación actualizada (`MODULOS.md`, ADR si hubo decisión de arquitectura, `docs/PLAN.md` si cambia el plan).
- Commit y PR con el formato de `docs/TRABAJO.md`, con la lista de `references/verificacion.md`.
