import { GraduationCap, MoreHorizontal, X } from 'lucide-react'
import { Role } from '../auth'
import { navigation } from './navigation'

export default function Sidebar({
  active,
  onSelect,
  open,
  onClose,
  role,
  permissions,
  userName,
}: {
  active: string
  onSelect: (label: string) => void
  open: boolean
  onClose: () => void
  role: Role
  permissions: string[]
  userName?: string
}) {
  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <GraduationCap size={24} />
        </div>
        <div>
          <strong>CampusOne</strong>
          <span>Universitario</span>
        </div>
        <button className="icon-button sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <nav>
        {navigation.map((section) => (
          <div className="nav-section" key={section.title}>
            <p>{section.title}</p>
            {section.items
              .filter(
                (item) =>
                  role === 'institution' ||
                  (item.label !== 'Personalización institucional' &&
                    item.label !== 'Usuarios y permisos' &&
                    permissions.includes(item.label)),
              )
              .map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className={active === item.label ? 'active' : ''}
                    onClick={() => {
                      onSelect(item.label)
                      onClose()
                    }}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">LA</div>
        <div>
          <strong>{role === 'institution' ? 'Instituto' : userName || 'Usuario administrativo'}</strong>
          <span>{role === 'institution' ? 'Administrador institucional' : 'Acceso por rol'}</span>
        </div>
        <MoreHorizontal size={18} />
      </div>
    </aside>
  )
}
