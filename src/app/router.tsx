import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { getDashboardPath, getResearcherDashboardPath } from '@/config/routes'
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
import DirectorSupervisionListPage from '@/features/supervisions/pages/DirectorSupervisionListPage'
import {
  StudentManagementPage,
  StudentDetailPage,
  EditStudentPage,
  RegisterStudentPage,
} from '@/features/students/pages'
import ProfileSettingsPage from '@/features/profile/pages/ProfileSettingsPage'
import StatisticsReportsPage from '@/features/statistics/pages/StatisticsReportsPage'
import AdminPage from '@/features/admin/pages'
import ResearcherDashboard from '@/features/dashboard/pages/ResearcherDashboard'
import DirectorDashboard from '@/features/dashboard/pages/DirectorDashboard'
import AssistantDashboard from '@/features/dashboard/pages/AssistantDashboard'
import { AssistantPortalLayout } from '@/layouts/AssistantPortalLayout'
import AdminDashboard from '@/features/dashboard/pages/AdminDashboard'
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
      { path: 'statistics', element: <StatisticsReportsPage /> },
      { path: 'profile', element: <ProfileSettingsPage /> },
    ],
  },
  {
    path: '/director',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['DIRECTOR']}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='dashboard' replace /> },
      { path: 'dashboard', element: <DirectorDashboard /> },
      { path: 'supervisions', element: <DirectorSupervisionListPage /> },
      { path: 'validation', element: <ValidationQueuePage /> },
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
      { path: 'validation', element: <ValidationQueuePage /> },
      { path: 'validation/:supervisionId', element: <ValidationDetailPage /> },
      { path: 'supervisions', element: <AssistantSupervisionListPage /> },
      { path: 'history', element: <ValidationHistoryPage /> },
      { path: 'profile', element: <AssistantProfilePage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['ADMIN']}>
          <DashboardLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to='dashboard' replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
])
