import { services } from './services'

export type Role = 'institution' | 'admin' | 'teacher' | 'student'

export const demoAccounts: { email: string; role: Role; label: string }[] = [
  { email: 'instituto@universidad.edu.mx', role: 'institution', label: 'Admin del instituto' },
  { email: 'admin@universidad.edu.mx', role: 'admin', label: 'Administración' },
  { email: 'docente@universidad.edu.mx', role: 'teacher', label: 'Docente' },
  { email: 'alumno@universidad.edu.mx', role: 'student', label: 'Alumno' },
]

// La sesión vive en src/services (adaptador local de demostración).
export function getRole(): Role | null {
  return services.session.getRole()
}

export function getCurrentEmail(): string | null {
  return services.session.getCurrentEmail()
}

export function signIn(email: string, password: string): Role | null {
  return services.session.signIn(email, password)
}

export function signOut() {
  services.session.signOut()
}

export function routeForRole(role: Role) {
  if (role === 'student') return '/alumnos/inicio'
  if (role === 'teacher') return '/docentes/inicio'
  if (role === 'institution') return '/admin/institucion'
  return '/admin'
}
