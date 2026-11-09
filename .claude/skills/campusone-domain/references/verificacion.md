# Listas de verificación

## Antes de abrir un PR

- [ ] La tarea está identificada (número del plan o historia del backlog) y sus criterios de aceptación se cumplen.
- [ ] `npm run check` pasa (lint, formato, build, pruebas de reglas).
- [ ] `npm run test:e2e` pasa si cambiaron pantallas o rutas.
- [ ] Reglas nuevas tienen prueba; reglas existentes no se reescribieron sin necesidad.
- [ ] Ninguna pantalla accede a `localStorage`, `sessionStorage`, IndexedDB ni a `load*`/`save*` directamente.
- [ ] Todo dato de negocio considera la institución (`institutionId`).
- [ ] Permisos: la ruta o acción está protegida; en API, también en servidor.
- [ ] Cambios sensibles registran auditoría.
- [ ] Sin datos personales en logs ni en llamadas a IA.
- [ ] Cumple `DESIGN.md` y se revisó a 1440 y 390 px (capturas en el PR si hay cambios visuales).
- [ ] Textos en español claro; errores dicen qué pasó y qué hacer.
- [ ] Documentación actualizada (`MODULOS.md`, ADR, `docs/PLAN.md`, `docs/BACKLOG.md`).
- [ ] Sin dependencias nuevas sin justificar; versiones exactas.

## Revisión de seguridad (obligatoria en autenticación, permisos, pagos, facturas, documentos y datos personales)

- [ ] ¿Un usuario de otra institución puede leer o modificar esto? (debe ser no, con prueba)
- [ ] ¿Un rol sin permiso puede llamar el endpoint o abrir la ruta? (debe ser no, con prueba)
- [ ] ¿Se validan tipo, tamaño y contenido de entradas y archivos en el servidor?
- [ ] ¿Hay secretos o llaves en el código o en variables `VITE_*`?
- [ ] ¿Se registra quién hizo el cambio?

## Cierre de sprint

- [ ] Demo en staging (o local en fase 0) de lo terminado.
- [ ] `docs/BACKLOG.md` actualizado: hecho, pendiente, nuevo.
- [ ] Retro de 5 líneas agregada al final de `docs/TRABAJO.md` (sección Bitácora).
- [ ] Velocidad registrada para recalcular el plan.
