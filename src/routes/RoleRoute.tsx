import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext";
import { ROUTES } from "@/config/routes";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { currentUser, isAuthenticated } = useAuthContext();
  const allowed = allowedRoles.includes(currentUser?.role ?? "");
  if (!isAuthenticated || !currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!allowed) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
