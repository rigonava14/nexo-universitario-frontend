export type Role = 'institution' | 'admin' | 'teacher' | 'student'

const key = 'nexo-demo-role'
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

export function signIn(email: string, password: string): Role | null {
  if (password !== 'universidad') return null
  const account = demoAccounts.find((item) => item.email === email.trim().toLowerCase())
  if (!account) return null
  sessionStorage.setItem(key, account.role)
  return account.role
}

export function signOut() { sessionStorage.removeItem(key) }

export function routeForRole(role: Role) {
  if (role === 'student') return '/alumnos/inicio'
  if (role === 'teacher') return '/docentes/inicio'
  if (role === 'institution') return '/admin/institucion'
  return '/admin'
}
