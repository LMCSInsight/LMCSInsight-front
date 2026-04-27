import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Users, BarChart3, Settings } from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/config/routes'
import { PortalShell, type PortalNavItem } from '@/layouts/PortalShell'
import {
  useNotifications,
  useMarkNotificationRead,
} from '@/features/notifications/hooks/useNotifications'

const DIRECTION_NAV: PortalNavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD_DIRECTOR,
    icon: LayoutDashboard,
  },
  {
    key: 'chercheurs',
    label: 'Charge d’encadrement',
    path: ROUTES.DIRECTOR_CHERCHEURS,
    icon: Users,
  },
  {
    key: 'statistics',
    label: 'Statistiques et rapports',
    path: ROUTES.DIRECTOR_STATISTICS,
    icon: BarChart3,
  },
  {
    key: 'profile',
    label: 'Profil et paramètres',
    path: ROUTES.DIRECTOR_PROFILE,
    icon: Settings,
  },
]

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

function getSelectedKey(pathname: string): string {
  const match = DIRECTION_NAV.find(
    (item) => pathname === item.path || pathname.startsWith(item.path + '/'),
  )
  return match?.key ?? 'dashboard'
}

function getPageTitle(key: string): string {
  switch (key) {
    case 'chercheurs':
      return 'Charge d’encadrement'
    case 'statistics':
      return 'Statistiques et rapports'
    case 'profile':
      return 'Profil et paramètres'
    default:
      return 'Dashboard'
  }
}

export function DirectionPortalLayout() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: notifications = [] } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const selectedKey = getSelectedKey(location.pathname)

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <PortalShell
      portalLabel={t('common.director')}
      pageTitle={getPageTitle(selectedKey)}
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
    >
      <Outlet />
    </PortalShell>
  )
}
