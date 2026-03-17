import { createBrowserRouter, Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { getDashboardPath, getResearcherDashboardPath } from "@/config/routes";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { useAuthContext } from "@/shared/context/AuthContext";
import { MainLayout } from "@/layouts/MainLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import SupervisionListPage from "@/features/supervisions/pages/SupervisionListPage";
import SupervisionDetailPage from "@/features/supervisions/pages/SupervisionDetailPage";
import ResearcherDashboard from "@/features/dashboard/pages/ResearcherDashboard";
import DirectorDashboard from "@/features/dashboard/pages/DirectorDashboard";
import AssistantDashboard from "@/features/dashboard/pages/AssistantDashboard";
import AdminDashboard from "@/features/dashboard/pages/AdminDashboard";

function ResearcherDashboardRoute() {
  const { researcherId } = useParams<{ researcherId: string }>();
  const { currentUser } = useAuthContext();
  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (currentUser.role !== "RESEARCHER") {
    return <Navigate to={getDashboardPath(currentUser.role, currentUser)} replace />;
  }
  if (researcherId !== currentUser.id) {
    return <Navigate to={getResearcherDashboardPath(currentUser.id)} replace />;
  }
  return <ResearcherDashboard />;
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
            <ResearcherDashboardRoute />
          </ProtectedRoute>
        ),
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
  {
    path: ROUTES.SUPERVISIONS,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SupervisionListPage /> },
      { path: ":id", element: <SupervisionDetailPage /> },
    ],
  },
  { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
]);
