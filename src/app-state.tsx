import { createContext, ReactNode, useContext, useEffect } from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Applicant } from './admissions'
import { InstitutionSettings, applyInstitutionSettings } from './institution'
import { services } from './services'
import { queryKeys } from './hooks/query-client'

type AppState = {
  institution: InstitutionSettings
  /** Aplica el cambio al momento y lo guarda; si el guardado falla, revierte y rechaza la promesa. */
  updateInstitution: (settings: InstitutionSettings) => Promise<void>
  restoreInstitution: () => void
  applicants: Applicant[]
  updateApplicant: (applicant: Applicant) => void
  createApplicant: (applicant: Applicant) => void
}

const AppStateContext = createContext<AppState | null>(null)

/** Configuración institucional y aspirantes, compartidos entre portales. Los datos llegan por src/services. */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: institution } = useSuspenseQuery({
    queryKey: queryKeys.institution,
    queryFn: () => services.institution.load(),
  })
  const { data: applicants } = useSuspenseQuery({
    queryKey: queryKeys.applicants,
    queryFn: () => services.admissions.list(),
  })
  useEffect(() => applyInstitutionSettings(institution), [institution])

  function setInstitution(settings: InstitutionSettings) {
    queryClient.setQueryData(queryKeys.institution, settings)
    // El catálogo de control escolar se arma con los planes: se vuelve a leer al abrir el módulo de nuevo,
    // no a mitad de una edición.
    void queryClient.invalidateQueries({ queryKey: queryKeys.school, refetchType: 'none' })
  }

  function setApplicants(update: (current: Applicant[]) => Applicant[]) {
    const next = update(queryClient.getQueryData<Applicant[]>(queryKeys.applicants) ?? applicants)
    queryClient.setQueryData(queryKeys.applicants, next)
    void services.admissions.save(next)
  }

  const value: AppState = {
    institution,
    updateInstitution(settings) {
      const previous = queryClient.getQueryData<InstitutionSettings>(queryKeys.institution) ?? institution
      setInstitution(settings)
      return services.institution.save(settings).catch((error: unknown) => {
        setInstitution(previous)
        throw error
      })
    },
    restoreInstitution() {
      void services.institution.reset().then(setInstitution)
    },
    applicants,
    updateApplicant(updated) {
      setApplicants((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    },
    createApplicant(applicant) {
      setApplicants((current) => [applicant, ...current])
    },
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState debe usarse dentro de AppStateProvider')
  return state
}
