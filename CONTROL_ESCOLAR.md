# Control escolar y coordinación de CampusOne

## Relaciones implementadas

| Registro | Relaciones y reglas |
| --- | --- |
| Carrera y plan | Catálogo institucional existente; un plan vigente por carrera, materias por semestre |
| Materia | Una clave única y un identificador compartido entre los planes que la utilizan |
| Alumno | Directorio existente, carrera vinculada, kárdex, documentos, bloqueos y movimientos |
| Grupo | Carrera, semestre, periodo y cupo; inscripción de alumnos activos de esa carrera, sin duplicar grupo en el periodo |
| Clase del semestre | Grupo, materia del semestre de su plan, docente, aula y horas semanales |
| Coordinación | Área, correo del encargado y carreras a cargo; requiere permiso Coordinación académica |
| Horario | Propuesta por periodo, sesiones de una hora y copia de las clases al guardar |

Las carreras y planes se administran en **Control escolar → Carreras y planes**. **Oferta académica** abre la misma gestión. Crear una materia no la asigna automáticamente a todos los planes: primero agregarla al plan y semestre, después asignarla al grupo desde Coordinación.

## Expedientes y movimientos

Desde Alumnos se abre el expediente de Control escolar. Contiene el resumen, grupos inscritos, kárdex, revalidaciones con referencia de dictamen, bloqueos y movimientos. Se puede imprimir kárdex, constancia y ficha de expediente, o guardarlos como PDF desde el diálogo de impresión. Son documentos de demostración sin firma institucional.

Los bloqueos pueden impedir inscripción, emisión de documentos o ambas; registran área y motivo. La liberación conserva el registro y exige un motivo. Biblioteca y Finanzas no consultan automáticamente adeudos: el personal registra y libera el bloqueo.

Baja temporal, baja definitiva, reingreso, cambio de carrera y justificante conservan el historial. Las bajas y cambios de carrera retiran al alumno de sus grupos actuales y preservan sus calificaciones. Los movimientos se aplican al guardarse, sin programación de bajas futuras. Los justificantes no alteran automáticamente asistencias. El directorio y los reportes utilizan la carrera y estado derivados de estos movimientos.

## Documentos

Los expedientes administrativos de aspirantes y alumnos y Control escolar pueden registrar recepción física (fecha y responsable), subir PDF/PNG/JPEG y registrar revisión. Los archivos se guardan realmente en IndexedDB, con límite de 10 MB y comprobación de firma del formato. Esta comprobación no verifica autenticidad ni sustituye análisis de archivos en servidor.

El seguimiento de aspirantes permite subir archivos por folio. El portal del alumno permite subirlos desde Mi perfil cuando existe un alumno del directorio cuyo correo coincide con la sesión. Los portales no permiten marcar recepción física o revisión administrativa. Los demás datos académicos del portal estudiantil siguen siendo de demostración.

Todos los registros y archivos permanecen en el navegador actual. El folio y los permisos del frontend son controles de demostración; para uso institucional se necesitan identidad, autorización y almacenamiento de archivos en servidor.

## Coordinación y generación

1. Crear carreras, planes, materias y grupos en Control escolar.
2. Asignar áreas y encargados y conceder el permiso de Coordinación académica al usuario existente.
3. Registrar las clases del periodo con docente, aula y horas.
4. Capturar disponibilidad por día y tramo horario y máxima carga semanal de docentes.
5. El administrador institucional genera la propuesta global considerando todas las áreas del periodo.
6. Revisar la tabla antes de guardar; puede exportarse como CSV.

El encargado consulta y prepara los grupos de las carreras asignadas a su correo. La generación global se reserva al instituto para evitar cruces entre áreas. Se rechazan clases fuera de disponibilidad, carga excedida, cruces de docente/grupo/aula, identificadores desconocidos y horas incompletas. Si la oferta cambia, hay que generar otra propuesta.

También hay un generador local por restricciones, explícitamente identificado como tal. No realiza llamadas a IA. El horario usa bloques de una hora de lunes a viernes entre 7:00 y 22:00. Aulas se identifican por nombre normalizado; aún no existe un catálogo de capacidad/equipamiento, bloques dobles o reglas de preferencias pedagógicas.

## Backend OpenAI para desarrollo local

Requiere Node 24. Copiar `.env.example` a `.env`, establecer `OPENAI_API_KEY` y opcionalmente `OPENAI_MODEL`. La clave nunca lleva prefijo `VITE_` y `.env` permanece ignorado por Git. No pegar claves en el chat.

En dos terminales, ejecutar:

```sh
npm run api
npm run dev -- --host 127.0.0.1
```

El servidor escucha en `127.0.0.1:3001`; Vite redirige `/api/horarios`. Tras configurar la clave, reiniciar el backend y recargar Coordinación. Se usa la API Responses de OpenAI con [salida JSON estructurada](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), `store: false` y validación posterior. Solo se envían identificadores técnicos de clases/grupos/materias/docentes, aulas, horas, disponibilidad y cargas; no se envían nombres, expedientes o documentos.

El servidor limita tamaño, frecuencia y generaciones simultáneas, y comprueba origen y token de sesión local. No es un backend de producción: falta autenticación y autorización institucional en servidor, datos compartidos y despliegue. Las llamadas reales requieren una cuenta OpenAI con clave y cuota; no se han realizado sin esa configuración.

## Reportes y verificación

Reportes incluye materias, grupos, bloqueos, movimientos, kárdex y clases del semestre en tablas con búsqueda y exportación CSV, además de los módulos existentes. Las clases respetan el ámbito de coordinación. No se agregaron gráficas.

Comprobar con `npm run build`, `npm run test:school`, `npm run test:directory` y `npm run test:operations`. Las pruebas OpenAI usan respuestas simuladas, sin llamadas ni gastos reales. En navegador se verificaron alta de materia y grupo, asignación de clase/docente, disponibilidad, generación local y guardado, bloqueo de emisión e inscripción, liberación e inscripción, revalidación y archivo digital. Se usaron registros ficticios QA.
