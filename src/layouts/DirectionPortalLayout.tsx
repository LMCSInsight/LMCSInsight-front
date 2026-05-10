import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Search,
  FileBarChart2,
  Settings,
} from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/config/routes'
import { PortalShell, type PortalNavItem } from '@/layouts/PortalShell'
import {
  useNotifications,
  useMarkNotificationRead,
} from '@/features/notifications/hooks/useNotifications'

function getInitials(
  name: string | undefined,
  email: string | undefined,
): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase()
    }
    return parts[0].charAt(0).toUpperCase()
  }
  if (email?.trim()) return email.trim().slice(0, 2).toUpperCase()
  return '?'
}

function getSelectedKey(
  pathname: string,
  paths: Record<string, string>,
): string {
  if (
    pathname.includes('/director/supervisions/') ||
    pathname.includes('/director/students/')
  ) {
    return 'search'
  }
  const entries = Object.entries(paths)
  const match = entries.find(
    ([, path]) => pathname === path || pathname.startsWith(path + '/'),
  )
  return match?.[0] ?? 'dashboard'
}

function getPageTitleKey(pathname: string): string {
  if (pathname.includes('/director/supervisions/'))
    return 'director.pageTitles.supervisionDetail'
  if (pathname.includes('/director/students/'))
    return 'director.pageTitles.studentDetail'
  if (/^\/director\/chercheurs\/.+/.test(pathname))
    return 'director.pageTitles.researcherDetail'
  if (pathname.startsWith(ROUTES.DIRECTOR_CHERCHEURS))
    return 'director.pageTitles.workload'
  if (pathname.startsWith(ROUTES.DIRECTOR_SEARCH))
    return 'director.pageTitles.search'
  if (pathname.startsWith(ROUTES.DIRECTOR_REPORTS))
    return 'director.pageTitles.reports'
  if (pathname.startsWith(ROUTES.DIRECTOR_PROFILE))
    return 'director.pageTitles.profile'
  return 'director.pageTitles.dashboard'
}

export function DirectionPortalLayout() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: notifications = [] } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()

  const navPaths = useMemo(
    () => ({
      dashboard: ROUTES.DASHBOARD_DIRECTOR,
      chercheurs: ROUTES.DIRECTOR_CHERCHEURS,
      search: ROUTES.DIRECTOR_SEARCH,
      reports: ROUTES.DIRECTOR_REPORTS,
      profile: ROUTES.DIRECTOR_PROFILE,
    }),
    [],
  )

  const DIRECTION_NAV: PortalNavItem[] = useMemo(
    () => [
      {
        key: 'dashboard',
        label: t('director.nav.dashboard'),
        path: ROUTES.DASHBOARD_DIRECTOR,
        icon: LayoutDashboard,
      },
      {
        key: 'chercheurs',
        label: t('director.nav.workload'),
        path: ROUTES.DIRECTOR_CHERCHEURS,
        icon: Users,
      },
      {
        key: 'search',
        label: t('director.nav.search'),
        path: ROUTES.DIRECTOR_SEARCH,
        icon: Search,
      },
      {
        key: 'reports',
        label: t('director.nav.reports'),
        path: ROUTES.DIRECTOR_REPORTS,
        icon: FileBarChart2,
      },
      {
        key: 'profile',
        label: t('director.nav.profile'),
        path: ROUTES.DIRECTOR_PROFILE,
        icon: Settings,
      },
    ],
    [t],
  )

  const selectedKey = getSelectedKey(location.pathname, navPaths)
  const pageTitle = t(getPageTitleKey(location.pathname))

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <PortalShell
      portalLabel={t('common.director')}
      pageTitle={pageTitle}
      currentUserName={currentUser?.name}
      initials={getInitials(currentUser?.name, currentUser?.email)}
      navItems={DIRECTION_NAV}
      selectedKey={selectedKey}
      isDark={isDark}
      onThemeToggle={toggleTheme}
      onLogout={handleLogout}
      notifications={notifications}
      onNotificationRead={(notificationId) => {
        markRead(notificationId)
      }}
      mainClassName='min-w-0 flex-1 p-6 lg:p-8 mx-auto w-full max-w-[min(100%,90rem)]'
    >
      <Outlet />
    </PortalShell>
  )
}
