# Cómo trabajamos en CampusOne

Una persona dueña del proyecto + Claude Code. La persona decide, revisa y hace merge; Claude Code implementa, prueba y documenta. Este documento es el estándar para cada cambio. El detalle por fase está en [`PLAN.md`](PLAN.md).

## Flujo de cada historia

1. **Historia**: sale de [`BACKLOG.md`](BACKLOG.md) o del plan (tarea `0.x`, `S4`…). Tiene criterios de aceptación verificables.
2. **Rama**: desde `main` actualizada.
3. **Plan**: si toca más de 3 archivos o cambia datos, Claude propone el plan (archivos, pruebas, riesgos) y la persona lo aprueba.
4. **Pruebas primero** para reglas de negocio.
5. **Implementación** en commits pequeños.
6. **Verificación** por Claude: `npm run check`, `npm run test:e2e` si hay pantallas, capturas a 1440 y 390 px.
7. **PR** con la plantilla; Claude corre `/code-review` y, si aplica, `/security-review`.
8. **Revisión y merge** por la persona dueña. Claude nunca hace merge.

## Ramas

| Prefijo     | Uso                                                       | Ejemplo                      |
| ----------- | --------------------------------------------------------- | ---------------------------- |
| `feat/`     | Funcionalidad nueva                                       | `feat/rutas-lazy`            |
| `fix/`      | Corrección                                                | `fix/kardex-promedio`        |
| `chore/`    | Mantenimiento, dependencias, configuración                | `chore/fijar-versiones`      |
| `refactor/` | Reorganización sin cambio de comportamiento               | `refactor/capa-servicios`    |
| `docs/`     | Solo documentación                                        | `docs/adr-multi-institucion` |
| `test/`     | Solo pruebas                                              | `test/e2e-inscripcion`       |
| `claude/`   | Ramas creadas automáticamente por sesiones de Claude Code | `claude/...`                 |

`main` está protegida: solo recibe PR con CI en verde y aprobación.

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/es/) en español:

```
tipo(ámbito): descripción corta en imperativo

Por qué se hizo el cambio y qué alternativa se descartó, si aplica.
Tarea: 0.9
```

- `tipo`: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`.
- `ámbito`: módulo o área (`rutas`, `servicios`, `control-escolar`, `finanzas`, `ci`, `deps`).
- Un commit = una idea. El formateo masivo va en su propio commit para no esconder cambios.

## Pull requests

- Título con el mismo formato que el commit principal.
- Menos de 400 líneas cambiadas cuando sea posible (formateo y lockfiles aparte).
- Usa la plantilla `.github/pull_request_template.md`.
- Capturas antes/después si cambia la interfaz.

## Definición de terminado

Una historia está terminada solo si:

- [ ] Cumple sus criterios de aceptación y la persona dueña la probó.
- [ ] Tiene pruebas de reglas y del flujo principal.
- [ ] Respeta permisos y aislamiento por institución.
- [ ] Registra auditoría si cambia calificaciones, pagos, movimientos o documentos.
- [ ] Cumple `DESIGN.md` y funciona a 390 px.
- [ ] Está documentada.

## Decisiones de arquitectura (ADR)

Toda decisión difícil de revertir (base de datos, autenticación, estructura del repo, proveedor externo) se registra en `docs/adr/NNNN-titulo.md` con la plantilla `docs/adr/0000-plantilla.md`. Un ADR aceptado no se edita: se reemplaza con otro.

## Ritmo

Sprints de 3 semanas (ver `PLAN.md`): día 1 planear, semanas 1–2 construir con revisión diaria de PR, semana 3 cerrar con pruebas, documentación, demo y retro.

## Bitácora de sprints

Agrega una entrada al cerrar cada sprint: fecha, qué se terminó, qué no, velocidad (historias cerradas) y una mejora para el siguiente.

### Sprint 0 — iniciado el 9 de noviembre de 2026

- Hecho: 0.2, 0.3, 0.4, 0.5, 0.7, 0.8, 0.9, 0.10 y 0.15; estándares de trabajo (`CLAUDE.md`, skill, esta guía).
- Corrección encontrada por las pruebas: el directorio de alumnos desbordaba la pantalla en móvil.
- Capa de servicios (0.11 a 0.13) en su propio PR: interfaces, adaptadores locales, TanStack Query y guardado optimista con versión (ADR 0002).
- Siguiente: 0.14 (unificar nombres) y cierre del sprint 0.
- La persona dueña fusionó los PR #1 y #2 y protegió `main` con un ruleset (0.1 y 0.6).
