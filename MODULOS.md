# CampusOne — módulos y plan de trabajo

Inventario del frontend revisado el 5 de octubre de 2026. La presencia de una pantalla no implica que el módulo esté listo para producción.

## Nuevos módulos administrativos implementados

| Módulo | Ruta | Primera entrega | Pendiente de integración |
| --- | --- | --- | --- |
| Residencias | `/admin/residencias` | Proyectos por alumno, empresa, asesor, fechas, horas, estados y referencia de evidencia | Carga real de archivos y conexión con el portal estudiantil |
| Titulación | `/admin/titulacion` | Modalidades configurables, asesor, revisión de requisitos, fecha y seguimiento de expediente | Documentos verificables, firmas y conexión con Control escolar |
| Academias | `/admin/academias` | Responsables, integrantes del directorio docente y registro editable de acuerdos | Historial individual de acuerdos y conexión con la programación académica |
| Inglés | `/admin/ingles` | Grupos por nivel y periodo, docente, horario, aula, cupo, inscripción, bajas, calificación, asistencia y acreditación | Vincular sus resultados con el kárdex y gestionar conflictos de horario |
| Reportes | `/admin/reportes` | Consulta y exportación CSV filtrada de Alumnos, Docentes, Residencias, Titulación, Academias e inscripciones de Inglés según permisos | Reportes consolidados de Finanzas y Admisiones; servidor y formatos oficiales |
| Configuración | `/admin/configuracion` | Horas mínimas de residencia, calificación/asistencia de Inglés y catálogo de modalidades de titulación | Compartir y auditar reglas institucionales desde backend |

Las seis secciones cuentan con rutas propias, selección de menú derivada de la ruta y controles de permisos de demostración. Los expedientes operativos empiezan vacíos: el usuario registra datos vinculados con los directorios de Alumnos y Docentes. Todo se guarda localmente. Si los datos guardados están corruptos o cambian en otra pestaña, se bloquea la escritura para evitar sobrescribirlos.

Residencias exige las horas configuradas y una referencia de evidencia antes de concluir. Titulación exige todos los requisitos y una fecha antes de avanzar a examen o titulado. Inglés controla cupos e inscripciones duplicadas y calcula acreditación con las reglas vigentes. La revisión de requisitos y evidencia es manual; no verifica automáticamente archivos, pagos ni cumplimiento académico.

## Módulos existentes que necesitan completarse

| Módulo | Base disponible | Pendiente |
| --- | --- | --- |
| Alumnos | Directorio, expediente de Control escolar, inscripción y documentos locales | Pagos y sincronización completa del portal |
| Docentes administrativos | `/admin/docentes`: directorio, alta, edición, departamento, grado y expediente local | Asignación real de grupos y vinculación con el portal docente |
| Aspirantes y admisiones | Registro, seguimiento, fichas y archivos digitales locales | Pagos verificados y conversión a alumno |
| Control escolar | Materias, grupos e inscripción, expediente, kárdex, revalidación, bloqueos, bajas, cambios y justificantes | Persistencia compartida, cierres institucionales y auditoría de servidor |
| Oferta académica | Carreras y planes relacionados con materias, grupos y expedientes | Versiones históricas de planes por alumno |
| Coordinación académica | Áreas, encargados, clases del semestre, docentes, disponibilidad, cargas y propuestas de horario | Configurar clave OpenAI y probar llamada real; autorización de servidor y reglas avanzadas de aulas |
| Finanzas | Cargos, cobros y catálogos de demostración | Exportaciones efectivas, conciliación y conexión con pagos reales |
| Becas | Interfaz administrativa y configuración | Conectar solicitudes del portal estudiantil con revisión y aplicación financiera |
| Usuarios y permisos | Usuarios, roles y permisos locales | Autenticación real y autorización validada en el servidor |
| Portal estudiantil | Pantallas académicas, pagos, trámites y procesos | Datos por usuario; solicitudes, evidencias y descargas efectivas |
| Portal docente | Grupos, evaluación, asistencia, actas y reportes | Persistencia compartida, cierres, expedientes y descargas efectivas |
| Resumen | Indicadores y actividad de ejemplo | Calcular indicadores a partir de los datos operativos |

## Dependencias para producción

- API y base de datos compartida.
- Autenticación, autorización y gestión de sesiones en backend.
- Almacenamiento de documentos y evidencias.
- Integración de pagos y comprobantes.
- Validaciones de servidor y auditoría de cambios.

## Secuencia propuesta

La entrega local ahora incluye los flujos de Control escolar y Coordinación descritos en [CONTROL_ESCOLAR.md](CONTROL_ESCOLAR.md). OpenAI está integrado mediante un backend local y queda pendiente configurar la clave del servidor para probar una generación real. Continuar con base de datos compartida, identidad y autorización de servidor, almacenamiento institucional de archivos y sincronización completa de los portales; después cierres, pagos y auditoría. La carga documental ya comparte expedientes dentro del mismo navegador, pero los datos académicos de los portales siguen siendo de demostración.

Verificación: `npm run build`, `npm run test:directory` y `npm run test:operations`. Las pruebas cubren validación, duplicados, cupos, fechas, requisitos de cierre, acreditación, persistencia, fallos de almacenamiento y serialización CSV. En navegador se verificaron altas de alumno/docente, matrícula duplicada, edición, persistencia de academias y titulación, grupos e inscripción de Inglés, bloqueo por cupo, cambios de acreditación desde Configuración y consulta de Reportes. El formulario de Residencias se revisó visualmente; las fechas y reglas de conclusión se verificaron mediante pruebas automatizadas. La verificación automatizada del evento de descarga en el navegador no terminó; el generador CSV sí pasó sus pruebas.

Los registros `QA-2026-001`, `DOC-QA-001`, `QA-A1`, la academia y la tesis de prueba son datos ficticios locales creados durante la revisión. Los directorios y módulos administrativos aún no sincronizan datos con los portales estudiantil y docente.
