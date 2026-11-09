import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Applicant, loadApplicants, saveApplicants } from './admissions'
import {
  InstitutionSettings,
  applyInstitutionSettings,
  loadInstitutionSettings,
  resetInstitutionSettings,
  saveInstitutionSettings,
} from './institution'

type AppState = {
  institution: InstitutionSettings
  updateInstitution: (settings: InstitutionSettings) => void
  restoreInstitution: () => void
  applicants: Applicant[]
  updateApplicant: (applicant: Applicant) => void
  createApplicant: (applicant: Applicant) => void
}

const AppStateContext = createContext<AppState | null>(null)

/** Estado compartido entre portales. En la tarea 0.12 sus lecturas y escrituras pasan a src/services/. */
export function AppStateProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants] = useState<Applicant[]>(loadApplicants)
  const [institution, setInstitution] = useState<InstitutionSettings>(loadInstitutionSettings)
  useEffect(() => applyInstitutionSettings(institution), [institution])

  const value: AppState = {
    institution,
    updateInstitution(settings) {
      saveInstitutionSettings(settings)
      setInstitution(settings)
    },
    restoreInstitution() {
      setInstitution(resetInstitutionSettings())
    },
    applicants,
    updateApplicant(updated) {
      setApplicants((current) => {
        const next = current.map((item) => (item.id === updated.id ? updated : item))
        saveApplicants(next)
        return next
      })
    },
    createApplicant(applicant) {
      setApplicants((current) => {
        const next = [applicant, ...current]
        saveApplicants(next)
        return next
      })
    },
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState debe usarse dentro de AppStateProvider')
  return state
}
