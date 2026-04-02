export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  LOGIN: "/auth/login",
  FORGOT_PASSWORD: "/auth/forgot-password",
  DASHBOARD: "/dashboard",
  DASHBOARD_RESEARCHER: "/researcher",
  DASHBOARD_DIRECTOR: "/director/dashboard",
  DASHBOARD_ASSISTANT: "/assistant/dashboard",
  DASHBOARD_ADMIN: "/admin/dashboard",
  DIRECTOR_SUPERVISIONS: "/director/supervisions",
  DIRECTOR_VALIDATION: "/director/validation",
  ASSISTANT_VALIDATION: "/assistant/validation",
  ADMIN_USERS: "/admin/users",
  SUPERVISIONS: "/supervisions",
  STUDENTS: "/students",
  VALIDATION: "/validation",
  ADMIN: "/admin",
} as const;

/** Role values as returned by the backend (uppercase). */
export type AppRole = "ADMIN" | "DIRECTOR" | "RESEARCHER" | "ASSISTANT";

/** Base path for a researcher's portal: /researcher/:userId */
export function getResearcherBasePath(userId: string): string {
  return `/researcher/${userId}`;
}

/** Researcher dashboard (landing page). */
export function getResearcherDashboardPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/dashboard`;
}

/** Researcher supervisions list. */
export function getResearcherSupervisionsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/supervisions`;
}

/** Researcher create supervision. */
export function getResearcherSupervisionNewPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/supervisions/new`;
}

/** Researcher supervision detail. */
export function getResearcherSupervisionDetailPath(userId: string, supervisionId: string): string {
  return `${getResearcherBasePath(userId)}/supervisions/${supervisionId}`;
}

/** Researcher edit supervision. */
export function getSupervisionEditPath(userId: string, supervisionId: string): string {
  return `${getResearcherBasePath(userId)}/supervisions/${supervisionId}/edit`;
}

/** Researcher student management. */
export function getResearcherStudentsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/students`;
}

/** Researcher student detail. */
export function getResearcherStudentDetailPath(userId: string, studentId: string): string {
  return `${getResearcherBasePath(userId)}/students/${studentId}`;
}

/** Researcher student edit. */
export function getResearcherStudentEditPath(userId: string, studentId: string): string {
  return `${getResearcherBasePath(userId)}/students/${studentId}/edit`;
}

/** Researcher register student. */
export function getResearcherStudentRegisterPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/students/register`;
}

/** Researcher statistics & reports. */
export function getResearcherStatisticsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/statistics`;
}

/** Researcher profile & settings. */
export function getResearcherProfilePath(userId: string): string {
  return `${getResearcherBasePath(userId)}/profile`;
}

/** Default dashboard path for each role after login. Pass user for RESEARCHER to get /researcher/:id/dashboard. */
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
