import { useQueryClient } from '@tanstack/react-query'
import { InstitutionSettings } from './institution'
import { SchoolData, effectiveStudentStatus, validSchool } from './school'
import { useDirectoryRecords, useSchoolStore } from './hooks/data'
import { queryKeys } from './hooks/query-client'
import type { Loaded } from './services'

export function useSchool(settings: InstitutionSettings) {
  const queryClient = useQueryClient()
  const store = useSchoolStore(settings)
  const students = useDirectoryRecords('students')
  const teachers = useDirectoryRecords('teachers')
  const data = store.data
  const blocked = store.loadError || students.error || teachers.error
  function setData(next: SchoolData) {
    queryClient.setQueryData<Loaded<SchoolData>>(queryKeys.school, (current) =>
      current ? { ...current, data: next } : current,
    )
  }
  function commit(next: SchoolData) {
    store.setNotice('')
    if (blocked) {
      store.setError(blocked)
      return false
    }
    if (!validSchool(next)) {
      store.setError('Revisa campos, relaciones, códigos duplicados y valores numéricos antes de guardar.')
      return false
    }
    return store.commit(next)
  }
  const effectiveStudents = students.records.map((item) => ({
    ...item,
    status: effectiveStudentStatus(data, item.id, item.status),
    area:
      settings.academicOffer.programs.find(
        (program) => program.id === data.careers.find((career) => career.studentId === item.id)?.programId,
      )?.name ?? item.area,
  }))
  return {
    data,
    setData,
    students: effectiveStudents,
    teachers: teachers.records,
    error: blocked || store.error,
    setError: store.setError,
    notice: store.notice,
    blocked: !!blocked,
    commit,
  }
}
export type SchoolStore = ReturnType<typeof useSchool>
