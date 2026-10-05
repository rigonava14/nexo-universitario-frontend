import { InstitutionSettings } from './institution'

export const permissionGroups = [
  { name: 'General', sections: ['Resumen', 'Aspirantes', 'Alumnos', 'Docentes'] },
  { name: 'Gestión universitaria', sections: ['Control escolar', 'Coordinación académica', 'Oferta académica', 'Finanzas', 'Becas', 'Residencias', 'Titulación', 'Academias', 'Inglés'] },
  { name: 'Sistema', sections: ['Reportes', 'Configuración'] },
]

export const allPermissionSections = permissionGroups.flatMap((group) => group.sections)

export const routeBySection: Record<string, string> = {
  Resumen: '/admin', Aspirantes: '/admin/aspirantes', Alumnos: '/admin/alumnos', Docentes: '/admin/docentes',
  'Control escolar': '/admin/control-escolar', 'Oferta académica': '/admin/oferta-academica', Finanzas: '/admin/finanzas', Becas: '/admin/becas',
  'Coordinación académica': '/admin/coordinacion',
  Residencias: '/admin/residencias', Titulación: '/admin/titulacion', Academias: '/admin/academias', Inglés: '/admin/ingles', Reportes: '/admin/reportes', Configuración: '/admin/configuracion',
}

export function permissionsForUser(settings: InstitutionSettings, email: string | null) {
  if (!email) return []
  const user = settings.accessControl.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.status === 'Activo')
  const role = settings.accessControl.roles.find((item) => item.id === user?.roleId && item.status === 'Activo')
  return role?.permissions ?? []
}
