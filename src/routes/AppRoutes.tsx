import { lazy, ReactNode, Suspense } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import FadeContent from '../components/FadeContent'
import { getRole, routeForRole } from '../auth'
import { useAppState } from '../app-state'
import Login from '../admin/Login'
import { PageLoading } from './PageLoading'
import { RequireAdmin, RequireInstitutionRole, RequirePermission, useSectionPermissions } from './guards'

// Cada portal y módulo se descarga solo cuando se visita.
const AdminLayout = lazy(() => import('../admin/AdminLayout'))
const Dashboard = lazy(() => import('../admin/Dashboard'))
const AdmissionsHome = lazy(() => import('../PublicAdmissions').then((m) => ({ default: m.AdmissionsHome })))
const ApplicantRegistration = lazy(() =>
  import('../PublicAdmissions').then((m) => ({ default: m.ApplicantRegistration })),
)
const ApplicantTracking = lazy(() => import('../PublicAdmissions').then((m) => ({ default: m.ApplicantTracking })))
const StudentPortal = lazy(() => import('../StudentPortal'))
const TeacherPortal = lazy(() => import('../TeacherPortal'))
const AdminApplicants = lazy(() => import('../AdminApplicants'))
const InstitutionSettings = lazy(() => import('../InstitutionSettings'))
const SchoolWorkspace = lazy(() => import('../SchoolWorkspace'))
const Coordination = lazy(() => import('../Coordination'))
const Finance = lazy(() => import('../Finance'))
const Scholarships = lazy(() => import('../Scholarships'))
const UserPermissions = lazy(() => import('../UserPermissions'))
const PeopleDirectory = lazy(() => import('../PeopleDirectory'))
const ProcessModules = lazy(() => import('../ProcessModules'))
const Academies = lazy(() => import('../Academies'))
const EnglishModule = lazy(() => import('../EnglishModule'))
const OperationalReports = lazy(() => import('../OperationalReports'))
const OperationalSettings = lazy(() => import('../OperationalSettings'))

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}

function LoginRoute() {
  const { institution } = useAppState()
  const navigate = useNavigate()
  return <Login institution={institution} onLogin={(role) => navigate(routeForRole(role))} />
}

function AdminLanding() {
  return <Navigate to={getRole() === 'institution' ? '/admin/institucion' : '/admin'} replace />
}

/** Rutas de administración: sección (permiso) → elemento. */
function AdminModules() {
  const state = useAppState()
  const { institution, updateInstitution } = state
  const permissions = useSectionPermissions()
  const section = (name: string, element: ReactNode) => <RequirePermission section={name}>{element}</RequirePermission>

  return (
    <Routes>
      <Route index element={section('Resumen', <Dashboard />)} />
      <Route path="landing" element={<AdminLanding />} />
      <Route
        path="aspirantes"
        element={section(
          'Aspirantes',
          <AdminApplicants applicants={state.applicants} onUpdate={state.updateApplicant} />,
        )}
      />
      <Route
        path="alumnos"
        element={section('Alumnos', <PeopleDirectory key="students" kind="students" settings={institution} />)}
      />
      <Route
        path="docentes"
        element={section('Docentes', <PeopleDirectory key="teachers" kind="teachers" settings={institution} />)}
      />
      <Route
        path="control-escolar"
        element={section('Control escolar', <SchoolWorkspace settings={institution} onSave={updateInstitution} />)}
      />
      <Route
        path="oferta-academica"
        element={section(
          'Oferta académica',
          <SchoolWorkspace initialView="Carreras y planes" settings={institution} onSave={updateInstitution} />,
        )}
      />
      <Route path="coordinacion" element={section('Coordinación académica', <Coordination settings={institution} />)} />
      <Route
        path="finanzas"
        element={section('Finanzas', <Finance settings={institution} onSave={updateInstitution} />)}
      />
      <Route
        path="becas"
        element={section('Becas', <Scholarships settings={institution} onSave={updateInstitution} />)}
      />
      <Route
        path="residencias"
        element={section('Residencias', <ProcessModules key="residencies" kind="residencies" />)}
      />
      <Route
        path="titulacion"
        element={section('Titulación', <ProcessModules key="graduations" kind="graduations" />)}
      />
      <Route path="academias" element={section('Academias', <Academies />)} />
      <Route path="ingles" element={section('Inglés', <EnglishModule settings={institution} />)} />
      <Route path="reportes" element={section('Reportes', <OperationalReports permissions={permissions} />)} />
      <Route path="configuracion" element={section('Configuración', <OperationalSettings />)} />
      <Route
        path="institucion"
        element={
          <RequireInstitutionRole>
            <InstitutionSettings settings={institution} onSave={updateInstitution} onReset={state.restoreInstitution} />
          </RequireInstitutionRole>
        }
      />
      <Route
        path="usuarios-permisos"
        element={
          <RequireInstitutionRole>
            <UserPermissions settings={institution} onSave={updateInstitution} />
          </RequireInstitutionRole>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default function AppRoutes() {
  const state = useAppState()
  return (
    <Routes>
      <Route path="/" element={<LoginRoute />} />
      <Route
        path="/aspirantes/registro"
        element={
          <Page>
            <FadeContent blur>
              <ApplicantRegistration onCreate={state.createApplicant} institution={state.institution} />
            </FadeContent>
          </Page>
        }
      />
      <Route
        path="/aspirantes/seguimiento"
        element={
          <Page>
            <FadeContent blur>
              <ApplicantTracking applicants={state.applicants} institution={state.institution} />
            </FadeContent>
          </Page>
        }
      />
      <Route
        path="/aspirantes/*"
        element={
          <Page>
            <AdmissionsHome institution={state.institution} />
          </Page>
        }
      />
      <Route
        path="/alumnos/*"
        element={
          <Page>
            <StudentPortal />
          </Page>
        }
      />
      <Route
        path="/docentes/*"
        element={
          <Page>
            <TeacherPortal />
          </Page>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <Page>
              <AdminLayout />
            </Page>
          </RequireAdmin>
        }
      >
        <Route path="*" element={<AdminModules />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
