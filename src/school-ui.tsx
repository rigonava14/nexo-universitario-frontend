import { useEffect, useRef, useState } from 'react'
import { loadDirectory } from './directory'
import { InstitutionSettings } from './institution'
import { SchoolData, effectiveStudentStatus, loadSchool, schoolKey, validSchool } from './school'
export function useSchool(settings: InstitutionSettings) {
  const [loaded] = useState(() => loadSchool(settings))
  const [data, setData] = useState(loaded.data)
  const [students] = useState(() => loadDirectory('students'))
  const [teachers] = useState(() => loadDirectory('teachers'))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const expected = useRef<string | null>(null)
  const blocked = loaded.error || students.error || teachers.error
  useEffect(() => { try { expected.current = localStorage.getItem(schoolKey) } catch { setError('El almacenamiento está bloqueado.') } }, [])
  function commit(next: SchoolData) {
    setNotice('')
    if (blocked) { setError(blocked); return false }
    if (!validSchool(next)) { setError('Revisa campos, relaciones, códigos duplicados y valores numéricos antes de guardar.'); return false }
    try {
      if (localStorage.getItem(schoolKey) !== expected.current) { setError('Los datos cambiaron en otra pestaña. Recarga antes de guardar.'); return false }
      const serialized = JSON.stringify(next); localStorage.setItem(schoolKey, serialized); expected.current = serialized; setData(next); setError(''); setNotice('Cambios guardados en este navegador.'); return true
    } catch { setError('No se pudo guardar. El estado anterior se conservó. Revisa el espacio disponible del navegador.'); return false }
  }
  const effectiveStudents = students.records.map((item) => ({ ...item, status: effectiveStudentStatus(data, item.id, item.status), area: settings.academicOffer.programs.find((program) => program.id === data.careers.find((career) => career.studentId === item.id)?.programId)?.name ?? item.area }))
  return { data, setData, students: effectiveStudents, teachers: teachers.records, error: blocked || error, setError, notice, blocked: !!blocked, commit }
}
export type SchoolStore = ReturnType<typeof useSchool>
