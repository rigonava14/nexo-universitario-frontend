# 0001 — Capa de servicios entre pantallas y almacenamiento

- **Estado**: aceptada
- **Fecha**: 2026-11-09

## Contexto

Las pantallas leen y escriben directamente en `localStorage` e IndexedDB mediante funciones como `loadSchool`, `saveOperations` o `loadApplicants`. En la fase 1 los datos pasarán a una API con PostgreSQL. Si cada pantalla conoce el almacenamiento, migrar obliga a tocar todas las pantallas dos veces.

## Decisión

Toda lectura y escritura de datos de negocio pasa por `src/services/`: una interfaz asíncrona por dominio y un adaptador intercambiable. En la fase 0 el adaptador es local (envuelve las funciones actuales); en la fase 1 se agrega el adaptador de API. Las pantallas consumen los servicios mediante hooks.

## Alternativas consideradas

| Opción | A favor | En contra |
| --- | --- | --- |
| Migrar cada pantalla directo a la API en la fase 1 | Menos código intermedio | Cada pantalla se toca dos veces; mezcla migración con refactor |
| Capa de servicios ahora (elegida) | Un solo punto de cambio; pruebas e2e estables durante la migración | Trabajo previo sin cambio visible |

## Consecuencias

- Las interfaces son `async` aunque el adaptador local sea síncrono.
- Revisión de PR: ninguna pantalla importa almacenamiento.
- El cambio de adaptador por dominio puede hacerse gradualmente (S4 y S5).
