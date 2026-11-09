# Normativa mexicana relevante

Resumen de trabajo, no asesoría legal ni fiscal. **Antes de implementar cualquier obligación, confirma la versión vigente en la fuente oficial y con el contador o abogado del proyecto.** Si algo no está aquí ni en una fuente oficial, pregunta; no lo inventes.

## SEP

| Obligación                               | Qué implica para el sistema                                                                                                      | Fuente a verificar                |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| RVOE por programa                        | Catálogo de RVOE con clave y fechas; aparece en documentos y CFDI                                                                | SEP / autoridad educativa estatal |
| Normas de control escolar del subsistema | Reglas de evaluación, extraordinarios, bajas y documentos varían por subsistema (DGB, DGETI, CECyTE…)                            | dgair.sep.gob.mx                  |
| Certificado electrónico de bachillerato  | Tres tipos (terminación, formación profesional, parcial) con folio y QR, consultables en SIGED; aplica a generaciones del MCCEMS | siged.sep.gob.mx, DGAIR           |
| Título electrónico                       | XML firmado con e.firma de los responsables de la institución, registrado ante la DGP; obligatorio desde octubre de 2018         | DGP                               |
| Formato 911                              | Matrícula por sexo, edad, grado; egreso; inicio y fin de ciclo                                                                   | SEP, estadística educativa        |

## SAT

| Obligación                   | Qué implica                                                                                                                                    | Fuente a verificar         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| CFDI 4.0 de colegiaturas     | Complemento IEDU con nombre, CURP, nivel educativo del alumno y clave RVOE; uso D10. Aplica de preescolar a bachillerato y profesional técnico | sat.gob.mx (estándar iedu) |
| Factura global y cancelación | Pagos sin datos fiscales van a factura global; cancelación con motivo                                                                          | Anexo 20 SAT               |
| CFDI de nómina               | Complemento de nómina 1.2; la revisión E rige desde el 1 de enero de 2026                                                                      | sat.gob.mx                 |
| Catálogos SAT                | Productos/servicios, régimen fiscal, uso de CFDI, formas de pago; cambian con frecuencia                                                       | Catálogos del Anexo 20     |

Decisión del plan: el timbrado se hace con un PAC por API; CampusOne arma el XML y guarda el resultado. La nómina empieza como prenómina exportable (ver `docs/PLAN.md`, fase 4).

## IMSS

Movimientos afiliatorios (alta, baja, modificación de salario) vía IDSE y cálculo de cuotas con SUA. CampusOne genera archivos de movimientos; no se conecta directo al IMSS.

## Datos personales

- Nueva LFPDPPP publicada el 20 de marzo de 2025 (vigente desde el 21); la autoridad es la Secretaría Anticorrupción y Buen Gobierno.
- La escuela es responsable; CampusOne es encargado: contrato de encargo por institución.
- Aviso de privacidad por institución, consentimiento, derechos ARCO, aviso de transferencias si los datos se alojan fuera de México, protocolo de vulneraciones.
- Datos sensibles (salud, discapacidad) cifrados y con acceso restringido.
- Instituciones públicas se rigen por la ley general para sujetos obligados.
