import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  ListOrdered,
  ClipboardCheck,
  BarChart3,
  Settings,
} from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { useTheme } from '@/shared/context/ThemeContext'
import {
  ROUTES,
  getResearcherDashboardPath,
  getResearcherReviewsPath,
  getResearcherSupervisionsPath,
  getResearcherSupervisionDetailPath,
  getResearcherReviewDetailPath,
  getResearcherStatisticsPath,
  getResearcherProfilePath,
} from '@/config/routes'
import { PortalShell } from '@/layouts/PortalShell'
import {
  useNotifications,
  useMarkNotificationRead,
} from '@/features/notifications/hooks/useNotifications'

const RESEARCHER_NAV: {
  key: string
  labelKey: string
  getPath: (researcherId: string) => string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  isActive?: (pathname: string, researcherId: string) => boolean
}[] = [
  {
    key: 'dashboard',
    labelKey: 'common.dashboard',
    getPath: (id) => getResearcherDashboardPath(id),
    icon: LayoutDashboard,
  },
  {
    key: 'reviews',
    labelKey: 'researcher.reviews.nav',
    getPath: (id) => getResearcherReviewsPath(id),
    icon: ClipboardCheck,
    isActive: (path, id) =>
      path.startsWith(getResearcherReviewsPath(id) + '/') ||
      path === getResearcherReviewsPath(id),
  },
  {
    key: 'supervisions',
    labelKey: 'common.supervisions',
    getPath: (id) => getResearcherSupervisionsPath(id),
    icon: ListOrdered,
    isActive: (path, id) => path.startsWith(getResearcherSupervisionsPath(id)),
  },
  {
    key: 'statistics',
    labelKey: 'common.statisticsReports',
    getPath: (id) => getResearcherStatisticsPath(id),
    icon: BarChart3,
  },
  {
    key: 'profile',
    labelKey: 'common.profileSettings',
    getPath: (id) => getResearcherProfilePath(id),
    icon: Settings,
  },
]

const PAGE_TITLE_KEYS: Record<string, string> = {
  dashboard: 'common.dashboard',
  reviews: 'researcher.reviews.nav',
  supervisions: 'common.supervisions',
  statistics: 'common.statisticsReports',
  profile: 'common.profileSettings',
}

function getPageKey(pathname: string, researcherId: string): string {
  const item = RESEARCHER_NAV.find((nav) => {
    if (nav.isActive) return nav.isActive(pathname, researcherId)
    const path = nav.getPath(researcherId)
    return pathname === path || pathname.startsWith(path + '/')
  })
  return item?.key ?? 'dashboard'
}

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

export function ResearcherPortalLayout() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const researcherId = currentUser?.id ?? ''

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const pageKey = getPageKey(location.pathname, researcherId)
  const pageTitle = t(PAGE_TITLE_KEYS[pageKey] ?? 'common.dashboard')
  const initials = getInitials(currentUser?.name, currentUser?.email)

  const { data: notifications = [] } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()

  return (
    <PortalShell
      portalLabel={t('common.researcher')}
      pageTitle={pageTitle}
      currentUserName={currentUser?.name}
      initials={initials}
      navItems={RESEARCHER_NAV.map((item) => ({
        key: item.key,
        label: t(item.labelKey),
        path: item.getPath(researcherId),
        icon: item.icon,
      }))}
      selectedKey={pageKey}
      isDark={isDark}
      onThemeToggle={toggleTheme}
      onLogout={handleLogout}
      notifications={notifications}
      onNotificationRead={(notificationId) => {
        markRead(notificationId)
      }}
      onNotificationSelect={(notification) => {
        if (!notification.supervisionId) return
        if (
          notification.type === 'NEW_SUBMISSION' ||
          notification.type === 'RESUBMISSION'
        ) {
          navigate(
            getResearcherReviewDetailPath(
              researcherId,
              notification.supervisionId,
            ),
          )
          return
        }
        navigate(
          getResearcherSupervisionDetailPath(
            researcherId,
            notification.supervisionId,
          ),
        )
      }}
    >
      <Outlet />
    </PortalShell>
  )
}
