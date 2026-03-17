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

/** Base path for a researcher's portal: /dashboard/researcher/:researcherId */
export function getResearcherBasePath(researcherId: string): string {
  return `/dashboard/researcher/${researcherId}`;
}

/** Researcher dashboard (landing page). */
export function getResearcherDashboardPath(researcherId: string): string {
  return getResearcherBasePath(researcherId);
}

/** Researcher supervisions list. */
export function getResearcherSupervisionsPath(researcherId: string): string {
  return `${getResearcherBasePath(researcherId)}/supervisions`;
}

/** Researcher create supervision. */
export function getResearcherSupervisionNewPath(researcherId: string): string {
  return `${getResearcherBasePath(researcherId)}/supervisions/new`;
}

/** Researcher supervision detail. */
export function getResearcherSupervisionDetailPath(researcherId: string, supervisionId: string): string {
  return `${getResearcherBasePath(researcherId)}/supervisions/${supervisionId}`;
}

/** Researcher edit supervision. */
export function getSupervisionEditPath(researcherId: string, supervisionId: string): string {
  return `${getResearcherBasePath(researcherId)}/supervisions/${supervisionId}/edit`;
}

/** Researcher student management. */
export function getResearcherStudentsPath(researcherId: string): string {
  return `${getResearcherBasePath(researcherId)}/students`;
}

/** Researcher statistics & reports. */
export function getResearcherStatisticsPath(researcherId: string): string {
  return `${getResearcherBasePath(researcherId)}/statistics`;
}

/** Researcher profile & settings. */
export function getResearcherProfilePath(researcherId: string): string {
  return `${getResearcherBasePath(researcherId)}/profile`;
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
