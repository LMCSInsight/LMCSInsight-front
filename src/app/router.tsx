import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import {
  getDashboardPath,
  getResearcherDashboardPath,
  getAssistantSupervisionNewPath,
  getAssistantSupervisionDetailPath,
} from '@/config/routes'
import AssistantActivityPage from '@/features/assistant-portal/pages/AssistantActivityPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import { useAuthContext } from '@/shared/context/AuthContext'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ResearcherPortalLayout } from '@/layouts/ResearcherPortalLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import LoginPage from '@/features/auth/pages/LoginPage'
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage'
import SupervisionListPage from '@/features/supervisions/pages/SupervisionListPage'
import SupervisionDetailPage from '@/features/supervisions/pages/SupervisionDetailPage'
import CreateSupervisionPage from '@/features/supervisions/pages/CreateSupervisionPage'
import EditSupervisionPage from '@/features/supervisions/pages/EditSupervisionPage'
import {
  StudentManagementPage,
  StudentDetailPage,
  EditStudentPage,
  RegisterStudentPage,
} from '@/features/students/pages'
import ThemeManagementPage from '@/features/themes/pages/ThemeManagementPage'
import ThemeRegisterPage from '@/features/themes/pages/ThemeRegisterPage'
import ThemeDetailPage from '@/features/themes/pages/ThemeDetailPage'
import ThemeEditPage from '@/features/themes/pages/ThemeEditPage'
import ProfileSettingsPage from '@/features/profile/pages/ProfileSettingsPage'
import StatisticsReportsPage from '@/features/statistics/pages/StatisticsReportsPage'
import AdminDashboardPage from '@/features/admin/pages/AdminDashboardPage'
import UserManagementPage from '@/features/admin/pages/UserManagementPage'
import CreateUserPage from '@/features/admin/pages/CreateUserPage'
import EditUserPage from '@/features/admin/pages/EditUserPage'
import TeamManagementPage from '@/features/admin/pages/TeamManagementPage'
import CreateTeamPage from '@/features/admin/pages/CreateTeamPage'
import TeamDetailPage from '@/features/admin/pages/TeamDetailPage'
import EditTeamPage from '@/features/admin/pages/EditTeamPage'
import AuditLogPage from '@/features/admin/pages/AuditLogPage'
import { AdminPortalLayout } from '@/layouts/AdminPortalLayout'
import ResearcherDashboard from '@/features/dashboard/pages/ResearcherDashboard'
import DirectorDashboard from '@/features/dashboard/pages/DirectorDashboard'
import AssistantDashboard from '@/features/dashboard/pages/AssistantDashboard'
import { AssistantPortalLayout } from '@/layouts/AssistantPortalLayout'
// AdminDashboard stub replaced by AdminDashboardPage
import TableChercheurs from '@/features/direction/TableChercheurs'
import DetailChercheur from '@/features/direction/DetailChercheurs'
import { DirectionPortalLayout } from '@/layouts/DirectionPortalLayout'
import DirectionSearchPage from '@/features/direction/pages/DirectionSearchPage'
import DirectionReportsPage from '@/features/direction/pages/DirectionReportsPage'
import DirectionProfilePage from '@/features/direction/pages/DirectionProfilePage'
import ValidationQueuePage from '@/features/validation/pages/ValidationQueuePage'
import ValidationDetailPage from '@/features/validation/pages/ValidationDetailPage'
import ValidationHistoryPage from '@/features/validation/pages/ValidationHistoryPage'
import AssistantSupervisionListPage from '@/features/validation/pages/AssistantSupervisionListPage'
import AssistantProfilePage from '@/features/validation/pages/AssistantProfilePage'

/** Guard: ensure current user is the researcher for :userId, then render ResearcherPortalLayout (with Outlet). */
function ResearcherPortalGuard() {
  const { userId } = useParams<{ userId: string }>()
  const { currentUser } = useAuthContext()
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  if (currentUser.role !== 'RESEARCHER') {
    return (
      <Navigate to={getDashboardPath(currentUser.role, currentUser)} replace />
    )
  }
  if (!userId || userId !== currentUser.id) {
    return <Navigate to={getResearcherDashboardPath(currentUser.id)} replace />
  }
  return <ResearcherPortalLayout />
}

function ResearcherRedirectToOwnPortal() {
  const { currentUser } = useAuthContext()
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }
  if (currentUser.role !== 'RESEARCHER') {
    return (
      <Navigate to={getDashboardPath(currentUser.role, currentUser)} replace />
    )
  }
  return <Navigate to={getResearcherDashboardPath(currentUser.id)} replace />
}

function LegacyResearcherPortalRedirect() {
  const { userId } = useParams<{ userId: string }>()
  const params = useParams()
  const nestedPath = params['*']

  if (!userId) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const targetSuffix = nestedPath ? `/${nestedPath}` : '/dashboard'
  return <Navigate to={`/researcher/${userId}${targetSuffix}`} replace />
}

function LegacyDashboardRoleRedirect() {
  const params = useParams()
  const role = params.role
  const nestedPath = params['*']

  if (!role) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const targetSuffix = nestedPath ? `/${nestedPath}` : '/dashboard'
  return <Navigate to={`/${role}${targetSuffix}`} replace />
}

/** Supervision creation is assistant-only; old researcher URLs redirect. */
function AssistantCreateSupervisionRedirect() {
  return <Navigate to={getAssistantSupervisionNewPath()} replace />
}

function AssistantValidationToSupervisionRedirect() {
  const { supervisionId } = useParams<{ supervisionId: string }>()
  if (!supervisionId) {
    return <Navigate to={ROUTES.ASSISTANT_ACTIVITY} replace />
  }
  return (
    <Navigate to={getAssistantSupervisionDetailPath(supervisionId)} replace />
  )
}

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.LOGIN} replace /> },
    ],
  },
  {
    path: ROUTES.AUTH,
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'researcher',
        element: (
          <ProtectedRoute>
            <ResearcherRedirectToOwnPortal />
          </ProtectedRoute>
        ),
      },
      {
        path: 'researcher/:userId/*',
        element: <LegacyResearcherPortalRedirect />,
      },
      {
        path: ':role/*',
        element: <LegacyDashboardRoleRedirect />,
      },
    ],
  },
  {
    path: '/researcher/:userId',
    element: (
      <ProtectedRoute>
        <ResearcherPortalGuard />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='dashboard' replace /> },
      { path: 'dashboard', element: <ResearcherDashboard /> },
      { path: 'supervisions', element: <SupervisionListPage /> },
      {
        path: 'supervisions/new',
        element: <AssistantCreateSupervisionRedirect />,
      },
      {
        path: 'supervisions/:supervisionId/edit',
        element: <AssistantCreateSupervisionRedirect />,
      },
      {
        path: 'supervisions/:supervisionId',
        element: <SupervisionDetailPage />,
      },
      { path: 'reviews', element: <ValidationQueuePage /> },
      {
        path: 'reviews/:supervisionId',
        element: <ValidationDetailPage />,
      },
      { path: 'history', element: <ValidationHistoryPage /> },
      { path: 'statistics', element: <StatisticsReportsPage /> },
      { path: 'profile', element: <ProfileSettingsPage /> },
    ],
  },
  {
    path: '/director',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['DIRECTOR']}>
          <DirectionPortalLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='dashboard' replace /> },
      { path: 'dashboard', element: <DirectorDashboard /> },
      { path: 'chercheurs', element: <TableChercheurs /> },
      { path: 'chercheurs/:chercheurId', element: <DetailChercheur /> },
      {
        path: 'supervisions/:supervisionId',
        element: <SupervisionDetailPage />,
      },
      { path: 'students/:studentId', element: <StudentDetailPage /> },
      { path: 'search', element: <DirectionSearchPage /> },
      { path: 'reports', element: <DirectionReportsPage /> },
      {
        path: 'statistics',
        element: <Navigate to={ROUTES.DIRECTOR_REPORTS} replace />,
      },
      {
        path: 'supervisions',
        element: <Navigate to={ROUTES.DIRECTOR_SEARCH} replace />,
      },
      {
        path: 'validation',
        element: <Navigate to={ROUTES.DASHBOARD_DIRECTOR} replace />,
      },
      { path: 'profile', element: <DirectionProfilePage /> },
    ],
  },
  {
    path: '/assistant',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ASSISTANT']}>
          <AssistantPortalLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='dashboard' replace /> },
      { path: 'dashboard', element: <AssistantDashboard /> },
      { path: 'activity', element: <AssistantActivityPage /> },
      {
        path: 'validation',
        element: <Navigate to={ROUTES.ASSISTANT_ACTIVITY} replace />,
      },
      {
        path: 'validation/:supervisionId',
        element: <AssistantValidationToSupervisionRedirect />,
      },
      { path: 'supervisions', element: <AssistantSupervisionListPage /> },
      { path: 'supervisions/new', element: <CreateSupervisionPage /> },
      {
        path: 'supervisions/:supervisionId/edit',
        element: <EditSupervisionPage />,
      },
      {
        path: 'supervisions/:supervisionId',
        element: <SupervisionDetailPage />,
      },
      { path: 'students', element: <StudentManagementPage /> },
      { path: 'students/register', element: <RegisterStudentPage /> },
      { path: 'students/:studentId/edit', element: <EditStudentPage /> },
      { path: 'students/:studentId', element: <StudentDetailPage /> },
      { path: 'themes', element: <ThemeManagementPage /> },
      { path: 'themes/new', element: <ThemeRegisterPage /> },
      { path: 'themes/:themeId/edit', element: <ThemeEditPage /> },
      { path: 'themes/:themeId', element: <ThemeDetailPage /> },
      { path: 'history', element: <ValidationHistoryPage /> },
      { path: 'profile', element: <AssistantProfilePage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          <AdminPortalLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='dashboard' replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/new', element: <CreateUserPage /> },
      { path: 'users/:userId/edit', element: <EditUserPage /> },
      { path: 'teams/new', element: <CreateTeamPage /> },
      { path: 'teams/:teamId/edit', element: <EditTeamPage /> },
      { path: 'teams/:teamId', element: <TeamDetailPage /> },
      { path: 'teams', element: <TeamManagementPage /> },
      { path: 'themes', element: <ThemeManagementPage /> },
      { path: 'themes/new', element: <ThemeRegisterPage /> },
      { path: 'themes/:themeId/edit', element: <ThemeEditPage /> },
      { path: 'themes/:themeId', element: <ThemeDetailPage /> },
      { path: 'audit-logs', element: <AuditLogPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
