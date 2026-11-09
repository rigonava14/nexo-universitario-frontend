import { demoAccounts, Role } from '../../auth'
import type { SessionService } from '../index'
import { readInstitutionSettings } from './institution'

import { migrateLegacyKey } from './migrate'

const roleKey = 'campusone-session-role'
const emailKey = 'campusone-session-email'

function migrateSession() {
  migrateLegacyKey(sessionStorage, 'nexo-demo-role', roleKey)
  migrateLegacyKey(sessionStorage, 'nexo-demo-email', emailKey)
}

/** Sesión de demostración en sessionStorage. Se reemplaza por Better Auth en el sprint 3. */
export const localSessionService: SessionService = {
  getRole() {
    migrateSession()
    const value = sessionStorage.getItem(roleKey)
    return demoAccounts.find((account) => account.role === value)?.role ?? null
  },
  getCurrentEmail() {
    migrateSession()
    const stored = sessionStorage.getItem(emailKey)
    if (stored) return stored
    const role = this.getRole()
    return demoAccounts.find((account) => account.role === role)?.email ?? null
  },
  signIn(email, password): Role | null {
    if (password !== 'universidad') return null
    const normalizedEmail = email.trim().toLowerCase()
    const account = demoAccounts.find((item) => item.email === normalizedEmail)
    if (account) {
      sessionStorage.setItem(roleKey, account.role)
      sessionStorage.setItem(emailKey, account.email)
      return account.role
    }
    try {
      const user = readInstitutionSettings().accessControl.users.find(
        (item) => item.email.toLowerCase() === normalizedEmail && item.status === 'Activo',
      )
      if (user) {
        sessionStorage.setItem(roleKey, 'admin')
        sessionStorage.setItem(emailKey, user.email)
        return 'admin'
      }
    } catch {
      /* Ignore damaged local demo data. */
    }
    return null
  },
  signOut() {
    sessionStorage.removeItem(roleKey)
    sessionStorage.removeItem(emailKey)
  },
}
