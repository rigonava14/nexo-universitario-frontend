import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { routeBySection } from '../access-control'

type IconType = typeof LayoutDashboard

type NavItem = {
  label: string
  icon: IconType
}

export const navigation: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'General',
    items: [
      { label: 'Resumen', icon: LayoutDashboard },
      { label: 'Aspirantes', icon: UserPlus },
      { label: 'Alumnos', icon: Users },
      { label: 'Docentes', icon: BookOpen },
    ],
  },
  {
    title: 'Gestión universitaria',
    items: [
      { label: 'Control escolar', icon: ClipboardCheck },
      { label: 'Coordinación académica', icon: CalendarDays },
      { label: 'Oferta académica', icon: CalendarDays },
      { label: 'Finanzas', icon: CircleDollarSign },
      { label: 'Becas', icon: Award },
      { label: 'Residencias', icon: BriefcaseBusiness },
      { label: 'Titulación', icon: GraduationCap },
      { label: 'Academias', icon: Building2 },
      { label: 'Inglés', icon: MessageSquareText },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Reportes', icon: TrendingUp },
      { label: 'Usuarios y permisos', icon: ShieldCheck },
      { label: 'Personalización institucional', icon: Settings },
      { label: 'Configuración', icon: Settings },
    ],
  },
]

/** Secciones exclusivas del administrador del instituto (no se asignan por rol). */
export const institutionOnlyRoutes: Record<string, string> = {
  'Personalización institucional': '/admin/institucion',
  'Usuarios y permisos': '/admin/usuarios-permisos',
}

export function routeForLabel(label: string) {
  return institutionOnlyRoutes[label] ?? routeBySection[label] ?? '/admin'
}

export function labelForPath(pathname: string) {
  const all = { ...routeBySection, ...institutionOnlyRoutes }
  return Object.entries(all).find(([, route]) => route === pathname)?.[0] ?? 'Resumen'
}
