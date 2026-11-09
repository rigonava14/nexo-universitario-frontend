import { Applicant, initialApplicants } from '../../admissions'
import type { AdmissionsService } from '../index'

import { migrateLegacyKey } from './migrate'

const applicantsKey = 'campusone-applicants-v1'
const legacyApplicantsKey = 'nexo-applicants'

export const localAdmissionsService: AdmissionsService = {
  async list() {
    migrateLegacyKey(localStorage, legacyApplicantsKey, applicantsKey)
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
