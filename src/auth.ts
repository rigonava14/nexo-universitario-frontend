export type Role = 'institution' | 'admin' | 'teacher' | 'student'

const key = 'nexo-demo-role'
const emailKey = 'nexo-demo-email'
const institutionKey = 'nexo-institution-settings-v1'
export const demoAccounts: { email: string; role: Role; label: string }[] = [
  { email: 'instituto@universidad.edu.mx', role: 'institution', label: 'Admin del instituto' },
  { email: 'admin@universidad.edu.mx', role: 'admin', label: 'Administración' },
  { email: 'docente@universidad.edu.mx', role: 'teacher', label: 'Docente' },
  { email: 'alumno@universidad.edu.mx', role: 'student', label: 'Alumno' },
]

export function getRole(): Role | null {
  const value = sessionStorage.getItem(key)
  return demoAccounts.find((account) => account.role === value)?.role ?? null
}

export function getCurrentEmail(): string | null {
  const stored = sessionStorage.getItem(emailKey)
  if (stored) return stored
  const role = getRole()
  return demoAccounts.find((account) => account.role === role)?.email ?? null
}

export function signIn(email: string, password: string): Role | null {
  if (password !== 'universidad') return null
  const normalizedEmail = email.trim().toLowerCase()
  const account = demoAccounts.find((item) => item.email === normalizedEmail)
  if (account) {
    sessionStorage.setItem(key, account.role)
    sessionStorage.setItem(emailKey, account.email)
    return account.role
  }
  try {
    const stored = localStorage.getItem(institutionKey)
    const settings = stored ? JSON.parse(stored) as { accessControl?: { users?: Array<{ email: string; status: string }> } } : null
    const user = settings?.accessControl?.users?.find((item) => item.email.toLowerCase() === normalizedEmail && item.status === 'Activo')
    if (user) {
      sessionStorage.setItem(key, 'admin')
      sessionStorage.setItem(emailKey, user.email)
      return 'admin'
    }
  } catch { /* Ignore damaged local demo data. */ }
  return null
}

export function signOut() { sessionStorage.removeItem(key); sessionStorage.removeItem(emailKey) }

export function routeForRole(role: Role) {
  if (role === 'student') return '/alumnos/inicio'
  if (role === 'teacher') return '/docentes/inicio'
  if (role === 'institution') return '/admin/institucion'
  return '/admin'
}
