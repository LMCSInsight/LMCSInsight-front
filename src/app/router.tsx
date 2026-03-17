import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { getDashboardPath, getResearcherDashboardPath } from "@/config/routes";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { useAuthContext } from "@/shared/context/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ResearcherPortalLayout } from "@/layouts/ResearcherPortalLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import SupervisionListPage from "@/features/supervisions/pages/SupervisionListPage";
import SupervisionDetailPage from "@/features/supervisions/pages/SupervisionDetailPage";
import CreateSupervisionPage from "@/features/supervisions/pages/CreateSupervisionPage";
import EditSupervisionPage from "@/features/supervisions/pages/EditSupervisionPage";
import StudentManagementPage from "@/features/students/pages/StudentManagementPage";
import ProfileSettingsPage from "@/features/profile/pages/ProfileSettingsPage";
import StatisticsReportsPage from "@/features/statistics/pages/StatisticsReportsPage";
import ResearcherDashboard from "@/features/dashboard/pages/ResearcherDashboard";
import DirectorDashboard from "@/features/dashboard/pages/DirectorDashboard";
import AssistantDashboard from "@/features/dashboard/pages/AssistantDashboard";
import AdminDashboard from "@/features/dashboard/pages/AdminDashboard";

/** Guard: ensure current user is the researcher for :researcherId, then render ResearcherPortalLayout (with Outlet). */
function ResearcherPortalGuard() {
  const { researcherId } = useParams<{ researcherId: string }>();
  const { currentUser } = useAuthContext();
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (currentUser.role !== "RESEARCHER") {
    return <Navigate to={getDashboardPath(currentUser.role, currentUser)} replace />;
  }
  if (!researcherId || researcherId !== currentUser.id) {
    return <Navigate to={getResearcherDashboardPath(currentUser.id)} replace />;
  }
  return <ResearcherPortalLayout />;
}

function ResearcherRedirectToOwnPortal() {
  const { currentUser } = useAuthContext();
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (currentUser.role !== "RESEARCHER") {
    return <Navigate to={getDashboardPath(currentUser.role, currentUser)} replace />;
  }
  return <Navigate to={getResearcherDashboardPath(currentUser.id)} replace />;
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
      { path: "login", element: <LoginPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
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
        path: "researcher",
        element: (
          <ProtectedRoute>
            <ResearcherRedirectToOwnPortal />
          </ProtectedRoute>
        ),
      },
      {
        path: "researcher/:researcherId",
        element: (
          <ProtectedRoute>
            <ResearcherPortalGuard />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <ResearcherDashboard /> },
          { path: "supervisions", element: <SupervisionListPage /> },
          { path: "supervisions/new", element: <CreateSupervisionPage /> },
          { path: "supervisions/:id", element: <SupervisionDetailPage /> },
          { path: "supervisions/:id/edit", element: <EditSupervisionPage /> },
          { path: "students", element: <StudentManagementPage /> },
          { path: "statistics", element: <StatisticsReportsPage /> },
          { path: "profile", element: <ProfileSettingsPage /> },
        ],
      },
      {
        path: "director",
        element: (
          <RoleRoute allowedRoles={["DIRECTOR"]}>
            <DirectorDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "assistant",
        element: (
          <RoleRoute allowedRoles={["ASSISTANT"]}>
            <AssistantDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleRoute>
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
]);
