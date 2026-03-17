export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  DASHBOARD: "/dashboard",
  DASHBOARD_RESEARCHER: "/dashboard/researcher",
  DASHBOARD_DIRECTOR: "/dashboard/director",
  DASHBOARD_ASSISTANT: "/dashboard/assistant",
  DASHBOARD_ADMIN: "/dashboard/admin",
  SUPERVISIONS: "/supervisions",
  STUDENTS: "/students",
  VALIDATION: "/validation",
  ADMIN: "/admin",
} as const;

/** Role values as returned by the backend (uppercase). */
export type AppRole = "ADMIN" | "DIRECTOR" | "RESEARCHER" | "ASSISTANT";

/** Researcher (chercheur) dashboard path including their id (use for redirect and sidebar). */
export function getResearcherDashboardPath(researcherId: string): string {
  return `/dashboard/researcher/${researcherId}`;
}

/** Default dashboard path for each role after login. Pass user for RESEARCHER to get /dashboard/researcher/:id. */
export function getDashboardPath(role: string, user?: { id: string } | null): string {
  if (role === "RESEARCHER" && user?.id) {
    return getResearcherDashboardPath(user.id);
  }
  const pathMap: Record<AppRole, string> = {
    ADMIN: ROUTES.DASHBOARD_ADMIN,
    DIRECTOR: ROUTES.DASHBOARD_DIRECTOR,
    RESEARCHER: ROUTES.DASHBOARD_RESEARCHER,
    ASSISTANT: ROUTES.DASHBOARD_ASSISTANT,
  };
  return pathMap[role as AppRole] ?? ROUTES.DASHBOARD_RESEARCHER;
}
