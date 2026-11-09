import { Applicant, initialApplicants } from '../../admissions'
import type { AdmissionsService } from '../index'

const applicantsKey = 'nexo-applicants'

export const localAdmissionsService: AdmissionsService = {
  async list() {
    try {
      const stored = localStorage.getItem(applicantsKey)
      return stored ? (JSON.parse(stored) as Applicant[]) : initialApplicants
    } catch {
      return initialApplicants
    }
  },
  async save(applicants) {
    localStorage.setItem(applicantsKey, JSON.stringify(applicants))
  },
}
