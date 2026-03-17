import { createBrowserRouter, Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import SupervisionListPage from "@/features/supervisions/pages/SupervisionListPage";
import SupervisionDetailPage from "@/features/supervisions/pages/SupervisionDetailPage";
import TeacherDashboard from "@/features/dashboard/pages/TeacherDashboard";
import DirectorDashboard from "@/features/dashboard/pages/DirectorDashboard";
import AssistantDashboard from "@/features/dashboard/pages/AssistantDashboard";

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
        path: "teacher",
        element: (
          <RoleRoute allowedRoles={["teacher"]}>
            <TeacherDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "director",
        element: (
          <RoleRoute allowedRoles={["director"]}>
            <DirectorDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "assistant",
        element: (
          <RoleRoute allowedRoles={["assistant"]}>
            <AssistantDashboard />
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
