import { InstitutionSettings } from './institution'

export const permissionGroups = [
  { name: 'General', sections: ['Resumen', 'Aspirantes', 'Alumnos', 'Docentes'] },
  { name: 'Gestión universitaria', sections: ['Control escolar', 'Oferta académica', 'Finanzas', 'Becas', 'Residencias', 'Titulación', 'Academias', 'Inglés'] },
  { name: 'Sistema', sections: ['Reportes', 'Configuración'] },
]

export const allPermissionSections = permissionGroups.flatMap((group) => group.sections)

export const routeBySection: Record<string, string> = {
  Resumen: '/admin', Aspirantes: '/admin/aspirantes', Alumnos: '/admin', Docentes: '/admin',
  'Control escolar': '/admin/control-escolar', 'Oferta académica': '/admin/oferta-academica', Finanzas: '/admin/finanzas', Becas: '/admin/becas',
  Residencias: '/admin', Titulación: '/admin', Academias: '/admin', Inglés: '/admin', Reportes: '/admin', Configuración: '/admin',
}

export function permissionsForUser(settings: InstitutionSettings, email: string | null) {
  if (!email) return []
  const user = settings.accessControl.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.status === 'Activo')
  const role = settings.accessControl.roles.find((item) => item.id === user?.roleId && item.status === 'Activo')
  return role?.permissions ?? []
}
