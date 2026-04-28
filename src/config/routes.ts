export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  LOGIN: '/auth/login',
  FORGOT_PASSWORD: '/auth/forgot-password',
  DASHBOARD: '/dashboard',
  DASHBOARD_RESEARCHER: '/researcher',
  DASHBOARD_DIRECTOR: '/director/dashboard',
  DASHBOARD_ASSISTANT: '/assistant/dashboard',
  DASHBOARD_ADMIN: '/admin/dashboard',
  DIRECTOR_SUPERVISIONS: '/director/supervisions',
  DIRECTOR_VALIDATION: '/director/validation',
  DIRECTOR_CHERCHEURS: '/director/chercheurs',
  DIRECTOR_STATISTICS: '/director/statistics',
  DIRECTOR_PROFILE: '/director/profile',
  /** Primary: org-wide activity list (read-only, assistant). */
  ASSISTANT_ACTIVITY: '/assistant/activity',
  /** Legacy: redirects to {@link ROUTES.ASSISTANT_ACTIVITY}. */
  ASSISTANT_VALIDATION: '/assistant/validation',
  ASSISTANT_VALIDATION_DETAIL: '/assistant/validation/:supervisionId',
  ASSISTANT_SUPERVISIONS: '/assistant/supervisions',
  ASSISTANT_HISTORY: '/assistant/history',
  ASSISTANT_PROFILE: '/assistant/profile',
  ASSISTANT_STUDENTS: '/assistant/students',
  /** Assistant research themes (thématiques). */
  ASSISTANT_THEMES: '/assistant/themes',
  ADMIN_USERS: '/admin/users',
  SUPERVISIONS: '/supervisions',
  STUDENTS: '/students',
  VALIDATION: '/validation',
  ADMIN: '/admin',
} as const

/** Role values as returned by the backend (uppercase). */
export type AppRole = 'ADMIN' | 'DIRECTOR' | 'RESEARCHER' | 'ASSISTANT'

/** Base path for a researcher's portal: /researcher/:userId */
export function getResearcherBasePath(userId: string): string {
  return `/researcher/${userId}`
}

/** Researcher dashboard (landing page). */
export function getResearcherDashboardPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/dashboard`
}

/** Researcher supervisions list. */
export function getResearcherSupervisionsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/supervisions`
}

/** Researcher create supervision (legacy; creation is assistant-only). */
export function getResearcherSupervisionNewPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/supervisions/new`
}

/** Researcher: queue of supervisions assigned to the user as main supervisor (PENDING). */
export function getResearcherReviewsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/reviews`
}

export function getResearcherReviewDetailPath(
  userId: string,
  supervisionId: string,
): string {
  return `${getResearcherBasePath(userId)}/reviews/${supervisionId}`
}

/** Researcher: validation / decision history (API scoped to the logged-in user). */
export function getResearcherHistoryPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/history`
}

/** Researcher supervision detail. */
export function getResearcherSupervisionDetailPath(
  userId: string,
  supervisionId: string,
): string {
  return `${getResearcherBasePath(userId)}/supervisions/${supervisionId}`
}

/** Researcher edit supervision. */
export function getSupervisionEditPath(
  userId: string,
  supervisionId: string,
): string {
  return `${getResearcherBasePath(userId)}/supervisions/${supervisionId}/edit`
}

/** Researcher student management. */
export function getResearcherStudentsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/students`
}

/** Researcher student detail. */
export function getResearcherStudentDetailPath(
  userId: string,
  studentId: string,
): string {
  return `${getResearcherBasePath(userId)}/students/${studentId}`
}

/** Researcher student edit. */
export function getResearcherStudentEditPath(
  userId: string,
  studentId: string,
): string {
  return `${getResearcherBasePath(userId)}/students/${studentId}/edit`
}

/** Researcher register student. */
export function getResearcherStudentRegisterPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/students/register`
}

/** Researcher statistics & reports. */
export function getResearcherStatisticsPath(userId: string): string {
  return `${getResearcherBasePath(userId)}/statistics`
}

/** Researcher profile & settings. */
export function getResearcherProfilePath(userId: string): string {
  return `${getResearcherBasePath(userId)}/profile`
}

export function getAssistantStudentsPath(): string {
  return '/assistant/students'
}

export function getAssistantStudentDetailPath(studentId: string): string {
  return `/assistant/students/${studentId}`
}

export function getAssistantStudentEditPath(studentId: string): string {
  return `/assistant/students/${studentId}/edit`
}

export function getAssistantStudentRegisterPath(): string {
  return '/assistant/students/register'
}

export function getAssistantThemesPath(): string {
  return ROUTES.ASSISTANT_THEMES
}

export function getAssistantThemeNewPath(): string {
  return '/assistant/themes/new'
}

export function getAssistantThemeDetailPath(themeId: string): string {
  return `/assistant/themes/${themeId}`
}

export function getAssistantThemeEditPath(themeId: string): string {
  return `/assistant/themes/${themeId}/edit`
}

export function getAssistantActivityPath(): string {
  return ROUTES.ASSISTANT_ACTIVITY
}

/** Assistant validation detail: /assistant/validation/:supervisionId */
export function getAssistantValidationDetailPath(
  supervisionId: string,
): string {
  return `/assistant/validation/${supervisionId}`
}

/** Assistant supervision detail (read-only view): /assistant/supervisions/:supervisionId */
export function getAssistantSupervisionDetailPath(
  supervisionId: string,
): string {
  return `/assistant/supervisions/${supervisionId}`
}

export function getAssistantSupervisionNewPath(): string {
  return '/assistant/supervisions/new'
}

export function getAssistantSupervisionEditPath(supervisionId: string): string {
  return `/assistant/supervisions/${supervisionId}/edit`
}

/** Default dashboard path for each role after login. Pass user for RESEARCHER to get /researcher/:id/dashboard. */
export function getDashboardPath(
  role: string,
  user?: { id: string } | null,
): string {
  if (role === 'RESEARCHER' && user?.id) {
    return getResearcherDashboardPath(user.id)
  }
  const pathMap: Record<AppRole, string> = {
    ADMIN: ROUTES.DASHBOARD_ADMIN,
    DIRECTOR: ROUTES.DASHBOARD_DIRECTOR,
    RESEARCHER: ROUTES.DASHBOARD_RESEARCHER,
    ASSISTANT: ROUTES.DASHBOARD_ASSISTANT,
  }
  return pathMap[role as AppRole] ?? ROUTES.DASHBOARD_RESEARCHER
}
