import { useState } from 'react'
import { getCurrentEmail, getRole } from './auth'
import { Download, Search } from 'lucide-react'
import { loadDirectory } from './directory'
import { downloadCsv, englishResult, graduationRequirements, loadOperations } from './operations'
import { OperationEmpty, OperationFeedback, OperationSummary, personName } from './operation-ui'
import './directory.css'
import { loadInstitutionSettings } from './institution'
import { effectiveStudentStatus, loadSchool } from './school'

type Report = { name: string; headers: string[]; rows: (string | number | null)[][]; error: string }
const reportSections = ['Alumnos', 'Docentes', 'Residencias', 'Titulación', 'Academias', 'Inglés', 'Materias', 'Grupos', 'Bloqueos', 'Movimientos escolares', 'Kárdex', 'Clases del semestre']
export default function OperationalReports({ permissions }: { permissions: string[] }) {
  const allowed = reportSections.filter((section) => permissions.includes(['Materias', 'Grupos', 'Bloqueos', 'Movimientos escolares', 'Kárdex'].includes(section) ? 'Control escolar' : section === 'Clases del semestre' ? 'Coordinación académica' : section))
  const [source, setSource] = useState(allowed[0] ?? '')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [operations] = useState(loadOperations)
  const [students] = useState(() => loadDirectory('students'))
  const [teachers] = useState(() => loadDirectory('teachers'))
  const [institution] = useState(loadInstitutionSettings)
  const [school] = useState(() => loadSchool(institution))
  const data = operations.data
  function getReport(): Report {
    if (!allowed.includes(source)) return { name: 'Sin acceso', headers: [], rows: [], error: '' }
    const academic = school.data
    const schoolError = school.error || students.error || teachers.error
    const subjectName = (id: string) => academic.subjects.find((item) => item.id === id)?.name ?? id
    const groupName = (id: string) => academic.groups.find((item) => item.id === id)?.code ?? id
    if (source === 'Materias') return { name: source, headers: ['Clave', 'Materia', 'Créditos', 'Horas semanales'], rows: academic.subjects.map((item) => [item.code, item.name, item.credits, item.hours]), error: schoolError }
    if (source === 'Grupos') return { name: source, headers: ['Grupo', 'Carrera', 'Semestre', 'Periodo', 'Cupo', 'Inscritos'], rows: academic.groups.map((item) => [item.code, institution.academicOffer.programs.find((program) => program.id === item.programId)?.name ?? item.programId, item.semester, item.period, item.capacity, item.studentIds.length]), error: schoolError }
    if (source === 'Bloqueos') return { name: source, headers: ['Alumno', 'Área', 'Motivo', 'Alcance', 'Estado', 'Liberación'], rows: academic.blocks.map((item) => [personName(students.records, item.studentId), item.area, item.reason, item.scope, item.active ? 'Activo' : 'Liberado', item.releaseReason]), error: schoolError }
    if (source === 'Movimientos escolares') return { name: source, headers: ['Alumno', 'Movimiento', 'Fecha', 'Motivo', 'Carrera destino', 'Responsable'], rows: academic.movements.map((item) => [personName(students.records, item.studentId), item.type, item.date, item.reason, institution.academicOffer.programs.find((program) => program.id === item.programId)?.name ?? '', item.author]), error: schoolError }
    if (source === 'Kárdex') return { name: source, headers: ['Alumno', 'Materia', 'Periodo', 'Calificación', 'Origen', 'Dictamen'], rows: academic.grades.map((item) => [personName(students.records, item.studentId), subjectName(item.subjectId), item.period, item.grade, item.origin, item.reference]), error: schoolError }
    if (source === 'Clases del semestre') return { name: source, headers: ['Grupo', 'Materia', 'Docente', 'Horas', 'Aula'], rows: academic.requests.filter((item) => getRole() === 'institution' || academic.areas.some((area) => area.programIds.includes(academic.groups.find((group) => group.id === item.groupId)?.programId ?? '') && area.email.toLowerCase() === getCurrentEmail()?.toLowerCase())).map((item) => [groupName(item.groupId), subjectName(item.subjectId), personName(teachers.records, item.teacherId), item.hours, item.room]), error: schoolError }
    if (source === 'Alumnos' || source === 'Docentes') {
      const directory = source === 'Alumnos' ? students : teachers
      return { name: source, headers: ['Identificador', 'Nombre', 'Correo', 'Área', source === 'Alumnos' ? 'Semestre' : 'Grado académico', 'Estado'], rows: directory.records.map((item) => [item.number, item.name, item.email, source === 'Alumnos' ? institution.academicOffer.programs.find((program) => program.id === academic.careers.find((career) => career.studentId === item.id)?.programId)?.name ?? item.area : item.area, source === 'Alumnos' ? item.semester : item.qualification, source === 'Alumnos' ? effectiveStudentStatus(academic, item.id, item.status) : item.status]), error: directory.error || (source === 'Alumnos' ? school.error : '') }
    }
    const error = operations.error || teachers.error || (source === 'Academias' ? '' : students.error)
    if (source === 'Residencias') return { name: source, headers: ['Alumno', 'Proyecto', 'Empresa', 'Asesor', 'Inicio', 'Término', 'Horas', 'Estado', 'Evidencia'], rows: data.residencies.map((item) => [personName(students.records, item.studentId), item.project, item.company, personName(teachers.records, item.teacherId), item.start, item.end, item.hours, item.status, item.evidence]), error }
    if (source === 'Titulación') return { name: source, headers: ['Alumno', 'Modalidad', 'Trabajo', 'Asesor', 'Fecha', 'Requisitos revisados', 'Estado'], rows: data.graduations.map((item) => [personName(students.records, item.studentId), item.modality, item.title, personName(teachers.records, item.advisorId), item.date, `${item.requirements.length}/${graduationRequirements.length}`, item.status]), error }
    if (source === 'Academias') return { name: source, headers: ['Academia', 'Área', 'Responsable', 'Integrantes', 'Estado', 'Acuerdos'], rows: data.academies.map((item) => [item.name, item.area, personName(teachers.records, item.coordinatorId), item.memberIds.map((id) => personName(teachers.records, id)).join('; '), item.status, item.agreements]), error }
    return { name: source, headers: ['Grupo', 'Periodo', 'Nivel', 'Docente', 'Alumno', 'Calificación', 'Asistencia (%)', 'Resultado'], rows: data.englishEnrollments.map((item) => { const group = data.englishGroups.find((entry) => entry.id === item.groupId)!; return [group.code, group.period, group.level, personName(teachers.records, group.teacherId), personName(students.records, item.studentId), item.grade, item.attendance, englishResult(item, data.settings)] }), error }
  }
  const report = getReport()
  const rows = report.error ? [] : report.rows.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()))
  return <section className="operation-module"><div className="module-heading"><div><p className="date-label">DATOS OPERATIVOS</p><h1>Reportes</h1><p>Consulta y exporta registros de los módulos autorizados para tu usuario.</p></div><button className="primary-button compact" disabled={!rows.length || !!report.error || !allowed.includes(source)} onClick={() => { downloadCsv(`CampusOne-${source}`, report.headers, rows); setNotice(`${rows.length} registros preparados para descarga en CSV.`) }}><Download size={17} />Exportar CSV</button></div>
    <p className="directory-local">Demostración local · La exportación incluye únicamente los registros filtrados.</p><OperationFeedback error={report.error} notice={notice} /><OperationSummary items={[{ label: 'Fuente', value: report.name }, { label: 'Registros', value: report.error ? 0 : report.rows.length }, { label: 'Filtrados', value: rows.length }]} />
    <div className="academic-catalog"><div className="operation-toolbar"><select aria-label="Fuente del reporte" value={source} onChange={(event) => { setSource(event.target.value); setQuery(''); setNotice('') }}>{!allowed.length && <option value="">Sin fuentes autorizadas</option>}{allowed.map((item) => <option key={item}>{item}</option>)}</select><label><Search size={17} /><input aria-label="Buscar en el reporte" placeholder="Filtrar registros" value={query} onChange={(event) => { setQuery(event.target.value); setNotice('') }} /></label></div><div className="directory-table-wrap"><table><caption>{rows.length} registros de {report.name}</caption><thead><tr>{report.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell ?? 'Sin evaluar'}</td>)}</tr>)}</tbody></table></div>{!rows.length && <OperationEmpty>{!allowed.length ? 'Tu rol necesita acceso a un módulo de origen para consultar sus reportes.' : report.error ? 'Resuelve el error de lectura para consultar los datos existentes.' : 'No hay registros para esta fuente o búsqueda.'}</OperationEmpty>}</div>
  </section>
}
