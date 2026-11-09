import { ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getCurrentEmail, getRole, routeForRole, signOut } from '../auth'
import { allPermissionSections, permissionsForUser, routeBySection } from '../access-control'
import { useAppState } from '../app-state'

/** Permisos de secciones del usuario actual. El administrador del instituto tiene todas. */
export function useSectionPermissions() {
  const { institution } = useAppState()
  const role = getRole()
  return role === 'institution' ? allPermissionSections : permissionsForUser(institution, getCurrentEmail())
}

/**
 * Solo personal administrativo (rol admin o institution). Las guardas del frontend ordenan la navegación;
 * la autorización real vivirá en la API (fase 1).
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const role = getRole()
  const permissions = useSectionPermissions()
  if (!role) return <Navigate to="/" replace />
  if (role !== 'admin' && role !== 'institution') return <Navigate to={routeForRole(role)} replace />
  if (role === 'admin' && !permissions.length)
    return (
      <main className="empty-state">
        <h1>Sin módulos asignados</h1>
        <p>Solicita al administrador del instituto que revise tu usuario y rol.</p>
        <button
          className="primary-button"
          onClick={() => {
            signOut()
            navigate('/')
          }}
        >
          Cerrar sesión
        </button>
      </main>
    )
  return <>{children}</>
}

/** Sección asignable por rol. Sin permiso, envía a la primera sección permitida. */
export function RequirePermission({ section, children }: { section: string; children: ReactNode }) {
  const permissions = useSectionPermissions()
  if (getRole() === 'admin' && !permissions.includes(section))
    return <Navigate to={routeBySection[permissions[0]] ?? '/admin'} replace />
  return <>{children}</>
}

/** Secciones exclusivas del administrador del instituto. */
export function RequireInstitutionRole({ children }: { children: ReactNode }) {
  if (getRole() !== 'institution') return <Navigate to="/admin" replace />
  return <>{children}</>
}
