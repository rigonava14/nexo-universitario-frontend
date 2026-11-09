import { Suspense, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Building2, ChevronDown, Menu, Search } from 'lucide-react'
import FadeContent from '../components/FadeContent'
import { getCurrentEmail, getRole, Role, signOut } from '../auth'
import { useAppState } from '../app-state'
import { useSectionPermissions } from '../routes/guards'
import Sidebar from './Sidebar'
import { labelForPath, routeForLabel } from './navigation'
import { PageLoading } from '../routes/PageLoading'

export default function AdminLayout() {
  const { institution } = useAppState()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const role = getRole() as Role
  const permissions = useSectionPermissions()
  const currentEmail = getCurrentEmail()
  const currentAccessUser = institution.accessControl.users.find(
    (user) => user.email.toLowerCase() === currentEmail?.toLowerCase(),
  )

  return (
    <div className="app-shell">
      <Sidebar
        active={labelForPath(location.pathname)}
        onSelect={(label) => navigate(routeForLabel(label))}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={role}
        permissions={permissions}
        userName={currentAccessUser?.name}
      />
      <div className="app-content">
        <header>
          <button className="icon-button menu-button" aria-label="Abrir menú" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="institution-selector">
            <Building2 size={18} />
            <span>{institution.name}</span>
            <ChevronDown size={15} />
          </div>
          <div className="header-actions">
            <label className="search-box">
              <Search size={18} />
              <input placeholder="Buscar alumno, trámite..." />
            </label>
            <button className="icon-button notification" aria-label="Notificaciones">
              <Bell size={20} />
              <i />
            </button>
            <button
              className="header-signout"
              onClick={() => {
                signOut()
                navigate('/')
              }}
            >
              Cerrar sesión
            </button>
            <div className="header-avatar">
              {role === 'institution' ? institution.shortName.slice(0, 2).toUpperCase() : 'LA'}
            </div>
          </div>
        </header>
        <main className="page-content">
          <FadeContent key={location.pathname} blur>
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </FadeContent>
        </main>
      </div>
      {sidebarOpen && (
        <button className="sidebar-overlay" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
